<script setup>
import { onMounted } from "vue";
import CacheManager from "../utils/cache-manager.js";
import PWAManager from "../utils/pwa-manager.js";
import PWAInstallPrompt from "../components/PWAInstallPrompt.vue";
import PWAOfflineIndicator from "../components/PWAOfflineIndicator.vue";
import PWAUpdateNotification from "../components/PWAUpdateNotification.vue";

useHead({
	title: "Blue Links – Ateneo de Davao Alumni Portal",
	meta: [
		{ name: "viewport", content: "width=device-width, initial-scale=1.0" }
	],
	link: [
		{ rel: "preconnect", href: "https://fonts.googleapis.com" },
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
		}
	]
});

// ===== PAGE NAVIGATION =====
  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    closeMobileNav();
  }

  function doLogin() {
    showPage('page-app');
    setView('home', document.querySelector('.nav-item'));
  }

  // ===== VIEW NAVIGATION =====
  const viewTitles = { home:'Home', jobs:'Jobs', network:'Network', notifications:'Notifications', profile:'Profile' };

  function setView(name, navEl) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    if(navEl) navEl.classList.add('active');
    document.getElementById('topbar-title').textContent = viewTitles[name] || name;
    closeMobileNav();
    // reset job sub-panels
    if(name === 'jobs') {
      resetJobPanels();
    }
    if(name === 'profile') {
      hideSubview();
    }
  }

  function resetJobPanels() {
    document.getElementById('jobboard-panel').style.display = 'block';
    document.getElementById('applications-panel').style.display = 'none';
    document.getElementById('offer-detail-panel').style.display = 'none';
    document.getElementById('decline-panel').style.display = 'none';
    document.getElementById('tab-board').classList.add('active');
    document.getElementById('tab-apps').classList.remove('active');
  }

  // ===== JOB TABS =====
  function switchJobTab(tab) {
    if(tab === 'board') {
      document.getElementById('jobboard-panel').style.display = 'block';
      document.getElementById('applications-panel').style.display = 'none';
      document.getElementById('offer-detail-panel').style.display = 'none';
      document.getElementById('decline-panel').style.display = 'none';
      document.getElementById('tab-board').classList.add('active');
      document.getElementById('tab-apps').classList.remove('active');
    } else {
      document.getElementById('jobboard-panel').style.display = 'none';
      document.getElementById('applications-panel').style.display = 'block';
      document.getElementById('offer-detail-panel').style.display = 'none';
      document.getElementById('decline-panel').style.display = 'none';
      document.getElementById('tab-board').classList.remove('active');
      document.getElementById('tab-apps').classList.add('active');
    }
  }

  function selectJob(idx) {
    document.querySelectorAll('.job-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.job-detail').forEach(d => d.classList.remove('active'));
    event.currentTarget.classList.add('selected');
    document.getElementById('job-detail-' + idx).classList.add('active');
  }

  function showOfferDetail() {
    document.getElementById('applications-panel').style.display = 'none';
    document.getElementById('offer-detail-panel').style.display = 'block';
  }

  function hideOfferDetail() {
    document.getElementById('offer-detail-panel').style.display = 'none';
    document.getElementById('applications-panel').style.display = 'block';
  }

  function showDeclineForm() {
    document.getElementById('offer-detail-panel').style.display = 'none';
    document.getElementById('decline-panel').style.display = 'block';
  }

  function hideDeclineForm() {
    document.getElementById('decline-panel').style.display = 'none';
    document.getElementById('offer-detail-panel').style.display = 'block';
  }

  // ===== PROFILE SUBVIEWS =====
  function showSubview(name) {
    document.getElementById('profile-main').style.display = 'none';
    document.querySelectorAll('[id^="subview-"]').forEach(s => s.style.display = 'none');
    document.getElementById('subview-' + name).style.display = 'block';
  }

  function hideSubview() {
    document.querySelectorAll('[id^="subview-"]').forEach(s => s.style.display = 'none');
    document.getElementById('profile-main').style.display = 'block';
  }

  // ===== MODALS =====
  function closeModal(e, id) {
    if(e.target === document.getElementById(id)) {
      document.getElementById(id).classList.remove('open');
    }
  }

  function showQRModal() {
    document.getElementById('qr-modal').classList.add('open');
    document.getElementById('scan-view').style.display = 'none';
    document.getElementById('no-scan-view').style.display = 'block';
  }

  function switchToScan() {
    document.getElementById('no-scan-view').style.display = 'none';
    document.getElementById('scan-view').style.display = 'block';
  }

  function showVerification() {
    setView('profile', document.querySelector('.nav-item:nth-child(5)'));
    setTimeout(() => showSubview('verification'), 50);
  }

  // ===== UTILS =====
  function updateCharCount() {
    const v = document.getElementById('decline-note').value.length;
    document.getElementById('char-count').textContent = v;
  }

  function toggleMobileNav() {
    const root = document.getElementById('page-app');
    if (!root) return;
    root.classList.toggle('mobile-nav-open');
    syncMobileNavScrollLock();
  }

  function closeMobileNav() {
    document.getElementById('page-app')?.classList.remove('mobile-nav-open');
    syncMobileNavScrollLock();
  }

  function syncMobileNavScrollLock() {
    const open = document.getElementById('page-app')?.classList.contains('mobile-nav-open');
    document.documentElement.classList.toggle('mobile-nav-lock', !!open);
  }

onMounted(() => {
	// Register Service Worker for offline support
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/service-worker.js')
			.then((registration) => {
				console.log('[App] Service Worker registered successfully:', registration);
				
				// Handle updates
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							console.log('[App] New Service Worker available - reload to update');
							// Optionally show a notification to the user about the update
						}
					});
				});
			})
			.catch((error) => {
				console.error('[App] Service Worker registration failed:', error);
			});
	}

	// Initialize Cache Manager
	if ('caches' in window) {
		// Request persistent storage for better offline support
		CacheManager.requestPersistentStorage().then((granted) => {
			if (granted) {
				console.log('[App] Persistent storage granted');
			}
		});

		// Monitor network status
		const unsubscribe = CacheManager.onNetworkStatusChange((isOnline) => {
			console.log('[App] Network status changed:', isOnline ? 'ONLINE' : 'OFFLINE');
			// You can add UI feedback here, e.g., show/hide offline banner
		});

		// Log cache info for debugging
		CacheManager.logCacheContents();
		CacheManager.getCacheSize().then((size) => {
			if (size) {
				console.log('[App] Cache usage:', `${Math.round(size.usage / 1024)} KB / ${Math.round(size.quota / 1024)} KB (${size.percentage}%)`);
			}
		});

		// Expose cache manager globally for manual control
		globalThis.CacheManager = CacheManager;
	}

	// Initialize PWA Manager
	PWAManager.init();
	globalThis.PWAManager = PWAManager;

	document.querySelectorAll(".filter-btn").forEach((b) => {
		b.addEventListener("click", () => b.classList.toggle("on"));
	});
	const w = globalThis;
	Object.assign(w, {
		showPage,
		doLogin,
		setView,
		resetJobPanels,
		switchJobTab,
		selectJob,
		showOfferDetail,
		hideOfferDetail,
		showDeclineForm,
		hideDeclineForm,
		showSubview,
		hideSubview,
		closeModal,
		showQRModal,
		switchToScan,
		showVerification,
		updateCharCount,
		toggleMobileNav,
		closeMobileNav
	});
});
</script>

<template>
<!-- PWA Components -->
<PWAOfflineIndicator />
<PWAInstallPrompt />
<PWAUpdateNotification />

<!-- ===== SPLASH ===== -->
<div id="page-splash" class="page active">
  <div class="splash-content">
    <div class="splash-logo">
      <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M48 6 L82 20 L82 52 C82 70 66 84 48 90 C30 84 14 70 14 52 L14 20 Z" fill="#162060" stroke="#c9a84c" stroke-width="2"/>
        <text x="48" y="62" text-anchor="middle" font-size="32" fill="#c9a84c" font-family="serif" font-weight="bold">B</text>
      </svg>
    </div>
    <div class="splash-title">Blue Links</div>
    <div class="splash-tagline">Rediscover. Reunite. Reconnect.</div>
    <p style="color:rgba(255,255,255,0.55);max-width:360px;margin:0 auto 32px;line-height:1.7;font-size:0.93rem;">Step into the alumni portal with a Magis welcome. Rekindle the connections that defined your journey and keep your network alive with fellow Blue graduates.</p>
    <button class="splash-btn" onclick="showPage('page-login')">Get Started &rarr;</button>
    <div class="splash-login">Already have an account? <span onclick="showPage('page-login')">Log In</span></div>
  </div>
</div>

<!-- ===== LOGIN ===== -->
<div id="page-login" class="page">
  <div class="auth-left">
    <div class="auth-left-content">
      <svg width="64" height="64" viewBox="0 0 96 96" class="auth-left-logo" fill="none">
        <path d="M48 6 L82 20 L82 52 C82 70 66 84 48 90 C30 84 14 70 14 52 L14 20 Z" fill="#162060" stroke="#c9a84c" stroke-width="2"/>
        <text x="48" y="62" text-anchor="middle" font-size="32" fill="#c9a84c" font-family="serif" font-weight="bold">B</text>
      </svg>
      <h1>Blue Links</h1>
      <div class="tagline">Rediscover. Reunite. Reconnect.</div>
      <p>Step into the alumni portal with a Magis welcome. Rekindle the connections that defined your journey.</p>
      <div class="auth-highlight-cards">
        <div class="auth-hcard">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#c9a84c"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
          <span>Your Global Circle — connect with Blue Knights across the globe</span>
        </div>
        <div class="auth-hcard">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#c9a84c"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>Blue Graduates United — alumni helping alumni worldwide</span>
        </div>
      </div>
    </div>
  </div>
  <div class="auth-right">
    <svg width="44" height="44" viewBox="0 0 96 96" fill="none" style="margin-bottom:16px;">
      <path d="M48 6 L82 20 L82 52 C82 70 66 84 48 90 C30 84 14 70 14 52 L14 20 Z" fill="#0d1b4b" stroke="#c9a84c" stroke-width="2"/>
      <text x="48" y="62" text-anchor="middle" font-size="32" fill="#c9a84c" font-family="serif" font-weight="bold">B</text>
    </svg>
    <h2>Welcome, Blue Knight!</h2>
    <div class="sub">Enter your credentials to access the portal</div>
    <div class="form-group">
      <label>Alumni ID / Email</label>
      <input type="text" placeholder="Enter your ID or email" id="login-email" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" placeholder="Enter your password" id="login-pass" />
    </div>
    <div class="remember-row">
      <label><input type="checkbox" /> Remember Me</label>
      <a href="#">Forgot Password?</a>
    </div>
    <button class="btn-primary" onclick="doLogin()">Login &rarr;</button>
    <div class="divider">OR</div>
    <button class="btn-outline">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:inline;margin-right:6px;vertical-align:middle"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Continue with FaceID
    </button>
    <div style="background:var(--blue-soft);border-radius:var(--radius-sm);padding:14px;margin-top:20px;font-size:0.86rem;text-align:center;color:var(--text-muted);">
      Are you a graduate of AdDU but don't have an account yet?<br/>
      <span style="color:var(--blue-accent);cursor:pointer;font-weight:600;" onclick="showPage('page-register')">Register as Alumni &rarr;</span>
    </div>
    <div style="display:flex;justify-content:center;gap:14px;margin-top:20px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#333"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
    </div>
    <div style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:16px;">© 2024 Ateneo de Davao University. All Rights Reserved.</div>
  </div>
