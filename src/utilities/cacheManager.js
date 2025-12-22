const CACHE_VERSION = 'v1';
const FRESH_TTL = 30 * 60 * 1000; // 30 minutes
const STALE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const ongoingRequests = new Map();

export const cacheManager = {
  get(key) {
    try {
      const cacheKey = `${CACHE_VERSION}_${key}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;
      
      return {
        data: parsed.data,
        isFresh: age < FRESH_TTL,
        isStale: age >= FRESH_TTL && age < STALE_TTL,
        isExpired: age >= STALE_TTL,
        age
      };
    } catch (e) {
      this.remove(key);
      return null;
    }
  },

  set(key, data) {
    try {
      const cacheKey = `${CACHE_VERSION}_${key}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION
      }));
      
      this.broadcastUpdate(key);
    } catch (e) {
      import('../services/logger').then(m => m.default.error('Cache set failed:', e));
      this.cleanup();
    }
  },

  remove(key) {
    const cacheKey = `${CACHE_VERSION}_${key}`;
    localStorage.removeItem(cacheKey);
  },

  cleanup() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.includes('home_data_'));
    
    cacheKeys.forEach(key => {
      if (!key.startsWith(CACHE_VERSION)) {
        localStorage.removeItem(key);
      }
    });
    
    cacheKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const age = Date.now() - data.timestamp;
        if (age > STALE_TTL) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });
  },

  broadcastUpdate(key) {
    try {
      const channel = new BroadcastChannel('cache-updates');
      channel.postMessage({ type: 'CACHE_UPDATE', key });
      channel.close();
    } catch (e) {
      // BroadcastChannel not supported
    }
  },

  onUpdate(callback) {
    try {
      const channel = new BroadcastChannel('cache-updates');
      channel.onmessage = (event) => {
        if (event.data.type === 'CACHE_UPDATE') {
          callback(event.data.key);
        }
      };
      return () => channel.close();
    } catch (e) {
      return () => {};
    }
  },

  async deduplicateRequest(key, fetchFn) {
    if (ongoingRequests.has(key)) {
      return ongoingRequests.get(key);
    }

    const promise = fetchFn().finally(() => {
      ongoingRequests.delete(key);
    });

    ongoingRequests.set(key, promise);
    return promise;
  }
};
