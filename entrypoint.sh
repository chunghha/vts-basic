#!/bin/sh
# entrypoint.sh - Unified startup script for Bun SSR server + Rust proxy
#
# Responsibilities:
# 1. Start Bun SSR server (serves dynamic HTML, API, server-side routing)
# 2. Wait until SSR port responds (basic readiness probe)
# 3. Start Rust proxy (serves static assets + reverse proxy to SSR)
# 4. Forward termination signals and exit if either child dies
# 5. Run as non-root (assumed Dockerfile created `appuser`)
#
# Environment variables honored:
#   PORT        -> SSR server port (default 8081)
#   PROXY_PORT  -> Proxy public port (default 3000)
#   RUST_LOG    -> Rust tracing log level (default info)
#   STARTUP_TIMEOUT_SECONDS -> Max time to wait for SSR readiness (default 15)
#
# Exit codes:
#   0   Graceful shutdown
#   1   SSR failed or exited unexpectedly
#   2   Proxy failed or exited unexpectedly
#   3   Readiness timeout
#
# This script uses only POSIX sh features for maximal portability.

set -eu

# -------- Configuration --------
SSR_PORT="${PORT:-8081}"
PROXY_PORT="${PROXY_PORT:-3000}"
RUST_LOG="${RUST_LOG:-info}"
STARTUP_TIMEOUT_SECONDS="${STARTUP_TIMEOUT_SECONDS:-15}"

export RUST_LOG

# -------- Utility Functions --------
log() {
  # Timestamped log line
  # shellcheck disable=SC2039
  printf '%s %s\n' "$(date +'%Y-%m-%dT%H:%M:%S%z')" "$*"
}

fatal() {
  log "[fatal] $*"
  exit "${2:-1}"
}

wait_for_port() {
  # Args: host port timeout_seconds
  host="$1"
  port="$2"
  timeout="$3"

  log "[wait] Waiting for ${host}:${port} (timeout ${timeout}s)"

  start_ts=$(date +%s)
  while :; do
    if curl -fs "http://${host}:${port}/" >/dev/null 2>&1; then
      log "[wait] Port ${port} on ${host} is ready"
      return 0
    fi
    now_ts=$(date +%s)
    elapsed=$((now_ts - start_ts))
    if [ "${elapsed}" -ge "${timeout}" ]; then
      log "[wait] Timeout after ${elapsed}s waiting for ${host}:${port}"
      return 1
    fi
    sleep 0.5
  done
}

forward_shutdown() {
  # Attempt graceful termination
  log "[shutdown] Signal received, terminating children"
  if [ -n "${SSR_PID:-}" ] && kill -0 "${SSR_PID}" 2>/dev/null; then
    kill "${SSR_PID}" 2>/dev/null || true
  fi
  if [ -n "${PROXY_PID:-}" ] && kill -0 "${PROXY_PID}" 2>/dev/null; then
    kill "${PROXY_PID}" 2>/dev/null || true
  fi

  # Give them a moment
  sleep 1

  # Force kill if still alive
  if [ -n "${SSR_PID:-}" ] && kill -0 "${SSR_PID}" 2>/dev/null; then
    kill -9 "${SSR_PID}" 2>/dev/null || true
  fi
  if [ -n "${PROXY_PID:-}" ] && kill -0 "${PROXY_PID}" 2>/dev/null; then
    kill -9 "${PROXY_PID}" 2>/dev/null || true
  fi

  log "[shutdown] Complete"
  exit 0
}

# -------- Start SSR (Bun) --------
log "[startup] Starting Bun SSR on port ${SSR_PORT}"
PORT="${SSR_PORT}" bun run dist/server/server.js &
SSR_PID=$!
log "[startup] Bun SSR PID: ${SSR_PID}"

# -------- Wait for SSR Readiness --------
if ! wait_for_port "127.0.0.1" "${SSR_PORT}" "${STARTUP_TIMEOUT_SECONDS}"; then
  log "[error] SSR failed to become ready"
  kill "${SSR_PID}" 2>/dev/null || true
  wait "${SSR_PID}" 2>/dev/null || true
  fatal "SSR readiness timeout" 3
fi

# -------- Start Proxy (Rust) --------
log "[startup] Starting Rust proxy on port ${PROXY_PORT}"
./proxy/target/release/proxy &
PROXY_PID=$!
log "[startup] Rust proxy PID: ${PROXY_PID}"

# -------- Signal Handling --------
trap forward_shutdown INT TERM

# -------- Supervision Loop --------
log "[monitor] Supervising processes (SSR=${SSR_PID}, PROXY=${PROXY_PID})"
while :; do
  # If SSR exited
  if ! kill -0 "${SSR_PID}" 2>/dev/null; then
    log "[monitor] SSR process exited"
    if kill -0 "${PROXY_PID}" 2>/dev/null; then
      kill "${PROXY_PID}" 2>/dev/null || true
      wait "${PROXY_PID}" 2>/dev/null || true
    fi
    wait "${SSR_PID}" 2>/dev/null || true
    fatal "SSR exited unexpectedly" 1
  fi

  # If proxy exited
  if ! kill -0 "${PROXY_PID}" 2>/dev/null; then
    log "[monitor] Proxy process exited"
    if kill -0 "${SSR_PID}" 2>/dev/null; then
      kill "${SSR_PID}" 2>/dev/null || true
      wait "${SSR_PID}" 2>/dev/null || true
    fi
    fatal "Proxy exited unexpectedly" 2
  fi

  sleep 1
done
