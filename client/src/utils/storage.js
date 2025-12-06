// ==================== STORAGE API ====================

const StorageAPI = {
  get: (key, shared = false) => {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      const value = localStorage.getItem(storageKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  set: (key, value, shared = false) => {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  list: (prefix, shared = false) => {
    try {
      const storagePrefix = shared ? `shared:${prefix}` : `user:${prefix}`;
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(storagePrefix)) {
          keys.push(key.replace(shared ? 'shared:' : 'user:', ''));
        }
      }
      return keys;
    } catch (error) {
      return [];
    }
  },

  delete: (key, shared = false) => {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default StorageAPI;
