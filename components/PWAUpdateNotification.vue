<template>
  <Transition name="slide">
    <div v-if="showUpdate" class="pwa-update-notification">
      <div class="update-content">
        <div class="update-icon">🔄</div>
        <div class="update-text">
          <p class="update-title">Update Available</p>
          <p class="update-desc">A new version of Blue Links is ready</p>
        </div>
        <button @click="handleUpdate" class="update-btn">Update Now</button>
        <button @click="handleDismiss" class="dismiss-btn" aria-label="Dismiss">✕</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showUpdate = ref(false);
const isUpdating = ref(false);

let unsubscribe = null;

onMounted(() => {
  window.addEventListener('pwa-update-ready', handleUpdateReady);

  unsubscribe = () => {
    window.removeEventListener('pwa-update-ready', handleUpdateReady);
  };
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const handleUpdateReady = () => {
  showUpdate.value = true;
  console.log('[UpdateNotification] Update ready');
};

const handleUpdate = async () => {
  isUpdating.value = true;
  // Reload page to apply update
  window.location.reload();
};

const handleDismiss = () => {
  showUpdate.value = false;
};
</script>

<style scoped>
.pwa-update-notification {
  position: fixed;
  top: 60px;
  right: 20px;
  background: white;
  border-left: 4px solid #003366;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9997;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
  font-family: 'DM Sans', sans-serif;
}

@keyframes slideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.update-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.update-icon {
  font-size: 28px;
  animation: rotate 2s linear infinite;
  flex-shrink: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.update-text {
  flex: 1;
  min-width: 0;
}

.update-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #003366;
}

.update-desc {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
}

.update-btn {
  padding: 8px 14px;
  background: #003366;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.update-btn:hover {
  background: #004d80;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.dismiss-btn:hover {
  color: #333;
}

@media (max-width: 600px) {
  .pwa-update-notification {
    right: 10px;
    left: 10px;
    top: auto;
    bottom: 80px;
    max-width: none;
  }

  .update-content {
    flex-wrap: wrap;
  }

  .update-icon {
    order: 1;
  }

  .update-text {
    order: 2;
    min-width: 100%;
  }

  .update-btn {
    order: 3;
    flex: 1;
  }

  .dismiss-btn {
    order: 4;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(120%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
</style>