</div>

<!-- ===== REGISTER ===== -->
<div id="page-register" class="page">
  <div class="auth-left">
    <div class="auth-left-content">
      <svg width="64" height="64" viewBox="0 0 96 96" fill="none" style="margin-bottom:16px;">
        <path d="M48 6 L82 20 L82 52 C82 70 66 84 48 90 C30 84 14 70 14 52 L14 20 Z" fill="#162060" stroke="#c9a84c" stroke-width="2"/>
        <text x="48" y="62" text-anchor="middle" font-size="32" fill="#c9a84c" font-family="serif" font-weight="bold">B</text>
      </svg>
      <h1>Alumni Registration</h1>
      <div class="tagline">Register to reconnect with the Ateneo community</div>
      <p>Your journey with AdDU doesn't end at graduation. Join thousands of Blue Knights staying connected worldwide.</p>
    </div>
  </div>
  <div class="auth-right" style="width:480px;">
    <button class="back-btn" onclick="showPage('page-login')" style="margin-bottom:16px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Back
    </button>
    <h2>Alumni Registration</h2>
    <div class="sub">Create your account to access the portal</div>
    <div style="position:relative;text-align:center;margin:16px 0 20px;">
      <div style="width:70px;height:70px;border-radius:50%;background:var(--off-white);border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto;cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin-top:6px;">Upload photo (optional)</div>
    </div>
    <div class="form-group"><label>Full Name</label><input type="text" placeholder="Juan dela Cruz" /></div>
    <div class="form-group"><label>Graduation Year</label><input type="text" placeholder="YYYY" /></div>
    <div class="form-group"><label>Email</label><input type="email" placeholder="example@addu.edu.ph" /></div>
    <div class="form-group"><label>Password</label><input type="password" placeholder="Enter your password" /></div>
    <div class="biometric-row">
      <div>
        <label style="font-size:0.9rem;font-weight:600;">Enable Biometrics</label>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">Secure your identity with FaceID or TouchID</div>
      </div>
      <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
    </div>
    <button class="btn-primary" onclick="showPage('page-app')">Create Account</button>
    <div class="auth-switch">Already have an account? <span onclick="showPage('page-login')">Log In</span></div>
  </div>
</div>

