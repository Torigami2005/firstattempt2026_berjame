# 🚀 Blue Links PWA - Deployment & Configuration Guide

## Pre-Deployment Checklist

### Prerequisites ✅
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git for version control
- [ ] HTTPS certificate (for production)
- [ ] Web hosting (Vercel, Netlify, AWS, etc.)

### Code Review ✅
- [ ] All PWA components imported in app.vue
- [ ] Service Worker registered successfully
- [ ] Icons are in public/ folder
- [ ] manifest.json is accessible
- [ ] All links use correct paths
- [ ] No console errors in development

### Testing ✅
- [ ] Test on Chrome (Desktop)
- [ ] Test on Firefox (Desktop)
- [ ] Test on Android device (Chrome)
- [ ] Test on iOS device (Safari)
- [ ] Test offline mode (DevTools toggle)
- [ ] Verify install prompt appears
- [ ] Check Lighthouse PWA audit

---

## 🏗️ Build Process

### 1. Development Environment
```bash
# Navigate to project
cd firstattempt2026_berjame

# Install dependencies
npm install

# Start development server
npm run dev

# App available at http://localhost:3000
```

### 2. Production Build
```bash
# Build for production
npm run build

# Output in .output/ directory
# Optimized for speed and performance

# Preview production build locally
npm run preview

# Available at http://localhost:3000
```

### 3. Build Output Structure
```
.output/
├── server/          # Nuxt server files
├── public/          # Static assets (icons, manifest, SW)
└── ...             # Other build artifacts
```

---

## 🌐 Hosting Configuration

### Option A: Vercel (Recommended for Nuxt)

1. **Create Vercel Account**
   - Visit https://vercel.com
   - Sign up with GitHub/GitLab/Bitbucket

2. **Import Project**
   ```
   - Click "New Project"
   - Select your Git repository
   - Vercel auto-detects Nuxt
   ```

3. **Configure Build Settings**
   ```
   Framework: Nuxt
   Build Command: npm run build
   Output Directory: .output/public
   ```

4. **Set Environment Variables** (if needed)
   ```
   Add any required .env variables
   ```

5. **Deploy**
   ```
   Click "Deploy"
   HTTPS automatically enabled ✅
   ```

### Option B: Netlify

