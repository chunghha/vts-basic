/**
 * Exposes the application's version as a constant so other modules can import it
 * without directly importing package.json.
 *
 * Keep this file simple so it's safe to import from both application code and tests.
 */

import packageJson from '../../package.json'

export const APP_VERSION: string = packageJson.version
