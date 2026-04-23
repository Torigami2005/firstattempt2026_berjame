# Blue Links PWA - Quick Start Guide

## For Users

### Installing on Android

1. **Visit the site in Chrome**
   - Open https://yoursite.com

2. **Look for the install button**
   - You'll see a ⬇ icon in the address bar
   - Or a banner at the bottom

3. **Tap "Install"**
   - Dialog appears asking to install
   - Tap "Install" again

4. **App is ready!**
   - Appears on your home screen
   - Opens like a native app
   - Works offline automatically

### Installing on iPhone/iPad

1. **Visit the site in Safari**
   - Open https://yoursite.com

2. **Tap the Share button**
   - Look for the ↗ icon at bottom

3. **Select "Add to Home Screen"**
   - Bottom option in share menu
   - Give it a custom name if you want

4. **Tap "Add"**
   - Top-right button
   - App installs immediately

5. **App is ready!**
   - Appears on home screen
   - No app store needed
   - Works offline once visited

### Installing on Windows/Mac

1. **Visit the site in Chrome**
   - Open https://yoursite.com

2. **Click the install button**
   - May appear in address bar or settings menu

3. **Click "Install"**
   - App opens in its own window
   - No browser UI

4. **App is ready!**
   - Runs independently
   - Access from Start Menu (Windows) or Dock (Mac)

---

## For Developers

### Quick Setup

1. **Dependencies already installed:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### Testing PWA Locally

1. **Open DevTools** (F12)

2. **Go to Application Tab**

3. **Check Service Worker:**
   - Should show "activated and running"
   - If not, check console for errors

4. **Test offline:**
   - Check "Offline" checkbox in DevTools
   - Refresh page
   - Should see offline.html or cached page

5. **Check caches:**
   - Browse Cache Storage
   - See what's been cached
   - Each type in separate cache

### Testing Install Prompt

**Android:**
1. Open DevTools → Application
2. Manifest tab
3. Click "Install"

**iOS:**
1. Safari DevTools (requires Mac)
2. Or test on actual device

---

## Common Tasks

### Prefetch Data for Offline

```javascript
// In your app component
import CacheManager from '@/utils/cache-manager.js';

export default {
  async mounted() {
    // Prefetch important data
    await CacheManager.prefetchResources([
      '/jobs',
      '/network',
      '/profile'
    ]);
  }
}
```

### Check Online Status

```javascript
import PWAManager from '@/utils/pwa-manager.js';

// One-time check
if (PWAManager.isOnline()) {
  console.log('Online!');
}

// Listen for changes
PWAManager.onNetworkStatusChange((isOnline) => {
  console.log('Network:', isOnline ? 'Online' : 'Offline');
  // Update UI accordingly
});
```

### Show Notification

```javascript
import PWAManager from '@/utils/pwa-manager.js';

// Request permission first
await PWAManager.requestNotificationPermission();

// Show notification
PWAManager.showNotification('Job Alert!', {
  body: 'New senior developer position posted',
  tag: 'job-alert', // Prevents duplicates
  requireInteraction: true // Stays until user dismisses
});
```

### Get Cache Size

```javascript
import CacheManager from '@/utils/cache-manager.js';

const size = await CacheManager.getCacheSize();
console.log(`Using ${size.usage} of ${size.quota} bytes`);
console.log(`${size.percentage}% full`);
```

### Clear Cache (for testing)

```javascript
import CacheManager from '@/utils/cache-manager.js';

// Clear specific cache type
await CacheManager.clearCache('blue-links-v2-images');

// Clear everything
await CacheManager.clearAllCaches();
```

---

## What Gets Cached Automatically?

✅ **Cached automatically:**
- App shell (HTML, JS, CSS)
- Images and icons
- Fonts
- Successful API responses
- JavaScript bundles

❌ **Not cached:**
- Real-time data
- User authentication tokens (stored securely instead)
- Failed requests

---

## Performance Tips

### For Users
1. Install the app - reduces load times
2. Use over WiFi first to build cache
3. Restart app after updates
4. Check "About" to see cache size

### For Developers
1. Lazy-load non-critical images
2. Minify CSS and JavaScript
3. Use efficient image formats (WebP)
4. Monitor cache hit rates in logs

---

## Updating the App

### For Users
- Auto-update in background
- Get notification when update ready
- Tap "Update Now" to apply
- No action needed otherwise

### For Developers

When making updates:

1. **Update service-worker.js version:**
   ```javascript
   const CACHE_VERSION = 'blue-links-v3';
   ```

2. **Commit and deploy**

3. **Old caches auto-delete** on next user visit

4. **Users get notified** with update prompt

---

## Debugging

### Check Service Worker Status
```javascript
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations));
```

### View All Cached Files
```javascript
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(`${name}:`, requests);
      });
    });
  });
});
```

### Monitor Network Activity
1. Open DevTools Network tab
2. Load page
3. Check offline
4. Refresh page
5. Files should load from cache (status 200, source: cache)

### Check Install Eligibility
```javascript
// Should return true to be installable
PWAManager.checkAppState().hasServiceWorker &&
  PWAManager.checkAppState().online
```

---

## FAQ

**Q: Will it work on my old phone?**
A: PWAs work on any modern browser (Chrome, Firefox, Safari on iOS 11.3+, Edge). Graceful degradation - works without all features on older browsers.

**Q: How much data does it use?**
A: Only downloads resources needed. First visit: normal data usage. Repeat visits: minimal (cached assets only).

**Q: Can I uninstall it?**
A: Yes, just like any app. Remove from home screen or app drawer.

**Q: Does it spy on me?**
A: No. All data stays on-device. Uses secure HTTPS connection. No tracking.

**Q: What if I want to go back to website version?**
A: Uninstall the app, visit in browser, bookmark or add to home screen as shortcut.

**Q: How big is the cache?**
A: Typically 10-50MB depending on content. Users can clear manually.

---

## Support

For issues:

1. **Check DevTools** (F12 → Application)
2. **Check Service Worker** status
3. **Check Network** tab for failed requests
4. **Clear cache and reload** (ctrl+shift+r)
5. **Try on different device** to isolate issue

---

## Next Steps

- [ ] Install app on your device
- [ ] Try offline mode
- [ ] Explore the alumni features
- [ ] Share with other Ateneo alumni
- [ ] Report any issues

**Welcome to the Blue Links PWA!** 🎓✨