<!-- ===== MAIN APP ===== -->
<div id="page-app" class="page app-shell">

  <div class="sidebar-backdrop" onclick="closeMobileNav()"></div>

  <!-- Sidebar -->
  <nav class="sidebar">
    <div class="sidebar-mobile-header">
      <span>Menu</span>
      <button type="button" class="sidebar-mobile-close" onclick="closeMobileNav()" aria-label="Close menu">×</button>
    </div>
    <div class="sidebar-logo">
      <svg width="38" height="38" viewBox="0 0 96 96" fill="none">
        <path d="M48 6 L82 20 L82 52 C82 70 66 84 48 90 C30 84 14 70 14 52 L14 20 Z" fill="#162060" stroke="#c9a84c" stroke-width="2"/>
        <text x="48" y="62" text-anchor="middle" font-size="32" fill="#c9a84c" font-family="serif" font-weight="bold">B</text>
      </svg>
      <div class="sidebar-logo-text">Blue Links<span>Ateneo de Davao</span></div>
    </div>
    <div class="sidebar-nav">
      <div class="nav-item active" onclick="setView('home', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
        <span>Home</span>
      </div>
      <div class="nav-item" onclick="setView('jobs', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
        <span>Jobs</span>
      </div>
      <div class="nav-item" onclick="setView('network', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        <span>Network</span>
      </div>
      <div class="nav-item" onclick="setView('notifications', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <span>Notifications</span>
      </div>
      <div class="nav-item" onclick="setView('profile', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </div>
    </div>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar">S</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">Stephany Jobs</div>
          <div class="sidebar-user-class">Class of 2026 · IT</div>
        </div>
      </div>
      <button class="logout-btn" onclick="showPage('page-splash')">Sign out</button>
    </div>
  </nav>

  <!-- Main -->
  <div class="app-main">
    <div class="topbar">
      <div class="topbar-left">
        <button type="button" class="mobile-nav-toggle" onclick="toggleMobileNav()" aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div class="topbar-title" id="topbar-title">Home</div>
      </div>
      <div class="topbar-right">
        <div class="topbar-notif">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <div class="notif-dot"></div>
        </div>
        <div class="topbar-avatar" onclick="setView('profile', document.querySelector('.nav-item:nth-child(5)'))">S</div>
      </div>
    </div>

    <div class="content-area">

      <!-- HOME -->
      <div id="view-home" class="view active">
        <div class="hero-banner">
          <div class="badge">Ateneo de Davao Blue Knight</div>
          <h2>Welcome back, Stephany!</h2>
          <p>Class of 2026 &bull; Information Technology</p>
          <div class="hero-actions">
            <button class="btn-gold">Update Profile</button>
            <button class="btn-ghost" onclick="showVerification()">Digital ID</button>
          </div>
        </div>
        <div class="dashboard-cards">
          <div class="dash-card" onclick="setView('jobs', document.querySelector('.nav-item:nth-child(2)'))">
            <div class="dash-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
            <div class="dash-label">Request Records</div>
          </div>
          <div class="dash-card" onclick="setView('jobs', document.querySelector('.nav-item:nth-child(2)'))">
            <div class="dash-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg></div>
            <div class="dash-label">Job Board</div>
          </div>
          <div class="dash-card">
            <div class="dash-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
            <div class="dash-label">Donation</div>
          </div>
          <div class="dash-card" onclick="setView('network', document.querySelector('.nav-item:nth-child(3)'))">
            <div class="dash-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
            <div class="dash-label">Network</div>
          </div>
        </div>
        <div class="two-col">
          <div>
            <div class="section-header"><h3>Latest News</h3><span class="view-all">View All</span></div>
            <div class="news-grid">
              <div class="news-card">
                <div class="news-img gold"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
                <div class="news-body">
                  <div class="news-tag">Campus Update</div>
                  <div class="news-title">Grand Alumni Homecoming 2024: Registration Now Open</div>
                  <div class="news-excerpt">Join thousands of Blue Knights this...</div>
                </div>
              </div>
              <div class="news-card">
                <div class="news-img"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>
                <div class="news-body">
                  <div class="news-tag">Infrastructure</div>
                  <div class="news-title">Inauguration of the Martinez Sports Center</div>
                  <div class="news-excerpt">A new chapter for...</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="section-header"><h3>Upcoming Events</h3><span class="view-all">Calendar</span></div>
            <div class="events-list">
              <div class="event-item">
                <div class="event-date"><div class="month">Dec</div><div class="day">07</div></div>
                <div class="event-info">
                  <div class="event-title">Alumni Webinar: Tech Trends</div>
                  <div class="event-meta">🕕 6:00 PM &bull; Zoom</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              <div class="event-item">
                <div class="event-date" style="background:var(--gold);"><div class="month" style="color:rgba(13,27,75,0.7)">Jan</div><div class="day" style="color:var(--navy)">15</div></div>
                <div class="event-info">
                  <div class="event-title">Grand Alumni Homecoming 2024</div>
                  <div class="event-meta">📍 AdDU Campus</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              <div class="event-item">
                <div class="event-date"><div class="month">Feb</div><div class="day">02</div></div>
                <div class="event-info">
                  <div class="event-title">Career Fair: Davao Tech Summit</div>
                  <div class="event-meta">🕙 10:00 AM &bull; SM Lanang</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- JOBS -->
      <div id="view-jobs" class="view">
        <div class="app-tabs">
          <div class="app-tab active" id="tab-board" onclick="switchJobTab('board')">Job Board</div>
          <div class="app-tab" id="tab-apps" onclick="switchJobTab('apps')">Applications</div>
        </div>

        <!-- Job Board -->
        <div id="jobboard-panel">
          <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center;">
            <div class="search-bar" style="flex:1;margin-bottom:0;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input placeholder="Search roles, companies, or keywords" />
            </div>
            <button style="background:var(--navy);color:white;padding:10px 16px;border-radius:var(--radius-sm);display:flex;align-items:center;gap:6px;font-size:0.88rem;font-weight:500;" onclick="document.getElementById('filter-modal').classList.add('open')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </button>
          </div>
          <div class="filter-chips">
            <div class="chip">Information Technology <span class="x">×</span></div>
            <div class="chip">Davao City <span class="x">×</span></div>
          </div>
          <div class="jobs-layout">
            <div class="jobs-sidebar">
              <div style="font-size:0.82rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:10px;">Partner Firms in Davao</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
                <div class="job-card" onclick="selectJob(0)">
                  <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">SkyTech Davao</div>
                  <div class="bkp-badge">⭐ Blue Knight Priority</div>
                  <div style="font-size:0.82rem;margin-top:8px;color:var(--text)">Junior Full Stack Developer</div>
                  <div class="job-meta"><span class="job-meta-item">₱90k - ₱110k</span><span class="job-meta-item">📍 Davao City</span></div>
                </div>
                <div class="job-card" onclick="selectJob(1)">
                  <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">Shinsen Davao</div>
                  <div class="bkp-badge">⭐ Blue Knight</div>
                  <div style="font-size:0.82rem;margin-top:8px;color:var(--text)">Senior Full Stack</div>
                  <div class="job-meta"><span class="job-meta-item">₱90k - ₱110k</span><span class="job-meta-item">📍 Davao City</span></div>
                </div>
              </div>
              <div style="font-size:0.82rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:10px;">Jobs For You</div>
              <div class="job-list" id="job-list">
                <div class="job-card selected" onclick="selectJob(0)">
                  <div class="job-card-header">
                    <div class="company-logo">ST</div>
                    <div class="job-card-info">
                      <div class="job-title">Senior Software Engineer</div>
                      <div class="job-company">Davao Tech Solutions</div>
                    </div>
                  </div>
                  <div class="bkp-badge" style="margin-bottom:6px;">⭐ Blue Knight Priority</div>
                  <div class="job-meta">
                    <span class="job-meta-item">📍 Davao City</span>
                    <span class="job-meta-item">🏢 Full-time</span>
                    <span class="job-meta-item">₱60k–₱90k</span>
                  </div>
                </div>
                <div class="job-card" onclick="selectJob(1)">
                  <div class="job-card-header">
                    <div class="company-logo" style="background:var(--gold);color:var(--navy)">SD</div>
                    <div class="job-card-info">
                      <div class="job-title">Systems Analyst</div>
                      <div class="job-company">Shinsen Davao</div>
                    </div>
                  </div>
                  <div class="job-meta">
                    <span class="job-meta-item">📍 Davao City</span>
                    <span class="job-meta-item">🏢 Full-time</span>
                    <span class="job-meta-item">₱50k–₱70k</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Job Detail -->
            <div class="panel job-detail-panel">
              <div id="job-detail-0" class="job-detail active">
                <div class="job-detail-header">
                  <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                    <div class="company-logo" style="width:48px;height:48px;font-size:0.9rem;">ST</div>
                    <div>
                      <h2>Junior Full Stack Developer</h2>
                      <div class="job-detail-company">SkyTech Davao &bull; Davao City</div>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <span style="background:rgba(201,168,76,0.2);color:var(--gold);border:1px solid rgba(201,168,76,0.3);border-radius:50px;padding:4px 12px;font-size:0.8rem;font-weight:600;">⭐ Blue Knight Priority</span>
                    <span style="background:rgba(255,255,255,0.1);color:white;border-radius:50px;padding:4px 12px;font-size:0.8rem;">🏢 Full-time</span>
                    <span style="background:rgba(255,255,255,0.1);color:white;border-radius:50px;padding:4px 12px;font-size:0.8rem;">📍 Davao City</span>
                  </div>
                </div>
                <div class="job-detail-body">
                  <div style="display:flex;gap:14px;align-items:center;margin-bottom:20px;">
                    <div>
                      <div style="font-size:1.2rem;font-weight:700;color:var(--navy);">₱60k – ₱90k</div>
                      <div style="font-size:0.8rem;color:var(--text-muted);">Monthly</div>
                    </div>
                    <div style="margin-left:auto;display:flex;gap:8px;">
                      <button class="apply-btn" onclick="showQRModal()">Apply Now &rarr;</button>
                    </div>
                  </div>
                  <div class="detail-section">
                    <h4>About the Role</h4>
                    <p style="font-size:0.88rem;line-height:1.7;color:var(--text-muted);">We are looking for a passionate Junior Software Engineer to join our growing team. You will be working directly with our senior engineers to build scalable applications. This is a great opportunity for recent graduates to kickstart their career in a supportive environment.</p>
                  </div>
                  <div class="detail-section">
                    <h4>Requirements</h4>
                    <ul class="req-list">
                      <li>Bachelor's degree in Computer Science or related field</li>
                      <li>Proficiency in JavaScript, HTML, and CSS</li>
                      <li>Experience with React or Vue.js is a plus</li>
                      <li>Strong problem-solving skills and attention to detail</li>
                    </ul>
                  </div>
                  <div class="detail-section">
                    <h4>Benefits</h4>
                    <div class="benefit-chips">
                      <div class="benefit-chip">🏥 Health Insurance — Full coverage</div>
                      <div class="benefit-chip">🏠 Remote Work — Hybrid options</div>
                      <div class="benefit-chip">📚 Learning Budget</div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="job-detail-1" class="job-detail">
                <div class="job-detail-header">
                  <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                    <div class="company-logo" style="width:48px;height:48px;font-size:0.9rem;background:var(--gold);color:var(--navy);">SD</div>
                    <div>
                      <h2>Systems Analyst</h2>
                      <div class="job-detail-company">Shinsen Davao &bull; Davao City</div>
                    </div>
                  </div>
                </div>
                <div class="job-detail-body">
                  <div style="margin-bottom:20px;">
                    <div style="font-size:1.2rem;font-weight:700;color:var(--navy);">₱50k – ₱70k</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">Monthly</div>
                    <button class="apply-btn" style="margin-top:12px;" onclick="showQRModal()">Apply Now &rarr;</button>
                  </div>
                  <div class="detail-section">
                    <h4>About the Role</h4>
                    <p style="font-size:0.88rem;line-height:1.7;color:var(--text-muted);">Join our systems team as a Systems Analyst, where you'll analyze business requirements and design technology solutions. Ideal for Blue Knights with strong analytical and communication skills.</p>
                  </div>
                  <div class="detail-section">
                    <h4>Requirements</h4>
                    <ul class="req-list">
                      <li>Bachelor's degree in IT, CS, or related field</li>
                      <li>Experience with systems documentation and flowcharting</li>
                      <li>Familiarity with SQL and database design</li>
                    </ul>
                  </div>
                  <div class="detail-section">
                    <h4>Benefits</h4>
                    <div class="benefit-chips">
                      <div class="benefit-chip">🏥 HMO Day 1</div>
                      <div class="benefit-chip">🏖 15 VL / 15 SL</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Applications -->
        <div id="applications-panel" style="display:none;">
          <div style="display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:14px;">
            <button style="padding:6px 16px;border-radius:50px;border:1.5px solid var(--border);font-size:0.85rem;cursor:pointer;background:var(--white);">All</button>
            <button style="padding:6px 16px;border-radius:50px;border:1.5px solid transparent;font-size:0.85rem;cursor:pointer;background:var(--off-white);">Under Review</button>
            <button style="padding:6px 16px;border-radius:50px;border:1.5px solid transparent;font-size:0.85rem;cursor:pointer;background:var(--off-white);">Interviewing</button>
            <button style="padding:6px 16px;border-radius:50px;border:1.5px solid transparent;font-size:0.85rem;cursor:pointer;background:var(--off-white);">Shortlisted</button>
          </div>
          <div class="applications-list">
            <div class="app-item" onclick="showOfferDetail()">
              <div class="company-logo">ST</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.93rem;">Senior Software Engineer</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">Davao Tech Solutions &bull; Davao City</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:3px;">Applied 2d ago</div>
              </div>
              <span class="app-status status-review">Under Review</span>
            </div>
            <div class="app-item" onclick="showOfferDetail()">
              <div class="company-logo" style="background:var(--success);">GE</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.93rem;">Product Designer</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">Global Engineering Corp</div>
                <div style="font-size:0.75rem;color:var(--success);margin-top:3px;">⭐ Your profile stood out! Hiring manager wants to schedule screening.</div>
              </div>
              <span class="app-status status-shortlisted">Shortlisted</span>
            </div>
            <div class="app-item" onclick="showOfferDetail()">
              <div class="company-logo" style="background:var(--gold);color:var(--navy);">SK</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.93rem;">Junior Full Stack Developer</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">SkyTech Davao &bull; Remote</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:3px;">Applied 1w ago &bull; Pending</div>
              </div>
              <span class="app-status status-offer">Offer Received</span>
            </div>
            <div class="app-item">
              <div class="company-logo" style="background:#888;">JS</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.93rem;">Junior Systems Analyst</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">Build IT</div>
              </div>
              <span class="app-status status-not-selected">Not Selected</span>
            </div>
          </div>
        </div>

        <!-- Offer Detail -->
        <div id="offer-detail-panel" style="display:none;">
          <button class="back-btn" onclick="hideOfferDetail()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Applications
          </button>
          <div class="offer-card">
            <div class="offer-header">
              <div class="company-logo" style="width:48px;height:48px;">SK</div>
              <div>
                <div style="font-size:1.1rem;font-weight:700;">Junior Full Stack Developer</div>
                <div style="font-size:0.85rem;opacity:0.7;">SkyTech Davao &bull; Davao City</div>
                <span class="app-status status-offer" style="margin-top:6px;display:inline-block;">✅ Offer Received</span>
              </div>
            </div>
            <div class="offer-body">
              <h4 style="font-size:0.85rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:14px;">Current Status</h4>
              <div class="status-timeline">
                <div class="timeline-step"><div class="timeline-dot done">✓</div><div class="timeline-info"><div class="timeline-label">Application Sent</div><div class="timeline-date">Oct 24, 2023 • 10:30 AM</div></div></div>
                <div class="timeline-step"><div class="timeline-dot done">✓</div><div class="timeline-info"><div class="timeline-label">Under Review</div><div class="timeline-date">Completed Nov 02, 2023</div></div></div>
                <div class="timeline-step"><div class="timeline-dot done">✓</div><div class="timeline-info"><div class="timeline-label">Interview</div><div class="timeline-date">Completed Nov 09, 2023</div></div></div>
                <div class="timeline-step"><div class="timeline-dot active-dot">!</div><div class="timeline-info"><div class="timeline-label">Final Decision</div><div class="timeline-date">Active</div></div></div>
              </div>
              <div class="congrats-box">
                <h4>🎉 Congratulations!</h4>
                <p>We are pleased to offer you the position. Please review the offer letter sent to your email. You can accept or decline this offer below until December 10, 2023.</p>
              </div>
              <h4 style="font-size:0.85rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Offer Highlights</h4>
              <div class="offer-highlights">
                <div class="oh-item"><div class="oh-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div><div><div class="oh-label">Annual Salary</div><div class="oh-value">₱950k</div></div></div>
                <div class="oh-item"><div class="oh-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div><div class="oh-label">Start Date</div><div class="oh-value">Nov 15</div></div></div>
                <div class="oh-item" style="grid-column:span 2">
                  <div class="oh-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>
                  <div>
                    <div class="oh-label">Benefits Package — Standard Plan A</div>
                    <ul class="benefits-list">
                      <li>✓ HMO Coverage from Day 1</li>
                      <li>✓ 15 Vacation Leaves / 15 Sick Leaves</li>
                      <li>✓ Hybrid Work Setup (2x Office)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div style="background:var(--off-white);border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                  <div><div style="font-size:0.88rem;font-weight:600;">Full Contract.pdf</div><div style="font-size:0.75rem;color:var(--text-muted);">2.4 MB • PDF</div></div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              <div style="background:var(--off-white);border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:20px;">
                <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Contact</div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;">SJ</div>
                  <div><div style="font-size:0.88rem;font-weight:600;">Sarah Jenkins</div><div style="font-size:0.78rem;color:var(--text-muted);">HR Manager at Davao Tech</div></div>
                </div>
              </div>
              <div class="offer-actions">
                <button class="btn-danger" onclick="showDeclineForm()">Decline</button>
                <button class="btn-success">Accept Offer &rarr;</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Decline Form -->
        <div id="decline-panel" style="display:none;">
          <button class="back-btn" onclick="hideDeclineForm()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
          <div class="decline-card">
            <div class="decline-header">
              <div class="company-logo" style="width:44px;height:44px;background:rgba(255,255,255,0.1);">SK</div>
              <div>
                <div style="font-size:1rem;font-weight:700;">Decline Offer</div>
                <div style="font-size:0.82rem;opacity:0.7;">Junior Full Stack Developer — SkyTech Davao</div>
              </div>
            </div>
            <div class="decline-body">
              <div class="info-box">ℹ️ Declining an offer is a significant decision. Providing a polite reason helps maintain a professional relationship for future opportunities.</div>
              <div class="form-group">
                <label>Reason for Declining</label>
                <select><option value="">Select a reason...</option><option>Accepted another offer</option><option>Compensation doesn't meet expectations</option><option>Role not a good fit</option><option>Personal reasons</option></select>
              </div>
              <div class="form-group">
                <label>Polite Note to Employer</label>
                <textarea id="decline-note" placeholder="Dear Hiring Manager, thank you for the opportunity..." oninput="updateCharCount()"></textarea>
                <div class="char-count"><span id="char-count">0</span>/500 characters</div>
              </div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Use template</div>
              <label class="confirm-check">
                <input type="checkbox" id="decline-confirm" />
                <span><strong>I confirm this decision is final</strong><br/><span style="color:var(--text-muted);font-size:0.82rem;">Once submitted, this action cannot be undone immediately.</span></span>
              </label>
              <button class="btn-danger" style="width:100%;">Decline Offer ×</button>
              <button class="btn-cancel" style="width:100%;margin-top:8px;border-radius:var(--radius-sm);padding:11px;" onclick="hideDeclineForm()">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- NETWORK -->
      <div id="view-network" class="view">
        <div style="margin-bottom:20px;display:flex;gap:12px;align-items:center;">
          <div class="search-bar" style="flex:1;margin-bottom:0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search alumni by name, batch, or industry..." />
          </div>
          <div class="filter-chips" style="margin-bottom:0;">
            <div class="chip">Information Technology <span class="x">×</span></div>
            <div class="chip">Davao City <span class="x">×</span></div>
          </div>
        </div>
        <div class="network-grid">
          <div class="alumni-card"><div class="alumni-avatar">MR</div><div class="alumni-name">Maria Reyes</div><div class="alumni-title">Software Engineer at SkyTech</div><div class="alumni-class">Class of 2022</div><button class="connect-btn">Connect</button></div>
          <div class="alumni-card"><div class="alumni-avatar" style="background:linear-gradient(135deg,#c9a84c,#e3c46a);color:var(--navy)">JP</div><div class="alumni-name">Juan Pascual</div><div class="alumni-title">Product Manager at Grab PH</div><div class="alumni-class">Class of 2020</div><button class="connect-btn">Connect</button></div>
          <div class="alumni-card"><div class="alumni-avatar" style="background:linear-gradient(135deg,var(--success),#2ecc71);">AL</div><div class="alumni-name">Ana Lim</div><div class="alumni-title">UX Designer at Canva AU</div><div class="alumni-class">Class of 2021</div><button class="connect-btn">Connect</button></div>
          <div class="alumni-card"><div class="alumni-avatar" style="background:linear-gradient(135deg,#9b59b6,#8e44ad);">RC</div><div class="alumni-name">Ramon Cruz</div><div class="alumni-title">Data Scientist at BDO</div><div class="alumni-class">Class of 2019</div><button class="connect-btn">Connect</button></div>
          <div class="alumni-card"><div class="alumni-avatar" style="background:linear-gradient(135deg,#e74c3c,#c0392b);">KS</div><div class="alumni-name">Karen Santos</div><div class="alumni-title">IT Manager at PLDT</div><div class="alumni-class">Class of 2018</div><button class="connect-btn">Connect</button></div>
          <div class="alumni-card"><div class="alumni-avatar" style="background:linear-gradient(135deg,#1abc9c,#16a085);">BT</div><div class="alumni-name">Bert Tan</div><div class="alumni-title">Full-stack Dev at Accenture</div><div class="alumni-class">Class of 2023</div><button class="connect-btn">Connect</button></div>
        </div>
      </div>

      <!-- NOTIFICATIONS -->
      <div id="view-notifications" class="view">
        <h2 style="font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--navy);margin-bottom:20px;">Notifications</h2>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="background:var(--white);border-radius:var(--radius);box-shadow:var(--card-shadow);padding:16px 20px;display:flex;gap:14px;align-items:flex-start;border-left:3px solid var(--blue-accent);">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--blue-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0;">🎉</div>
            <div><div style="font-weight:600;font-size:0.92rem;">Offer Received from SkyTech Davao</div><div style="font-size:0.82rem;color:var(--text-muted);margin-top:3px;">You received a job offer for Junior Full Stack Developer. Review by Dec 10, 2023.</div><div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">2 hours ago</div></div>
          </div>
          <div style="background:var(--white);border-radius:var(--radius);box-shadow:var(--card-shadow);padding:16px 20px;display:flex;gap:14px;align-items:flex-start;border-left:3px solid var(--success);">
            <div style="width:40px;height:40px;border-radius:50%;background:#d1e7dd;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✅</div>
            <div><div style="font-weight:600;font-size:0.92rem;">Application Shortlisted — Global Engineering Corp</div><div style="font-size:0.82rem;color:var(--text-muted);margin-top:3px;">Your profile stood out! The hiring manager would like to schedule an initial screening.</div><div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">5 days ago</div></div>
          </div>
          <div style="background:var(--white);border-radius:var(--radius);box-shadow:var(--card-shadow);padding:16px 20px;display:flex;gap:14px;align-items:flex-start;border-left:3px solid var(--gold);">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(201,168,76,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">📅</div>
            <div><div style="font-weight:600;font-size:0.92rem;">Alumni Webinar: Tech Trends — Tomorrow</div><div style="font-size:0.82rem;color:var(--text-muted);margin-top:3px;">Reminder: Webinar starts at 6:00 PM via Zoom. Don't forget to register.</div><div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">1 day ago</div></div>
          </div>
          <div style="background:var(--white);border-radius:var(--radius);box-shadow:var(--card-shadow);padding:16px 20px;display:flex;gap:14px;align-items:flex-start;">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--off-white);display:flex;align-items:center;justify-content:center;flex-shrink:0;">👤</div>
            <div><div style="font-weight:600;font-size:0.92rem;">Maria Reyes wants to connect</div><div style="font-size:0.82rem;color:var(--text-muted);margin-top:3px;">Maria Reyes (Class of 2022) sent you a connection request.</div><div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">3 days ago</div></div>
          </div>
        </div>
      </div>

      <!-- PROFILE -->
      <div id="view-profile" class="view">
        <div id="profile-main">
          <div class="profile-layout">
            <div>
              <div class="profile-card">
                <div class="profile-banner"></div>
                <div class="profile-avatar-wrap">
                  <div class="profile-avatar">S</div>
                  <div class="verified-badge">✅ Verified Alumni</div>
                  <div class="profile-name">Stephany</div>
                  <div class="profile-subtitle">Class of 2026 &bull; Information Technology</div>
                  <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">Ateneo de Davao University</div>
                </div>
                <div class="profile-menu">
                  <div class="profile-menu-item" onclick="showSubview('verification')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>Alumni ID</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                  <div class="profile-menu-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Personal Information</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                  <div class="profile-menu-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg><span>Academic Records</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                  <div class="profile-menu-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg><span>Job Preferences</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                  <div class="profile-menu-item" onclick="showSubview('settings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg><span>Settings</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                  <div class="profile-menu-item danger" onclick="showPage('page-splash')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg><span>Logout</span></div>
                </div>
              </div>
            </div>
            <div>
              <div class="profile-details-card">
                <h3>Account Information</h3>
                <div class="info-row">
                  <div class="info-field"><label>Full Name</label><p>Jobs, Stephany A.</p></div>
                  <div class="info-field"><label>Alumni ID</label><p>ALM-2020-BJ-9928-VX812</p></div>
                </div>
                <div class="info-row">
                  <div class="info-field"><label>Degree Program</label><p>Bachelor of Science in Information Technology</p></div>
                  <div class="info-field"><label>Graduation Year</label><p>2018</p></div>
                </div>
                <div class="info-row">
                  <div class="info-field"><label>Honors</label><p>Cum Laude</p></div>
                  <div class="info-field"><label>Status</label><p style="color:var(--success);font-weight:600;">✅ Verified Alumni</p></div>
                </div>
                <div style="border-top:1px solid var(--border);padding-top:20px;margin-top:8px;">
                  <h3 style="margin-bottom:16px;">Contact Details</h3>
                  <div class="info-row">
                    <div class="info-field"><label>Email</label><p>stephany.jobs@addu.edu.ph</p></div>
                    <div class="info-field"><label>Phone</label><p>+63 917 123 4567</p></div>
                  </div>
                  <div class="info-row">
                    <div class="info-field"><label>City</label><p>Davao City, Philippines</p></div>
                    <div class="info-field"><label>LinkedIn</label><p style="color:var(--blue-accent);">linkedin.com/in/stephanyjobs</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification subview -->
        <div id="subview-verification" style="display:none;">
          <button class="back-btn" onclick="hideSubview()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Profile
          </button>
          <div class="verification-card">
            <div class="ver-header">
              <div class="ver-avatar">S</div>
              <div style="font-size:1.2rem;font-weight:700;margin-bottom:4px;">Jobs, Stephany A.</div>
              <div class="verified-badge" style="display:inline-flex;">✅ Verified Alumni</div>
            </div>
            <div class="ver-body">
              <div class="ver-row">
                <div class="ver-field"><label>Degree Program</label><p>Bachelor of Science in Information Technology</p></div>
                <div class="ver-field"><label>Graduation Year</label><p>Class of 2018</p></div>
              </div>
              <div class="ver-row">
                <div class="ver-field"><label>Honors</label><p>Cum Laude</p></div>
                <div class="ver-field"><label>Alumni ID</label><p style="font-family:monospace;color:var(--blue-accent);">ALM-2020-BJ-9928</p></div>
              </div>
              <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Verification Hash</div>
              <div class="hash-box">ALM-2020-BJ-9928-VX812</div>
              <button class="btn-navy" style="width:100%;padding:13px;display:flex;align-items:center;justify-content:center;gap:8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                Download Official Verification (PDF)
              </button>
              <div class="ver-note">This digital credential is cryptographically signed and can be used for employment background checks and academic verification.</div>
              <div class="ver-actions">
                <button class="btn-navy" style="display:flex;align-items:center;justify-content:center;gap:6px;">✉️ Email HR</button>
                <button style="background:var(--off-white);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;font-size:0.88rem;display:flex;align-items:center;justify-content:center;gap:6px;">🔗 Copy Link</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings subview -->
        <div id="subview-settings" style="display:none;">
          <button class="back-btn" onclick="hideSubview()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Profile
          </button>
          <div class="settings-layout">
            <div class="settings-nav">
              <div class="settings-nav-item active">🔒 Privacy</div>
              <div class="settings-nav-item">🔑 Security</div>
              <div class="settings-nav-item">🔔 Notifications</div>
            </div>
            <div class="settings-content">
              <h3 style="font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--navy);margin-bottom:20px;">Privacy Settings</h3>
              <div class="settings-section">
                <h4>Privacy</h4>
                <div class="settings-item">
                  <div class="settings-item-info">
                    <h4>Stealth Mode</h4>
                    <p>Your profile and activity will be hidden from the companies listed below.</p>
                  </div>
                  <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
                </div>
              </div>
              <div class="settings-section">
                <h4>Blocked Companies <span style="background:var(--blue-soft);color:var(--blue-accent);border-radius:50px;padding:2px 8px;font-size:0.75rem;margin-left:6px;">3 Active</span></h4>
                <div class="add-block-row">
                  <input type="text" placeholder="Add a company to block list..." />
                  <button class="btn-sm">Add</button>
                </div>
                <div class="stealth-companies">
                  <div class="blocked-company"><div class="blocked-co-info"><div class="blocked-co-logo">TC</div><div><div class="blocked-co-name">TechCorp Solutions</div><div class="blocked-co-date">Added 2 months ago</div></div></div><button class="remove-btn">🗑</button></div>
                  <div class="blocked-company"><div class="blocked-co-info"><div class="blocked-co-logo">GF</div><div><div class="blocked-co-name">Global Finance Inc.</div><div class="blocked-co-date">Added yesterday</div></div></div><button class="remove-btn">🗑</button></div>
                  <div class="blocked-company"><div class="blocked-co-info"><div class="blocked-co-logo">AI</div><div><div class="blocked-co-name">Apex Innovations</div><div class="blocked-co-date">Current Employer</div></div></div><button class="remove-btn">🗑</button></div>
                </div>
                <div class="anon-note">ℹ️ Recruiters from companies in this list will see your profile as "Anonymous Candidate" without photos or identifying details.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- ===== MODALS ===== -->

