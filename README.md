# VTS Basic

VTS Basic is a lightweight React starter that combines Tailwind CSS and DaisyUI with TanStack Router and TanStack Query. It provides a minimal, opinionated structure for quickly prototyping UI, exploring DaisyUI themes, and integrating live data (see the Countries page).

Quick highlights:
- Clean, small route surface: `/`, `/about`, `/country`
- Theme switcher powered by DaisyUI themes
- Countries page powered by REST Countries + TanStack Query
- Tailwind + DaisyUI styling and component examples
- Modern dev scripts using bun

---

## Quickstart

1. Install dependencies:
```vts-basic/README.md#L1-3
bun install
```

2. Start the dev server:
```vts-basic/README.md#L4-6
bun run dev
```

3. Open http://localhost:3000 (or the port shown in your terminal).

---

## Available Scripts

Use these from the project root (`vts-basic`).

- Start dev server:
```vts-basic/README.md#L8-10
bun run dev
```

- Build for production:
```vts-basic/README.md#L11-13
bun run build
```

- Run tests (Vitest):
```vts-basic/README.md#L14-16
bun run test
```

- Lint / format (Biome or configured tooling):
```vts-basic/README.md#L17-19
bun run lint
bun run format
```

---

## Project Structure (relevant folders)

- `src/` — application source
  - `src/pages/` — page-level components: `Home.tsx`, `about/`, `country/`, error pages
  - `src/components/` — shared UI (if present)
  - `src/routes/` — TanStack Router file-based routes (if applicable)
- `public/manifest.json` — PWA manifest, updated to "VTS Basic"

---

## Styling & Theming

- Tailwind CSS is the utility layer.
- DaisyUI provides theme variables and component classes.
- A theme switcher is included in the app header so you can preview different DaisyUI themes. Selecting a theme toggles DaisyUI's theme classes (client-side).

If you'd like to persist a theme across sessions, you can:
- Store the selected theme in `localStorage` and read it on app startup.
- Apply the theme class to the `html` or `body` element before React hydrates to avoid flash of un-themed UI.

---

## Data Fetching

The Countries page uses TanStack Query (`@tanstack/react-query`) to fetch live country data from the REST Countries API. Key patterns to follow:
- Create a `QueryClient` and wrap the app with `QueryClientProvider` (already configured).
- Use `useQuery` for fetching and caching.
- Present loading, error, and empty states for a robust UX.

---

## Routing

We use TanStack Router with a small, focused set of routes:
- `/` — Home / components showcase
- `/about` — About and usage guidance
- `/country` — Dynamic country listing (search, filter, sort)

Routes are typically file-based (see `src/routes` if used) and the root layout includes the theme switcher and top navigation.

---

## Contributing

- Keep changes small and documented.
- Add new components under `src/components` and pages under `src/pages`.
- Follow Tailwind and DaisyUI patterns for consistent theming.
- Run the linter/formatter before creating PRs:
```vts-basic/README.md#L36-38
bun run lint
bun run format
```

---

## Troubleshooting

- If styles don't show up, confirm Tailwind is compiling and the dev server is running.
- If a page is blank, check the browser console for runtime errors (missing env vars, failed fetches).
- Network or CORS errors when fetching countries are usually transient — verify connectivity and the external API.

---

## Notes

- The app is intentionally minimal and ready to be extended.
- Manifest and branding were updated to "VTS Basic". Update `public/logo192.png` and `logo512.png` if you want custom icons.
- Consider adding tests for page-level behavior (loading / error UI) and components.

---
