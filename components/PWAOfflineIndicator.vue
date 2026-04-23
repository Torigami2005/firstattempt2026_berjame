<template>
  <Transition name="fade">
    <div v-show="isOffline" class="pwa-offline-indicator">
      <div class="offline-content">
        <span class="offline-icon">⚠</span>
        <span class="offline-text">You are offline – Using cached data</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import PWAManager from '@/utils/pwa-manager.js';

const isOffline = ref(false);

let unsubscribe = null;

onMounted(() => {
  // Initial check
  isOffline.value = !navigator.onLine;

  // Listen for network changes
  const handleNetworkChange = (event) => {
    isOffline.value = !event.detail.isOnline;
  };

  window.addEventListener('pwa-network-change', handleNetworkChange);

  unsubscribe = () => {
    window.removeEventListener('pwa-network-change', handleNetworkChange);
  };
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
.pwa-offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #d32f2f 0%, #c62828 100%);
  color: white;
  padding: 12px 20px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-family: 'DM Sans', sans-serif;
}

.offline-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.offline-icon {
  font-size: 18px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.offline-text {
  flex: 1;
}

@media (max-width: 600px) {
  .pwa-offline-indicator {
    padding: 10px 16px;
  }

  .offline-content {
    font-size: 12px;
  }

  .offline-icon {
    font-size: 16px;
  }
}

/* Transition animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