<!-- Filter Modal -->
<div id="filter-modal" class="modal-overlay" onclick="closeModal(event,'filter-modal')">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="document.getElementById('filter-modal').classList.remove('open')">×</button>
    <h3>Filters</h3>
    <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;">Refine your alumni job search</p>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--off-white);border-radius:var(--radius-sm);margin-bottom:16px;">
      <span style="font-size:0.9rem;font-weight:600;">⭐ Blue Knight Priority</span>
      <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
    </div>
    <div class="filter-section">
      <label>Filter by Skills (Select up to 3)</label>
      <div class="filter-chips" style="margin-bottom:8px;"><div class="chip">UI Design <span class="x">×</span></div><div class="chip">Figma <span class="x">×</span></div></div>
      <input style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.88rem;" placeholder="Search for skills..." />
    </div>
    <div class="filter-section">
      <label>Location</label>
      <input style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.88rem;" placeholder="Search city or region..." />
      <div class="filter-chips" style="margin-top:8px;"><div class="chip">Davao City <span class="x">×</span></div></div>
    </div>
    <div class="filter-section">
      <label>Industry</label>
      <div class="filter-btns">
        <button class="filter-btn on">Information Technology</button>
        <button class="filter-btn">Engineering</button>
        <button class="filter-btn">Design</button>
        <button class="filter-btn">Marketing</button>
        <button class="filter-btn">Management</button>
      </div>
    </div>
    <div class="filter-section">
      <label>Job Type (Select all that apply)</label>
      <div class="filter-btns">
        <button class="filter-btn on">Full-Time</button>
        <button class="filter-btn">Part-Time</button>
        <button class="filter-btn">Freelance</button>
        <button class="filter-btn">Internship</button>
        <button class="filter-btn on">Remote</button>
      </div>
    </div>
    <div class="filter-section">
      <label>Experience Level</label>
      <select style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.88rem;background:var(--white);">
        <option>Executive (10+ years) — Senior Knight</option>
        <option>Mid-level (3-5 years)</option>
        <option>Entry-level (0-2 years)</option>
      </select>
    </div>
    <div class="filter-section">
      <label>Monthly Salary &nbsp; <strong>₱60k – ₱150k</strong></label>
      <div class="range-row">
        <span>₱20k</span>
        <input type="range" min="20000" max="300000" value="60000" style="flex:1;" />
        <input type="range" min="20000" max="300000" value="150000" style="flex:1;" />
        <span>₱300k+</span>
      </div>
    </div>
    <button class="btn-primary" onclick="document.getElementById('filter-modal').classList.remove('open')">Apply Filter &rarr;</button>
  </div>
