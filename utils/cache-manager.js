// Cache Management Utilities for Blue Links Alumni Portal
export const CacheManager = {
  // Cache names
  CACHE_NAMES: {
    appShell: 'blue-links-v2-app-shell',
    images: 'blue-links-v2-images',
    api: 'blue-links-v2-api',
    fonts: 'blue-links-v2-fonts',
    documents: 'blue-links-v2-documents'
  },

  /**
   * Get cache size in bytes
   */
  async getCacheSize() {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }

    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentage: Math.round((estimate.usage / estimate.quota) * 100)
    };
  },

  /**
   * Log cache contents for debugging
   */
  async logCacheContents() {
    const cacheNames = await caches.keys();
    console.log('[Cache Manager] Available caches:', cacheNames);

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      console.log(`[Cache Manager] ${cacheName}:`, keys.length, 'items');
      keys.forEach(request => console.log(`  - ${request.url}`));
    }
  },

  /**
   * Clear specific cache
   */
  async clearCache(cacheName) {
    if (await caches.delete(cacheName)) {
      console.log(`[Cache Manager] Cleared cache: ${cacheName}`);
      return true;
    }
    return false;
  },

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    console.log('[Cache Manager] All caches cleared');
  },

  /**
   * Cache a specific resource
   */
  async cacheResource(url, cacheName = 'blue-links-v2-documents') {
    try {
      const response = await fetch(url);
      if (response.status === 200) {
        const cache = await caches.open(cacheName);
        await cache.put(url, response);
        console.log(`[Cache Manager] Cached: ${url}`);
        return true;
      }
    } catch (error) {
      console.error(`[Cache Manager] Failed to cache ${url}:`, error);
    }
    return false;
  },

  /**
   * Prefetch multiple resources for offline access
   */
  async prefetchResources(urls, cacheName = 'blue-links-v2-documents') {
    const results = await Promise.all(
      urls.map(url => this.cacheResource(url, cacheName))
    );
    const successful = results.filter(r => r).length;
    console.log(`[Cache Manager] Prefetched ${successful}/${urls.length} resources`);
    return successful === urls.length;
  },

  /**
   * Check if resource is cached
   */
  async isResourceCached(url) {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      if (response) {
        return { cached: true, cacheName };
      }
    }
    return { cached: false };
  },

  /**
   * Get offline status
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Listen for online/offline changes
   */
  onNetworkStatusChange(callback) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  /**
   * Request persistent storage permission
   */
  async requestPersistentStorage() {
    if (!('storage' in navigator) || !('persist' in navigator.storage)) {
      console.warn('[Cache Manager] Persistent storage not available');
      return false;
    }

    try {
      const persistent = await navigator.storage.persist();
      console.log('[Cache Manager] Persistent storage:', persistent ? 'granted' : 'denied');
      return persistent;
    } catch (error) {
      console.error('[Cache Manager] Failed to request persistent storage:', error);
      return false;
    }
  },

  /**
   * Check if app has persistent storage
   */
  async hasPersistentStorage() {
    if (!('storage' in navigator) || !('persisted' in navigator.storage)) {
      return false;
    }
    return await navigator.storage.persisted();
  }
};

export default CacheManager;
