# PWA Documentation: Dads-cogs

## Current State: NOT A FUNCTIONAL PWA

**Assessment Date:** 2026-01-31

The application markets itself as "Mobile-First PWA" but currently **fails PWA installation criteria**. This document details what exists, what's missing, and the implementation plan.

---

## PWA Installation Checklist

| Requirement | Status | Issue |
|-------------|--------|-------|
| Valid manifest.json | PARTIAL | Missing start_url, scope |
| Icons (192x192) | MISSING | File does not exist |
| Icons (512x512) | MISSING | File does not exist |
| Service Worker | MISSING | Not implemented |
| HTTPS | N/A | Assumed for production |
| Viewport meta tag | MISSING | Not in _document.tsx |

**Verdict:** App will NOT pass Chrome PWA install prompt.

---

## Current Implementation

### Manifest (public/manifest.json)

```json
{
  "name": "Dads-cogs",
  "short_name": "Dads-cogs",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",  // FILE DOES NOT EXIST
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",  // FILE DOES NOT EXIST
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

**Issues:**
- `start_url` missing (should be "/")
- `scope` missing (should be "/")
- `icons` reference files that don't exist
- No maskable icons
- No screenshots (optional but recommended)

### Meta Tags (src/pages/_document.tsx)

```tsx
<Head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#ffffff" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Dads-cogs" />
</Head>
```

**Missing:**
- `<meta name="viewport" content="width=device-width, initial-scale=1">` - CRITICAL
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` - For iOS

### Service Worker

**Status:** NOT IMPLEMENTED

No service worker files, registration code, or PWA libraries exist in the codebase.

### Public Directory Contents

```
public/
├── favicon.ico      (15KB - exists)
└── manifest.json    (378B - exists, incomplete)
```

**Missing:**
- android-chrome-192x192.png
- android-chrome-512x512.png
- apple-touch-icon.png
- sw.js or service worker source
- offline.html

---

## Implementation Plan

### Phase 1: Make PWA Installable (P0)

**1.1 Create Icon Assets**

Required icons:
- `android-chrome-192x192.png` - Standard PWA icon
- `android-chrome-512x512.png` - High-res PWA icon
- `apple-touch-icon.png` - iOS home screen (180x180)
- Optional: Maskable variants for adaptive icons

Generation command (if source exists):
```bash
# Using sharp or similar tool
npx sharp -i logo.png -o public/android-chrome-192x192.png resize 192 192
npx sharp -i logo.png -o public/android-chrome-512x512.png resize 512 512
npx sharp -i logo.png -o public/apple-touch-icon.png resize 180 180
```

**1.2 Fix Manifest**

Update `public/manifest.json`:
```json
{
  "name": "Dads-cogs",
  "short_name": "Dads-cogs",
  "description": "Music League - Share, vote, compete",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

**1.3 Add Viewport Meta Tag**

Update `src/pages/_document.tsx`:
```tsx
<Head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="theme-color" content="#ffffff" />
  {/* ... existing tags ... */}
</Head>
```

### Phase 2: Implement Service Worker (P0)

**Recommended Library:** `@serwist/next` or `@ducanh2912/next-pwa`

**2.1 Install Dependencies**

```bash
npm install @serwist/next
npm install -D @serwist/cli
```

**2.2 Configure next.config.js**

```javascript
import withSerwist from "@serwist/next";

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
})(nextConfig);
```

**2.3 Create Service Worker (src/sw.ts)**

```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

### Phase 3: Offline Experience (P1)

**3.1 Offline Fallback Page**

Create `public/offline.html` or `src/pages/offline.tsx`:
```tsx
export default function Offline() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">You're offline</h1>
        <p className="mt-2 text-gray-600">
          Check your connection and try again
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
```

**3.2 Caching Strategy**

| Resource Type | Strategy | Rationale |
|---------------|----------|-----------|
| Static assets | Cache First | JS, CSS, images rarely change |
| API routes | Network First | Data freshness priority |
| Pages | Stale While Revalidate | Balance speed and freshness |
| Spotify images | Cache First + TTL | Album art doesn't change |

### Phase 4: Update Lifecycle (P2)

**4.1 Update Detection**

Add to `_app.tsx`:
```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            if (confirm('New version available! Reload?')) {
              window.location.reload();
            }
          }
        });
      });
    });
  }
}, []);
```

---

## Validation Commands

**Check manifest:**
```bash
# Chrome DevTools → Application → Manifest
# Or use Lighthouse PWA audit
```

**Test offline:**
```bash
# Chrome DevTools → Network → Offline checkbox
# Verify offline page shows
```

**Test install:**
```bash
# Chrome → three dots menu → "Install Dads-cogs"
# Or look for install icon in address bar
```

---

## Post-Implementation Checklist

- [ ] Icons display correctly in manifest preview
- [ ] App installs on Android Chrome
- [ ] App installs on iOS Safari (Add to Home Screen)
- [ ] Offline page shows when disconnected
- [ ] Cached pages load when offline
- [ ] Update prompt appears on new version
- [ ] Theme color matches app branding
- [ ] Splash screen displays during load

---

## References

- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Serwist Documentation](https://serwist.pages.dev/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