</div>

<!-- QR Scan Modal -->
<div id="qr-modal" class="modal-overlay" onclick="closeModal(event,'qr-modal')">
  <div class="modal" onclick="event.stopPropagation()" style="max-width:440px;">
    <button class="modal-close" onclick="document.getElementById('qr-modal').classList.remove('open')">×</button>
    <h3>Application &amp; Status</h3>
    <div style="background:var(--off-white);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px;">
      <div style="font-weight:600;font-size:0.93rem;">Junior Full Stack Developer</div>
      <div style="font-size:0.8rem;color:var(--text-muted);">SkyTech Davao</div>
      <div style="margin-top:6px;display:flex;gap:8px;"><span class="bkp-badge">⭐ Blue Knight Priority</span><span style="font-size:0.78rem;color:var(--text-muted);">📍 Davao City</span></div>
    </div>
    <div style="text-align:center;background:var(--navy);border-radius:var(--radius-sm);padding:18px;margin-bottom:16px;cursor:pointer;" onclick="switchToScan()">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" style="margin-bottom:8px;"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="4" height="4"/></svg>
      <div style="color:white;font-weight:600;font-size:0.9rem;">Scan QR to Apply</div>
      <div style="color:rgba(255,255,255,0.6);font-size:0.8rem;margin-top:4px;">Instant application at event booth</div>
    </div>
    <div id="scan-view" style="display:none;">
      <div style="background:#111;border-radius:var(--radius);padding:30px;text-align:center;position:relative;margin-bottom:14px;">
        <div style="border:3px solid #4a9eff;border-radius:10px;width:160px;height:160px;margin:0 auto;display:flex;align-items:center;justify-content:center;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        </div>
        <div style="color:rgba(255,255,255,0.6);font-size:0.82rem;margin-top:12px;">Align QR code within the frame</div>
      </div>
      <div style="background:var(--off-white);border-radius:var(--radius-sm);padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:10px;">
        <span style="color:var(--success);font-size:1.1rem;">✅</span>
        <div><div style="font-weight:600;font-size:0.88rem;">Verified Credentials Found</div><div style="font-size:0.78rem;color:var(--text-muted);">Linked from University Registrar</div></div>
      </div>
      <div class="verified-docs">
        <div class="doc-row"><span>📄 Transcript of Records (TOR) — Official Copy • 2023</span><span class="doc-check">✓</span></div>
        <div class="doc-row"><span>🎓 University Diploma — Bachelor of Science in IT</span><span class="doc-check">✓</span></div>
        <div class="doc-row" style="color:var(--blue-accent);cursor:pointer;"><span>+ 3 Additional Certificates Available</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--off-white);border-radius:var(--radius-sm);margin:10px 0;">
        <span style="font-size:0.85rem;font-weight:500;">Automatically share verified documents</span>
        <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
      </div>
      <button class="btn-primary" onclick="document.getElementById('qr-modal').classList.remove('open')">
        🛡 Submit Application
      </button>
      <div style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:8px;">Secured by University Registrar System</div>
    </div>
    <div id="no-scan-view">
      <h4 style="font-size:0.88rem;font-weight:700;color:var(--navy);margin-bottom:10px;">ABOUT THE ROLE</h4>
      <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.6;margin-bottom:14px;">We are looking for a passionate Junior Software Engineer to join our growing team. You will be working directly with our senior engineers to build scalable applications.</p>
      <h4 style="font-size:0.88rem;font-weight:700;color:var(--navy);margin-bottom:10px;">REQUIREMENTS</h4>
      <ul class="req-list" style="margin-bottom:14px;"><li>Bachelor's degree in Computer Science or related field</li><li>Proficiency in JavaScript, HTML, and CSS</li><li>Experience with React or Vue.js is a plus</li><li>Strong problem-solving skills</li></ul>
      <h4 style="font-size:0.88rem;font-weight:700;color:var(--navy);margin-bottom:10px;">BENEFITS</h4>
      <div class="benefit-chips" style="margin-bottom:16px;"><div class="benefit-chip">🏥 Health Insurance — Full coverage</div><div class="benefit-chip">🏠 Remote Work — Hybrid options</div></div>
      <button class="btn-primary" onclick="switchToScan()">Apply Now &rarr;</button>
    </div>
  </div>
</div>
</template>

