// PWA Utilities for Blue Links Alumni Portal
export const PWAManager = {
  // BeforeInstallPrompt event storage
  deferredPrompt: null,

  /**
   * Initialize PWA features
   */
  async init() {
    console.log('[PWA] Initializing Progressive Web App');
    
    this.setupInstallPrompt();
    this.setupNetworkStatus();
    this.setupUpdateCheck();
    this.checkAppState();
  },

  /**
   * Setup install prompt handling
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      // Trigger custom install UI
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.deferredPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-app-installed'));
    });
  },

  /**
   * Show install prompt to user
   */
  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.warn('[PWA] Install prompt not available');
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);
    this.deferredPrompt = null;
    return outcome === 'accepted';
  },

  /**
   * Check if app is already installed
   */
  isAppInstalled() {
    // Check if running as standalone app
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator.standalone === true);
    
    // Check if installed as PWA
    const isInstalledPWA = window.location.protocol === 'https:' &&
                          'serviceWorker' in navigator &&
                          'caches' in window;

    return isStandalone || isInstalledPWA;
  },

  /**
   * Setup network status monitoring
   */
  setupNetworkStatus() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      console.log(`[PWA] Network status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      window.dispatchEvent(new CustomEvent('pwa-network-change', { 
        detail: { isOnline } 
      }));

      // Update document with online/offline class
      if (isOnline) {
        document.documentElement.classList.remove('offline');
        document.documentElement.classList.add('online');
      } else {
        document.documentElement.classList.remove('online');
        document.documentElement.classList.add('offline');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
  },

  /**
   * Setup Service Worker update checking
   */
  setupUpdateCheck() {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;

        // Check for updates every hour
        const updates = await registration.update();
        console.log('[PWA] Checked for updates');
      } catch (error) {
        console.error('[PWA] Update check failed:', error);
      }
    };

    // Check on page load
    checkForUpdates();

    // Check periodically (every 1 hour)
    setInterval(checkForUpdates, 60 * 60 * 1000);

    // Listen for controller change (new SW ready)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Service Worker updated');
      window.dispatchEvent(new CustomEvent('pwa-update-ready'));
    });
  },

  /**
   * Check app state and capabilities
   */
  checkAppState() {
    const state = {
      installed: this.isAppInstalled(),
      online: navigator.onLine,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasCaches: 'caches' in window,
      hasNotifications: 'Notification' in window,
      hasVibration: 'vibrate' in navigator,
      hasBattery: 'getBattery' in navigator,
      platform: this.detectPlatform()
    };

    console.log('[PWA] App state:', state);
    return state;
  },

  /**
   * Detect platform (iOS, Android, Desktop)
   */
  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
    if (/android/.test(ua)) return 'Android';
    return 'Desktop';
  },

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Show notification
   */
  showNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        ...options
      });

      return notification;
    }
  },

  /**
   * Get display mode
   */
  getDisplayMode() {
    const displayMode = window.matchMedia('(display-mode: standalone)').matches
      ? 'standalone'
      : window.matchMedia('(display-mode: fullscreen)').matches
      ? 'fullscreen'
      : window.matchMedia('(display-mode: minimal-ui)').matches
      ? 'minimal-ui'
      : 'browser';

    return displayMode;
  },

  /**
   * Vibrate device (haptic feedback)
   */
  vibrate(pattern = [200, 100, 200]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  /**
   * Add to homescreen (iOS fallback)
   */
  showAddToHomescreenInstructions() {
    const platform = this.detectPlatform();
    
    let instructions = '';
    if (platform === 'iOS') {
      instructions = `
        To add Blue Links to your home screen:
        1. Tap the Share button
        2. Select "Add to Home Screen"
        3. Tap Add
      `;
    } else if (platform === 'Android') {
      instructions = `
        To add Blue Links to your home screen:
        1. Tap the menu button (⋮)
        2. Select "Install app" or "Add to Home Screen"
        3. Confirm
      `;
    }

    return instructions;
  },

  /**
   * Share app via Web Share API
   */
  async shareApp() {
    if (!('share' in navigator)) {
      console.warn('[PWA] Web Share API not supported');
      return false;
    }

    try {
      await navigator.share({
        title: 'Blue Links Alumni Portal',
        text: 'Connect with fellow Ateneo de Davao alumni!',
        url: window.location.href
      });
      console.log('[PWA] App shared successfully');
      return true;
    } catch (error) {
      console.error('[PWA] Share failed:', error);
      return false;
    }
  }
};

export default PWAManager;
