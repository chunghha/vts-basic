/**
 * SafeAny is an alias for any that can be used to bypass strict type checking
 * in cases where a more specific type is either not known or not applicable,
 * but where we want to explicitly mark the usage as intentional.
 */
// biome-ignore lint/suspicious/noExplicitAny: Intentional escape hatch for cases where specific types are impractical
export type SafeAny = any
