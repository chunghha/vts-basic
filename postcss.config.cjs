/**
 * postcss.config.cjs
 *
 * CommonJS PostCSS configuration file.
 *
 * This project uses "type": "module" in package.json, which makes ".js"
 * files be treated as ES modules. Tailwind v4's PostCSS integration expects
 * a CommonJS config, so we provide this ".cjs" variant to ensure it is
 * loaded correctly by Vite/PostCSS.
 *
 * Plugins:
 *  - @tailwindcss/postcss: the official PostCSS adapter for Tailwind
 *  - autoprefixer: adds vendor prefixes for browser compatibility
 *
 * Note: ensure you have installed the adapter:
 *   bun add -d @tailwindcss/postcss
 * or
 *   npm i -D @tailwindcss/postcss
 */
module.exports = {
  plugins: [require("@tailwindcss/postcss"), require("autoprefixer")],
};