<style>
    /* ===== CSS VARIABLES ===== */
    :root {
      --navy: #0d1b4b;
      --navy-mid: #162060;
      --navy-light: #1e2f7a;
      --gold: #c9a84c;
      --gold-light: #e3c46a;
      --white: #ffffff;
      --off-white: #f4f6fb;
      --text: #1a1a2e;
      --text-muted: #6b7299;
      --border: #dde2f0;
      --success: #27ae60;
      --warning: #f39c12;
      --danger: #e74c3c;
      --blue-accent: #3a5bd9;
      --blue-soft: #e8edf9;
      --card-shadow: 0 4px 24px rgba(13,27,75,0.10);
      --radius: 14px;
      --radius-sm: 8px;
    }

    /* ===== RESET ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 15px; scroll-behavior: smooth; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--off-white);
      color: var(--text);
      min-height: 100vh;
    }
    button { cursor: pointer; border: none; outline: none; font-family: inherit; }
    input, select, textarea { font-family: inherit; outline: none; }
    a { text-decoration: none; color: inherit; }

    /* ===== PAGE SYSTEM ===== */
    .page { display: none; min-height: 100vh; }
    .page.active { display: flex; flex-direction: column; }

    /* ===== SPLASH ===== */
    #page-splash {
      background: var(--navy);
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    #page-splash::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.12) 0%, transparent 65%),
                  radial-gradient(ellipse at 20% 80%, rgba(58,91,217,0.15) 0%, transparent 50%);
    }
    .splash-content { text-align: center; z-index: 1; animation: fadeUp 0.9s ease; }
    .splash-logo { width: 96px; height: 96px; margin: 0 auto 20px; }
    .splash-logo svg { width: 100%; height: 100%; }
    .splash-title { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: var(--white); letter-spacing: 1px; }
    .splash-tagline { font-style: italic; color: var(--gold); font-size: 1.15rem; margin: 6px 0 32px; }
    .splash-btn {
      background: var(--gold);
      color: var(--navy);
      font-weight: 600;
      font-size: 1rem;
      padding: 14px 44px;
      border-radius: 50px;
      transition: background 0.2s, transform 0.15s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .splash-btn:hover { background: var(--gold-light); transform: translateY(-1px); }
    .splash-login { margin-top: 18px; color: rgba(255,255,255,0.65); font-size: 0.9rem; }
    .splash-login span { color: var(--gold); cursor: pointer; font-weight: 500; }

    /* ===== AUTH LAYOUT ===== */
    #page-login, #page-register {
      background: var(--navy);
      align-items: stretch;
      flex-direction: row;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(145deg, var(--navy-light) 0%, var(--navy) 100%);
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      padding: 60px 48px;
      position: relative; overflow: hidden;
    }
    .auth-left::after {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at 70% 30%, rgba(201,168,76,0.15) 0%, transparent 55%);
    }
    .auth-left-content { z-index: 1; text-align: center; }
    .auth-left-logo { width: 80px; margin-bottom: 16px; }
    .auth-left h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: var(--white); }
    .auth-left p { color: rgba(255,255,255,0.65); margin-top: 14px; line-height: 1.7; max-width: 320px; }
    .auth-left .tagline { color: var(--gold); font-style: italic; font-size: 1.05rem; margin-top: 8px; }
    .auth-highlight-cards { margin-top: 40px; display: flex; flex-direction: column; gap: 12px; }
    .auth-hcard {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: var(--radius-sm);
      padding: 14px 18px;
      display: flex; align-items: center; gap: 12px; color: var(--white);
    }
    .auth-hcard span { font-size: 0.88rem; opacity: 0.8; }
    .auth-right {
      width: 460px; min-height: 100vh;
      background: var(--white);
      display: flex; flex-direction: column; justify-content: center;
      padding: 48px 44px;
      overflow-y: auto;
    }
    .auth-right h2 { font-family: 'Playfair Display', serif; font-size: 1.7rem; color: var(--navy); }
    .auth-right .sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; margin-bottom: 28px; }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .form-group input, .form-group select {
      width: 100%; padding: 12px 14px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      transition: border-color 0.2s;
      background: var(--off-white);
    }
    .form-group input:focus { border-color: var(--blue-accent); background: var(--white); }
    .btn-primary {
      width: 100%; background: var(--navy);
      color: var(--white); font-weight: 600; font-size: 1rem;
      padding: 14px; border-radius: var(--radius-sm);
      transition: background 0.2s; margin-top: 6px;
    }
    .btn-primary:hover { background: var(--navy-light); }
    .btn-outline {
      width: 100%; background: transparent;
      border: 1.5px solid var(--border);
      color: var(--text); font-size: 0.95rem;
      padding: 12px; border-radius: var(--radius-sm);
      transition: border-color 0.2s, background 0.2s; margin-top: 8px;
    }
    .btn-outline:hover { border-color: var(--blue-accent); background: var(--blue-soft); }
    .auth-switch { text-align: center; margin-top: 20px; color: var(--text-muted); font-size: 0.9rem; }
    .auth-switch span { color: var(--blue-accent); cursor: pointer; font-weight: 500; }
    .biometric-row {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(13,27,75,0.04); border-radius: var(--radius-sm);
      padding: 12px 14px; margin-bottom: 18px;
    }
    .biometric-row label { font-size: 0.9rem; font-weight: 500; }
    .toggle { position: relative; width: 44px; height: 24px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; cursor: pointer; inset: 0;
      background: var(--border); border-radius: 50px;
      transition: 0.2s;
    }
    .toggle-slider::before {
      content: ''; position: absolute;
      width: 18px; height: 18px; left: 3px; bottom: 3px;
      background: white; border-radius: 50%;
      transition: 0.2s;
    }
    .toggle input:checked + .toggle-slider { background: var(--blue-accent); }
    .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }
    .divider { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin: 12px 0; position: relative; }
    .divider::before, .divider::after {
      content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: var(--border);
    }
    .divider::before { left: 0; } .divider::after { right: 0; }
    .remember-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .remember-row label { display: flex; align-items: center; gap: 6px; font-size: 0.88rem; cursor: pointer; }
    .remember-row a { color: var(--blue-accent); font-size: 0.88rem; }

    /* ===== APP SHELL ===== */
    #page-app { flex-direction: row; }
    .sidebar {
      width: 240px; min-height: 100vh;
      background: var(--navy);
      display: flex; flex-direction: column;
      padding: 28px 0;
      position: fixed; top: 0; left: 0; bottom: 0;
      z-index: 100;
    }
    .sidebar-logo {
      display: flex; align-items: center; gap: 10px;
      padding: 0 22px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.09);
    }
    .sidebar-logo img, .sidebar-logo .logo-icon { width: 38px; height: 38px; }
    .sidebar-logo-text { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--white); }
    .sidebar-logo-text span { display: block; font-family: 'DM Sans', sans-serif; font-size: 0.72rem; color: var(--gold); font-style: italic; font-weight: 400; }
    .sidebar-nav { flex: 1; padding: 18px 0; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 22px;
      color: rgba(255,255,255,0.6);
      font-size: 0.93rem; font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      border-left: 3px solid transparent;
      position: relative;
    }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--white); }
    .nav-item.active { background: rgba(201,168,76,0.12); color: var(--white); border-left-color: var(--gold); }
    .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
    .sidebar-footer { padding: 18px 22px 0; border-top: 1px solid rgba(255,255,255,0.09); }
    .sidebar-user { display: flex; align-items: center; gap: 10px; }
    .sidebar-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: var(--navy); font-size: 0.95rem;
    }
    .sidebar-user-info { flex: 1; }
    .sidebar-user-name { color: var(--white); font-size: 0.88rem; font-weight: 600; }
    .sidebar-user-class { color: rgba(255,255,255,0.45); font-size: 0.75rem; }
    .logout-btn { background: none; color: rgba(255,255,255,0.45); font-size: 0.8rem; padding: 6px 0; margin-top: 10px; cursor: pointer; transition: color 0.15s; }
    .logout-btn:hover { color: var(--white); }

    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(13, 27, 75, 0.45);
      z-index: 90;
    }
    .sidebar-mobile-header {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--white);
      font-weight: 600;
      font-size: 0.95rem;
    }
    .sidebar-mobile-close {
      background: rgba(255, 255, 255, 0.1);
      color: var(--white);
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      font-size: 1.35rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .sidebar-mobile-close:hover { background: rgba(255, 255, 255, 0.18); }

    .app-main { margin-left: 240px; flex: 1; min-width: 0; }
    .topbar {
      background: var(--white);
      border-bottom: 1px solid var(--border);
      padding: 0 36px;
      height: 62px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
    }
    .topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .mobile-nav-toggle {
      display: none;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      color: var(--navy);
      background: var(--off-white);
      border: 1.5px solid var(--border);
      transition: background 0.15s, border-color 0.15s;
    }
    .mobile-nav-toggle:hover { background: var(--blue-soft); border-color: rgba(58, 91, 217, 0.25); }
    .topbar-title { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: var(--navy); }
    .topbar-right { display: flex; align-items: center; gap: 14px; }
    .topbar-notif {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--off-white); border: 1.5px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; position: relative;
    }
    .notif-dot {
      width: 8px; height: 8px; background: var(--danger);
      border-radius: 50%; position: absolute; top: 6px; right: 6px;
      border: 1.5px solid var(--white);
    }
    .topbar-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: var(--navy); font-size: 0.88rem;
      cursor: pointer;
    }

    .content-area { padding: 36px; max-width: 1200px; }

    /* ===== VIEWS ===== */
    .view { display: none; }
    .view.active { display: block; }

    /* ===== HOME ===== */
    .hero-banner {
      background: linear-gradient(125deg, var(--navy) 0%, var(--navy-light) 60%, #2a3d8f 100%);
      border-radius: var(--radius);
      padding: 36px 40px;
      color: var(--white);
      margin-bottom: 28px;
      position: relative; overflow: hidden;
    }
    .hero-banner::before {
      content: '';
      position: absolute; right: -60px; top: -60px;
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 65%);
      border-radius: 50%;
    }
    .hero-banner .badge { background: rgba(201,168,76,0.2); color: var(--gold); border: 1px solid rgba(201,168,76,0.35); border-radius: 50px; padding: 4px 12px; font-size: 0.8rem; font-weight: 600; display: inline-block; margin-bottom: 10px; }
    .hero-banner h2 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 6px; }
    .hero-banner p { color: rgba(255,255,255,0.65); font-size: 0.92rem; }
    .hero-actions { margin-top: 22px; display: flex; gap: 12px; }
    .btn-gold { background: var(--gold); color: var(--navy); font-weight: 600; padding: 10px 22px; border-radius: 50px; font-size: 0.9rem; transition: background 0.2s; }
    .btn-gold:hover { background: var(--gold-light); }
    .btn-ghost { background: rgba(255,255,255,0.12); color: var(--white); border: 1px solid rgba(255,255,255,0.25); font-weight: 500; padding: 10px 22px; border-radius: 50px; font-size: 0.9rem; transition: background 0.2s; }
    .btn-ghost:hover { background: rgba(255,255,255,0.2); }

    .dashboard-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .dash-card {
      background: var(--white); border-radius: var(--radius);
      padding: 22px 20px;
      box-shadow: var(--card-shadow);
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
      text-align: center;
    }
    .dash-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(13,27,75,0.14); }
    .dash-icon {
      width: 48px; height: 48px;
      background: var(--blue-soft);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: var(--blue-accent);
    }
    .dash-icon svg { width: 22px; height: 22px; }
    .dash-label { font-size: 0.88rem; font-weight: 600; color: var(--text); }

    .two-col { display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--navy); }
    .view-all { color: var(--blue-accent); font-size: 0.88rem; cursor: pointer; font-weight: 500; }
    .news-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .news-card {
      background: var(--white); border-radius: var(--radius-sm);
      overflow: hidden; box-shadow: var(--card-shadow);
      cursor: pointer; transition: transform 0.15s;
    }
    .news-card:hover { transform: translateY(-2px); }
    .news-img { height: 110px; background: linear-gradient(135deg, var(--navy), var(--navy-light)); display: flex; align-items: center; justify-content: center; }
    .news-img.gold { background: linear-gradient(135deg, #c9a84c, #e3c46a); }
    .news-body { padding: 12px; }
    .news-tag { font-size: 0.75rem; font-weight: 600; color: var(--blue-accent); text-transform: uppercase; letter-spacing: 0.5px; }
    .news-title { font-size: 0.88rem; font-weight: 600; margin-top: 4px; line-height: 1.4; }
    .news-excerpt { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }

    .events-list { display: flex; flex-direction: column; gap: 10px; }
    .event-item {
      background: var(--white); border-radius: var(--radius-sm);
      padding: 14px 16px; box-shadow: var(--card-shadow);
      display: flex; align-items: center; gap: 14px;
      cursor: pointer; transition: transform 0.15s;
    }
    .event-item:hover { transform: translateX(3px); }
    .event-date {
      text-align: center; min-width: 46px;
      background: var(--navy); border-radius: var(--radius-sm);
      padding: 8px 6px; color: var(--white);
    }
    .event-date .month { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; }
    .event-date .day { font-size: 1.3rem; font-weight: 700; line-height: 1; }
    .event-info { flex: 1; }
    .event-title { font-size: 0.88rem; font-weight: 600; }
    .event-meta { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

    /* ===== JOBS ===== */
    .jobs-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 24px; }
    .jobs-sidebar { display: flex; flex-direction: column; gap: 16px; }
    .panel {
      background: var(--white); border-radius: var(--radius);
      box-shadow: var(--card-shadow); overflow: hidden;
    }
    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .panel-header h3 { font-size: 0.95rem; font-weight: 700; color: var(--navy); }
    .search-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--off-white); margin-bottom: 14px;
    }
    .search-bar input { flex: 1; background: none; border: none; font-size: 0.9rem; }
    .search-bar svg { width: 16px; height: 16px; color: var(--text-muted); }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .chip {
      background: var(--blue-soft); color: var(--blue-accent);
      border: 1px solid rgba(58,91,217,0.2);
      border-radius: 50px; padding: 4px 12px; font-size: 0.8rem; font-weight: 500;
      display: flex; align-items: center; gap: 5px; cursor: pointer;
    }
    .chip .x { font-size: 0.75rem; opacity: 0.7; }
    .job-list { display: flex; flex-direction: column; gap: 10px; }
    .job-card {
      background: var(--white); border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      padding: 14px 16px; cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .job-card:hover, .job-card.selected { border-color: var(--blue-accent); box-shadow: 0 2px 12px rgba(58,91,217,0.12); }
    .job-card-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .company-logo {
      width: 38px; height: 38px; border-radius: 8px;
      background: var(--navy); display: flex; align-items: center; justify-content: center;
      color: var(--white); font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .job-card-info { flex: 1; }
    .job-title { font-size: 0.93rem; font-weight: 600; }
    .job-company { font-size: 0.8rem; color: var(--text-muted); }
    .bkp-badge {
      background: rgba(13,27,75,0.07); color: var(--navy);
      border: 1px solid rgba(13,27,75,0.15);
      border-radius: 50px; padding: 2px 8px; font-size: 0.72rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;
    }
    .job-meta { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
    .job-meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--text-muted); }
    .job-meta-item svg { width: 13px; height: 13px; }
    .job-detail-panel { display: flex; flex-direction: column; }
    .job-detail { display: none; }
    .job-detail.active { display: flex; flex-direction: column; }
    .job-detail-header { background: var(--navy); border-radius: var(--radius) var(--radius) 0 0; padding: 28px 28px 20px; color: var(--white); }
    .job-detail-body { flex: 1; padding: 24px 28px; overflow-y: auto; }
    .job-detail h2 { font-family: 'Playfair Display', serif; font-size: 1.45rem; margin-bottom: 4px; }
    .job-detail-company { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    .apply-btn {
      background: var(--gold); color: var(--navy); font-weight: 700;
      padding: 13px 28px; border-radius: var(--radius-sm); font-size: 0.95rem;
      margin-top: 20px; transition: background 0.2s; display: inline-block;
    }
    .apply-btn:hover { background: var(--gold-light); }
    .detail-section { margin-bottom: 20px; }
    .detail-section h4 { font-size: 0.88rem; font-weight: 700; color: var(--navy); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .req-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
    .req-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.88rem; line-height: 1.5; }
    .req-list li::before { content: '✓'; color: var(--success); font-weight: 700; flex-shrink: 0; margin-top: 1px; }
    .benefit-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .benefit-chip { background: var(--blue-soft); border-radius: var(--radius-sm); padding: 8px 14px; font-size: 0.83rem; font-weight: 500; color: var(--blue-accent); }

    /* Applications */
    .app-tabs { display: flex; gap: 4px; background: var(--off-white); border-radius: 50px; padding: 4px; margin-bottom: 20px; width: fit-content; }
    .app-tab { padding: 8px 20px; border-radius: 50px; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: background 0.15s; color: var(--text-muted); }
    .app-tab.active { background: var(--white); color: var(--navy); box-shadow: 0 2px 8px rgba(0,0,0,0.08); font-weight: 600; }
    .applications-list { display: flex; flex-direction: column; gap: 12px; }
    .app-item {
      background: var(--white); border-radius: var(--radius);
      box-shadow: var(--card-shadow); padding: 18px 20px;
      display: flex; align-items: center; gap: 16px;
      cursor: pointer; transition: transform 0.15s;
    }
    .app-item:hover { transform: translateX(3px); }
    .app-status {
      padding: 4px 12px; border-radius: 50px; font-size: 0.78rem; font-weight: 600;
    }
    .status-review { background: #fff3cd; color: #856404; }
    .status-shortlisted { background: #d1e7dd; color: #155724; }
    .status-accepted { background: #cfe2ff; color: #084298; }
    .status-not-selected { background: #f8d7da; color: #842029; }
    .status-pending { background: var(--off-white); color: var(--text-muted); }
    .status-offer { background: #d1e7dd; color: #155724; }

    /* Offer Details */
    .offer-card {
      background: var(--white); border-radius: var(--radius);
      box-shadow: var(--card-shadow); overflow: hidden; max-width: 680px;
    }
    .offer-header { background: var(--navy); padding: 24px 28px; color: var(--white); display: flex; align-items: center; gap: 14px; }
    .offer-body { padding: 28px; }
    .status-timeline { display: flex; flex-direction: column; gap: 0; margin-bottom: 24px; }
    .timeline-step { display: flex; align-items: flex-start; gap: 14px; padding-bottom: 18px; position: relative; }
    .timeline-step::before { content: ''; position: absolute; left: 15px; top: 30px; bottom: 0; width: 2px; background: var(--border); }
    .timeline-step:last-child::before { display: none; }
    .timeline-dot { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; z-index: 1; }
    .timeline-dot.done { background: var(--success); color: white; }
    .timeline-dot.active-dot { background: var(--blue-accent); color: white; }
    .timeline-dot.pending { background: var(--border); color: var(--text-muted); }
    .timeline-info { padding-top: 4px; }
    .timeline-label { font-size: 0.9rem; font-weight: 600; }
    .timeline-date { font-size: 0.78rem; color: var(--text-muted); }
    .congrats-box { background: #d1e7dd; border-radius: var(--radius-sm); padding: 16px 18px; margin-bottom: 20px; }
    .congrats-box h4 { color: #155724; font-size: 0.95rem; margin-bottom: 4px; }
    .congrats-box p { color: #155724; font-size: 0.85rem; line-height: 1.5; }
    .offer-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .oh-item { background: var(--off-white); border-radius: var(--radius-sm); padding: 14px; display: flex; align-items: flex-start; gap: 10px; }
    .oh-icon { width: 36px; height: 36px; background: var(--blue-soft); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .oh-icon svg { width: 18px; height: 18px; color: var(--blue-accent); }
    .oh-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
    .oh-value { font-size: 0.93rem; font-weight: 700; color: var(--navy); }
    .benefits-list { list-style: none; display: flex; flex-direction: column; gap: 5px; margin-top: 6px; }
    .benefits-list li { font-size: 0.83rem; display: flex; align-items: center; gap: 6px; color: var(--success); }
    .offer-actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn-danger { background: var(--danger); color: white; font-weight: 600; padding: 12px 28px; border-radius: var(--radius-sm); font-size: 0.93rem; transition: opacity 0.2s; }
    .btn-danger:hover { opacity: 0.85; }
    .btn-success { background: var(--success); color: white; font-weight: 600; padding: 12px 28px; border-radius: var(--radius-sm); font-size: 0.93rem; transition: opacity 0.2s; }
    .btn-success:hover { opacity: 0.85; }

    /* Decline Form */
    .decline-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--card-shadow); max-width: 560px; overflow: hidden; }
    .decline-header { background: var(--navy); padding: 20px 24px; color: var(--white); display: flex; align-items: center; gap: 12px; }
    .decline-body { padding: 24px; }
    .info-box { background: #e8f4fd; border-left: 3px solid var(--blue-accent); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 20px; font-size: 0.85rem; color: #084298; line-height: 1.5; }
    .form-group textarea { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.9rem; resize: vertical; min-height: 100px; transition: border-color 0.2s; }
    .form-group textarea:focus { border-color: var(--blue-accent); }
    .char-count { text-align: right; font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; }
    .confirm-check { display: flex; align-items: flex-start; gap: 10px; font-size: 0.88rem; margin-bottom: 20px; cursor: pointer; }
    .confirm-check input { margin-top: 2px; }

    /* ===== NETWORK ===== */
    .network-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .alumni-card {
      background: var(--white); border-radius: var(--radius);
      box-shadow: var(--card-shadow); padding: 22px 18px;
      text-align: center; cursor: pointer;
      transition: transform 0.15s;
    }
    .alumni-card:hover { transform: translateY(-3px); }
    .alumni-avatar {
      width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 12px;
      background: linear-gradient(135deg, var(--navy), var(--navy-light));
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1.3rem; font-weight: 700;
    }
    .alumni-name { font-weight: 600; font-size: 0.95rem; }
    .alumni-title { font-size: 0.8rem; color: var(--text-muted); margin-top: 3px; }
    .alumni-class { font-size: 0.78rem; color: var(--blue-accent); margin-top: 4px; font-weight: 500; }
    .connect-btn { background: var(--blue-soft); color: var(--blue-accent); border: 1.5px solid rgba(58,91,217,0.25); border-radius: 50px; padding: 7px 18px; font-size: 0.83rem; font-weight: 600; margin-top: 12px; transition: background 0.2s; }
    .connect-btn:hover { background: var(--blue-accent); color: white; }

    /* ===== PROFILE ===== */
    .profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
    .profile-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--card-shadow); overflow: hidden; }
    .profile-banner { height: 100px; background: linear-gradient(125deg, var(--navy), var(--navy-light)); position: relative; }
    .profile-avatar-wrap { padding: 0 20px 20px; margin-top: -40px; }
    .profile-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; font-weight: 700; color: var(--navy);
      border: 3px solid var(--white);
    }
    .verified-badge { background: var(--blue-soft); border: 1px solid rgba(58,91,217,0.25); color: var(--blue-accent); border-radius: 50px; padding: 4px 12px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; }
    .profile-name { font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-top: 10px; }
    .profile-subtitle { font-size: 0.83rem; color: var(--text-muted); }
    .profile-menu { border-top: 1px solid var(--border); }
    .profile-menu-item { display: flex; align-items: center; gap: 12px; padding: 13px 20px; cursor: pointer; font-size: 0.9rem; transition: background 0.15s; }
    .profile-menu-item:hover { background: var(--off-white); }
    .profile-menu-item svg { width: 18px; height: 18px; color: var(--text-muted); }
    .profile-menu-item.danger { color: var(--danger); }
    .profile-menu-item.danger svg { color: var(--danger); }
    .profile-menu-item .chevron { margin-left: auto; color: var(--border); }

    .profile-details-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--card-shadow); padding: 28px; }
    .profile-details-card h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--navy); margin-bottom: 20px; }
    .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .info-field label { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
    .info-field p { font-size: 0.92rem; }

    /* Alumni Verification */
    .verification-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--card-shadow); max-width: 540px; overflow: hidden; }
    .ver-header { background: var(--navy); padding: 28px; text-align: center; color: white; }
    .ver-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-light)); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 700; color: var(--navy); margin: 0 auto 12px; border: 3px solid rgba(255,255,255,0.2); }
    .ver-body { padding: 28px; }
    .ver-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
    .ver-field label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px; }
    .ver-field p { font-size: 0.9rem; font-weight: 500; }
    .hash-box { background: var(--off-white); border-radius: var(--radius-sm); padding: 12px 14px; font-family: monospace; font-size: 0.88rem; color: var(--blue-accent); letter-spacing: 1px; margin-bottom: 16px; }
    .ver-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
    .btn-navy { background: var(--navy); color: white; font-weight: 600; padding: 11px; border-radius: var(--radius-sm); font-size: 0.88rem; transition: opacity 0.2s; }
    .btn-navy:hover { opacity: 0.85; }
    .ver-note { font-size: 0.78rem; color: var(--text-muted); text-align: center; margin-top: 12px; line-height: 1.5; }

    /* Settings */
    .settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 24px; }
    .settings-nav { background: var(--white); border-radius: var(--radius); box-shadow: var(--card-shadow); padding: 10px 0; height: fit-content; }
    .settings-nav-item { padding: 11px 18px; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s; }
    .settings-nav-item:hover { background: var(--off-white); }
    .settings-nav-item.active { background: var(--blue-soft); color: var(--blue-accent); font-weight: 600; }
    .settings-content { background: var(--white); border-radius: var(--radius); box-shadow: var(--card-shadow); padding: 28px; }
    .settings-section { margin-bottom: 24px; }
    .settings-section h4 { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 14px; }
    .settings-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); }
    .settings-item:last-child { border-bottom: none; }
    .settings-item-info h4 { font-size: 0.92rem; font-weight: 600; margin-bottom: 2px; }
    .settings-item-info p { font-size: 0.8rem; color: var(--text-muted); }
    .stealth-companies { margin-top: 14px; }
    .blocked-company { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--off-white); border-radius: var(--radius-sm); margin-bottom: 8px; }
    .blocked-co-info { display: flex; align-items: center; gap: 10px; }
    .blocked-co-logo { width: 34px; height: 34px; background: var(--border); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }
    .blocked-co-name { font-size: 0.88rem; font-weight: 500; }
    .blocked-co-date { font-size: 0.75rem; color: var(--text-muted); }
    .remove-btn { color: var(--danger); background: none; font-size: 0.82rem; }
    .anon-note { background: #e8f4fd; border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.82rem; color: #084298; margin-top: 10px; }
    .add-block-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .add-block-row input { flex: 1; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.88rem; }
    .btn-sm { padding: 9px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; background: var(--navy); color: white; }

    /* Stealth / Filters Modal */
    .modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(13,27,75,0.55); z-index: 200;
      align-items: center; justify-content: center;
    }
    .modal-overlay.open { display: flex; }
    .modal {
      background: var(--white); border-radius: var(--radius);
      padding: 28px; max-width: 520px; width: 100%;
      box-shadow: 0 20px 60px rgba(13,27,75,0.25);
      animation: fadeUp 0.25s ease;
      max-height: 90vh; overflow-y: auto;
    }
    .modal h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--navy); margin-bottom: 18px; }
    .modal-close { float: right; background: none; font-size: 1.2rem; color: var(--text-muted); cursor: pointer; }
    .modal-footer { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
    .btn-cancel { background: var(--off-white); color: var(--text); padding: 10px 20px; border-radius: var(--radius-sm); font-size: 0.9rem; }
    .filter-section { margin-bottom: 16px; }
    .filter-section label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
    .filter-btns { display: flex; flex-wrap: wrap; gap: 8px; }
    .filter-btn { padding: 7px 16px; border-radius: 50px; border: 1.5px solid var(--border); font-size: 0.85rem; cursor: pointer; transition: all 0.15s; background: var(--white); }
    .filter-btn.on { background: var(--navy); color: white; border-color: var(--navy); }
    .range-row { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
    .range-row input[type=range] { flex: 1; accent-color: var(--navy); }

    /* QR Scan Modal */
    .qr-frame { border: 3px dashed var(--blue-accent); border-radius: var(--radius); padding: 40px; text-align: center; background: rgba(58,91,217,0.04); margin: 16px 0; }
    .qr-frame svg { width: 64px; height: 64px; color: var(--blue-accent); margin-bottom: 10px; }
    .verified-docs { display: flex; flex-direction: column; gap: 8px; margin: 14px 0; }
    .doc-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--off-white); border-radius: var(--radius-sm); font-size: 0.88rem; }
    .doc-check { color: var(--success); font-weight: 700; }

    /* ===== ANIMATIONS ===== */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ===== RESPONSIVE ===== */
    html.mobile-nav-lock { overflow: hidden; }

    @media (max-width: 1100px) {
      .dashboard-cards { grid-template-columns: repeat(2, 1fr); }
      .two-col { grid-template-columns: 1fr; }
      .jobs-layout { grid-template-columns: 1fr; }
      .network-grid { grid-template-columns: repeat(2, 1fr); }
      .profile-layout { grid-template-columns: 1fr; }
    }

    @media (max-width: 900px) {
      .mobile-nav-toggle { display: inline-flex; }
      .sidebar-backdrop {
        display: block;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.2s ease, visibility 0.2s;
      }
      .app-shell.mobile-nav-open .sidebar-backdrop {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
      .sidebar-mobile-header { display: flex; }
      .sidebar {
        width: min(300px, 88vw);
        transform: translateX(-100%);
        transition: transform 0.28s ease;
        box-shadow: 8px 0 40px rgba(13, 27, 75, 0.18);
      }
      .app-shell.mobile-nav-open .sidebar {
        transform: translateX(0);
      }
      .sidebar-logo {
        padding: 0 22px 20px;
        justify-content: flex-start;
      }
      .nav-item {
        padding: 11px 22px;
        justify-content: flex-start;
      }
      .sidebar-footer { padding: 18px 22px 0; }
      .app-main { margin-left: 0; }
      .topbar { padding: 0 16px; }
      .content-area { padding: 20px 16px; }
      .hero-banner { padding: 24px 20px; }
      .hero-banner h2 { font-size: 1.45rem; }
      .hero-actions { flex-wrap: wrap; }
      .dashboard-cards { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .dash-card { padding: 16px 12px; }
      .auth-left { display: none; }
      #page-login, #page-register { flex-direction: column; }
      .auth-right {
        width: 100% !important;
        max-width: none;
        min-height: auto;
        padding: 28px 20px 40px;
      }
      .modal { margin: 0 14px; max-height: 85vh; padding: 22px 18px; }
      .offer-actions { flex-wrap: wrap; }
      .info-row { grid-template-columns: 1fr; }
      .ver-actions { grid-template-columns: 1fr; }
      .app-item { flex-wrap: wrap; align-items: flex-start; }
      .job-detail-header { padding: 20px 18px 16px; }
      .job-detail-body { padding: 18px 16px; }
      .profile-details-card { padding: 20px 16px; }
      .settings-content { padding: 20px 16px; }
    }

    @media (max-width: 800px) {
      .news-grid { grid-template-columns: 1fr; }
      .offer-highlights { grid-template-columns: 1fr; }
      .ver-row { grid-template-columns: 1fr; }
      .settings-layout { grid-template-columns: 1fr; }
    }

    @media (max-width: 520px) {
      .splash-title { font-size: 1.85rem; }
      .splash-tagline { font-size: 1rem; }
      .splash-btn { padding: 12px 28px; font-size: 0.95rem; }
      .auth-left h1 { font-size: 1.65rem; }
      .topbar-title { font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dashboard-cards { grid-template-columns: 1fr; }
      .network-grid { grid-template-columns: 1fr; }
      .app-tab { padding: 8px 14px; font-size: 0.82rem; }
      .app-tabs { max-width: 100%; flex-wrap: wrap; width: 100%; }
      .filter-btns { gap: 6px; }
      .filter-btn { padding: 6px 12px; font-size: 0.8rem; }
    }

    /* ===== UTILS ===== */
    .flex { display: flex; }
    .items-center { align-items: center; }
    .gap-10 { gap: 10px; }
    .gap-8 { gap: 8px; }
    .mt-4 { margin-top: 4px; }
    .mb-16 { margin-bottom: 16px; }
    .text-sm { font-size: 0.85rem; }
    .text-muted { color: var(--text-muted); }
    .font-600 { font-weight: 600; }
    .back-btn { background: none; color: var(--navy); display: flex; align-items: center; gap: 6px; font-size: 0.9rem; font-weight: 500; margin-bottom: 18px; padding: 0; }
    .back-btn:hover { color: var(--blue-accent); }
  </style>
