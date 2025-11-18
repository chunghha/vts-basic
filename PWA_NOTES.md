# PWA Configuration Notes

## Status

PWA plugin (`vite-plugin-pwa@1.1.0`) has been installed and configured in `vite.config.ts`.

## What Works

✅ **PWA Manifest**: Successfully generated (`manifest.webmanifest`)  
✅ **Configuration**: Workbox caching strategies defined  
✅ **Build**: No errors during build process

## Current Limitation

⚠️ **Service Worker Generation**: The service worker file (`sw.js`) is not being generated in the build output.

**Likely Cause**: Compatibility issue between `vite-plugin-pwa` and TanStack Start's SSR architecture.

**Evidence**:
- `registerSW.js` is generated and tries to register `/sw.js`
- `sw.js` file is not present in `dist/client/`
- No errors or warnings during build

## Configuration Details

### Caching Strategies Defined

1. **Static Assets** (JS, CSS, HTML, fonts):
   - Pattern: `**/*.{js,css,html,svg,png,woff,woff2}`
   - Precached on install

2. **Countries API**:
   - Pattern: `https://restcountries.com/**`
   - Strategy: CacheFirst
   - Max entries: 10
   - Max age: 7 days

3. **Flag Images**:
   - Pattern: `https://flagcdn.com/**`
   - Strategy: CacheFirst
   - Max entries: 300
   - Max age: 30 days

### PWA Manifest

```json
{
  "name": "VTS Basic",
  "short_name": "VTS",
  "description": "A lightweight starter with Tailwind CSS and DaisyUI",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone",
  "icons": [...]
}
```

## Next Steps

To fully enable PWA functionality, one of the following approaches is needed:

### Option 1: Manual Service Worker
Create a custom service worker file manually and place it in the `public/` directory.

### Option 2: Alternative Plugin
Research alternative PWA plugins that are compatible with TanStack Start.

### Option 3: Workbox CLI
Use Workbox CLI directly to generate the service worker post-build.

### Option 4: Wait for Plugin Update
Monitor `vite-plugin-pwa` for updates that support TanStack Start's SSR architecture.

## Recommendation

For now, the PWA manifest is in place and the caching configuration is defined. The app can be enhanced with a manual service worker implementation if offline support is critical.

The current configuration provides:
- ✅ PWA manifest (installability)
- ✅ Defined caching strategies (ready to use)
- ❌ Active service worker (needs manual implementation)

## Files Modified

- `vite.config.ts`: Added VitePWA plugin configuration
- `package.json`: Added `vite-plugin-pwa@1.1.0` dev dependency

## References

- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [TanStack Start Documentation](https://tanstack.com/start)