1. **Create Netlify Account**
   - Visit https://netlify.com
   - Connect Git repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .output/public
   ```

3. **Deploy**
   ```
   Click "Deploy site"
   HTTPS automatically enabled ✅
   ```

### Option C: Self-Hosted (AWS, DigitalOcean, Linode)

1. **Server Requirements**
   ```
   - Node.js 18+
   - npm or yarn
   - HTTPS certificate (Let's Encrypt free)
   - 1GB RAM minimum
   - 10GB storage
   ```

2. **SSH into Server**
   ```bash
   ssh user@your-server.com
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/firstattempt2026_berjame.git
   cd firstattempt2026_berjame
   ```

4. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

5. **Start Server**
   ```bash
   # Using PM2 for process management
   npm install -g pm2
   pm2 start "npm start" --name "blue-links"
   pm2 save
   pm2 startup
   ```

6. **Configure HTTPS (Let's Encrypt)**
   ```bash
   # Using Certbot
   sudo apt install certbot python3-certbot-nginx
   sudo certbot certonly --standalone -d yourdomain.com
   ```

7. **Configure Reverse Proxy (Nginx)**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name yourdomain.com;
   
     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   
     # Service Worker - no cache
     location /service-worker.js {
       proxy_pass http://localhost:3000;
       add_header Cache-Control "no-cache, no-store, must-revalidate";
     }
   
     # Manifest - always serve fresh
     location /manifest.json {
       proxy_pass http://localhost:3000;
       add_header Cache-Control "no-cache";
     }
   
     # Static assets - cache aggressively
     location ~* \.(png|jpg|svg|woff|woff2|ttf)$ {
       proxy_pass http://localhost:3000;
       add_header Cache-Control "public, max-age=31536000, immutable";
     }
   }
   ```

---

## ⚙️ Server Configuration

### Critical Headers (Nginx)
```nginx
# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# PWA Support
add_header Service-Worker-Allowed "/" always;

# MIME types
types {
  application/manifest+json webmanifest manifest;
  application/javascript js mjs;
}
```

### Apache Configuration
```apache
# Service Worker
<Files "service-worker.js">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
  Header set Content-Type "application/javascript; charset=utf-8"
</Files>

# Manifest
<Files "manifest.json">
  Header set Cache-Control "no-cache"
  Header set Content-Type "application/manifest+json; charset=utf-8"
</Files>

# Icons - cache for 1 year
<FilesMatch "\.(png|svg|ico)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

---

## 🔐 HTTPS Configuration

### Why HTTPS is Required
- Service Workers only work over HTTPS
- PWAs require secure connection
- Protects user data
- Required for app installation

### Get Free HTTPS

#### Option 1: Cloudflare
1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Flexible SSL"
4. HTTPS enabled automatically ✅

#### Option 2: Let's Encrypt
```bash
# Installation
apt-get install certbot

# Generate certificate
certbot certonly --webroot -w /var/www -d yourdomain.com

# Auto-renewal (daily check)
certbot renew --dry-run
```

#### Option 3: Hosting Provider
- Vercel: Automatic ✅
- Netlify: Automatic ✅
- AWS: ACM (AWS Certificate Manager) ✅
- DigitalOcean: Free with Spaces ✅

---

## 📋 Post-Deployment Verification

### ✅ Check Deployment
```bash
# Visit your site
https://yourdomain.com

# Should show no security warnings
# Address bar shows lock icon ✅
```

### ✅ Verify Service Worker
1. Open DevTools (F12)
2. Go to Application tab
3. Check Service Workers
4. Should show "activated and running" ✅

### ✅ Test Manifest
1. DevTools → Manifest tab
2. Verify all fields display
3. Check icons load correctly ✅

### ✅ Run Lighthouse Audit
```bash
# DevTools → Lighthouse
# Run PWA audit
# Should score 90+ for PWA category ✅
```

### ✅ Test Install
**Android:**
1. Open site in Chrome
2. Wait 2-3 seconds
3. Tap ⬇ in address bar
4. Should show install dialog ✅

**iOS:**
1. Open site in Safari
2. Tap Share (↗)
3. Select "Add to Home Screen"
4. Should install ✅

### ✅ Test Offline
1. Open app on device
2. Go offline (airplane mode)
3. Should still load
4. Should show offline indicator ✅

---

## 📊 Monitoring & Analytics

### Service Worker Updates
```bash
# Monitor in PM2
pm2 logs blue-links

# Check for SW errors
# [Service Worker] messages in logs
```

### Cache Hit Rates
```javascript
// In browser console
CacheManager.logCacheContents()
await CacheManager.getCacheSize()
```

### Performance Metrics
```bash
# Use Lighthouse CI
npm install -g @lhci/cli@*

# Configure .lighthouserc.json
# Automate PWA audits
```

### User Analytics
```javascript
// Track installs
window.addEventListener('pwa-app-installed', () => {
  // Send to analytics: user installed app
  gtag('event', 'app_installed');
});

// Track offline usage
window.addEventListener('pwa-network-change', (e) => {
  // Send to analytics: network status changed
  gtag('event', 'network_change', {
    online: e.detail.isOnline
  });
});
```

---

## 🔄 Update Strategy

### Version Management

1. **Update Service Worker**
   ```javascript
   // In public/service-worker.js
   const CACHE_VERSION = 'blue-links-v3'; // Increment version
   ```

2. **Users Notified**
   - Update notification appears
   - Users can choose to update
   - Old caches auto-delete

3. **Monitor Updates**
   ```bash
   pm2 logs
   # Watch for service worker updates
   ```

### Rollback Plan
```bash
# If critical issue found
# Revert to previous commit
git revert <commit-hash>
git push

# Update cache version to force refresh
# Old caches auto-delete
```

---

## 🚨 Troubleshooting

### Issue: Service Worker Won't Register
**Solution:**
1. Verify HTTPS enabled
2. Check `/service-worker.js` exists
3. Check browser console for errors
4. Clear cache: `CacheManager.clearAllCaches()`

### Issue: App Not Installable
**Solution:**
1. Check `/manifest.json` valid JSON
2. Verify theme-color meta tag
3. Ensure icons accessible
4. Wait 30+ seconds for install prompt
5. Try on different browser

### Issue: Offline Page Not Showing
**Solution:**
1. Check `/offline.html` exists
2. Verify Service Worker latest version
3. Purge cache and reload
4. Check network status in DevTools

### Issue: Cache Not Updating
**Solution:**
1. Increment CACHE_VERSION
2. Clear all caches
3. Reload page 2-3 times
4. New version should load

### Issue: iOS Install Not Working
**Solution:**
1. Use Safari (not Chrome)
2. Ensure HTTPS enabled
3. Check icons display correctly
4. Try adding to home screen

---

## 📝 Deployment Checklist

### Before Deploy
- [ ] All code committed to git
- [ ] No console errors
- [ ] Lighthouse PWA score ≥90
- [ ] All icons created and tested
- [ ] Service Worker tested locally
- [ ] Offline mode tested

### During Deploy
- [ ] Run `npm run build`
- [ ] Test build locally with `npm run preview`
- [ ] Deploy to hosting service
- [ ] Verify HTTPS working
- [ ] Check deployment logs for errors

### After Deploy
- [ ] Visit https://yourdomain.com
- [ ] Verify no security warnings
- [ ] Check Service Worker in DevTools
- [ ] Test install on Android
- [ ] Test install on iOS
- [ ] Test offline functionality
- [ ] Run Lighthouse audit
- [ ] Monitor logs for errors

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Let's Encrypt**: https://letsencrypt.org
- **Nginx Config**: https://nginx.org/en/docs/
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

## 🎯 Success Criteria

✅ **HTTPS enabled** - Address bar shows lock
✅ **Service Worker active** - DevTools shows "activated and running"
✅ **Lighthouse PWA audit** - Score 90+
✅ **Install prompt shows** - Android shows ⬇, iOS shows Share
✅ **Offline works** - Can load cached pages without connection
✅ **Icons display** - All app icons show correctly
✅ **Updates work** - New version notification appears
✅ **Performance** - Loads in <1 second on repeat visits

---

## Congratulations! 🎉

Your Blue Links PWA is now deployed and ready for millions of Ateneo de Davao alumni to enjoy!

**Status: PRODUCTION READY** ✅

For any issues or questions, refer to the technical documentation or contact the development team.

---

**Built with 💙 for Ateneo de Davao**
