<template>
  <div v-if="showPrompt" class="pwa-install-prompt">
    <div class="pwa-install-content">
      <div class="pwa-install-icon">
        <svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="installGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#003366;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#004d80;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="192" height="192" fill="url(#installGradient)"/>
          <path d="M 96 20 L 140 40 L 140 95 C 140 125 115 155 96 170 C 77 155 52 125 52 95 L 52 40 Z" fill="none" stroke="#c9a84c" stroke-width="3"/>
          <text x="96" y="125" text-anchor="middle" font-size="72" font-weight="bold" fill="#c9a84c" font-family="Georgia, serif">B</text>
        </svg>
      </div>
      
      <div class="pwa-install-text">
        <h3>Install Blue Links</h3>
        <p>Add the alumni portal to your home screen for quick access and offline support</p>
      </div>

      <div class="pwa-install-actions">
        <button @click="handleInstall" class="pwa-btn-install">
          <span class="install-icon">⬇</span>
          Install Now
        </button>
        <button @click="handleDismiss" class="pwa-btn-dismiss">Not Now</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PWAManager from '@/utils/pwa-manager.js';

const showPrompt = ref(false);
const isInstalling = ref(false);

onMounted(() => {
  // Listen for install availability
  window.addEventListener('pwa-install-available', () => {
    showPrompt.value = true;
    console.log('[InstallPrompt] Install prompt shown');
  });

  // Listen for successful installation
  window.addEventListener('pwa-app-installed', () => {
    showPrompt.value = false;
    console.log('[InstallPrompt] App installed');
  });

  // Check if already installed
  if (PWAManager.isAppInstalled()) {
    showPrompt.value = false;
  }
});

const handleInstall = async () => {
  isInstalling.value = true;
  const installed = await PWAManager.showInstallPrompt();
  if (installed) {
    showPrompt.value = false;
  }
  isInstalling.value = false;
};

const handleDismiss = () => {
  showPrompt.value = false;
};
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #003366 0%, #004d80 100%);
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  z-index: 9998;
  animation: slideUp 0.3s ease-out;
  font-family: 'DM Sans', sans-serif;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.pwa-install-content {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.pwa-install-icon {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.pwa-install-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.pwa-install-text {
  flex: 1;
  color: white;
}

.pwa-install-text h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.pwa-install-text p {
  margin: 0;
  font-size: 13px;
  opacity: 0.95;
}

.pwa-install-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.pwa-btn-install,
.pwa-btn-dismiss {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}

.pwa-btn-install {
  background: #c9a84c;
  color: #003366;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pwa-btn-install:hover {
  background: #e0c166;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(201, 168, 76, 0.3);
}

.pwa-btn-dismiss {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pwa-btn-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}

.install-icon {
  font-size: 16px;
  display: inline-block;
}

@media (max-width: 500px) {
  .pwa-install-prompt {
    padding: 15px;
  }

  .pwa-install-content {
    flex-direction: column;
    text-align: center;
  }

  .pwa-install-text p {
    font-size: 12px;
  }

  .pwa-install-actions {
    width: 100%;
  }

  .pwa-btn-install,
  .pwa-btn-dismiss {
    flex: 1;
    width: 100%;
  }
}
</style>
