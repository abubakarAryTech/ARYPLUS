import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';
import logger from '../services/logger';

const SYNC_KEY = 'watchlist_sync';

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      favoriteIds: [],
      isLoading: false,
      error: null,
      isInitialized: false,

      // Initialize watchlist from server
      initialize: async (userId) => {
        if (!userId || get().isInitialized) return;

        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/api/v2/fav/user/${userId}`);
          const ids = (response.data || [])
            .map(fav => fav.seriesId?._id)
            .filter(Boolean);
          
          set({ 
            favoriteIds: ids, 
            isLoading: false, 
            isInitialized: true 
          });

          // Broadcast to other tabs
          window.localStorage.setItem(SYNC_KEY, JSON.stringify({ 
            action: 'init',
            favoriteIds: ids,
            timestamp: Date.now()
          }));
        } catch (error) {
          logger.error('Failed to initialize watchlist:', error);
          set({ error: error.message, isLoading: false, isInitialized: true });
        }
      },

      // Add to favorites
      add: async (userId, seriesId) => {
        if (!userId) {
          toast.error('Please login to add to your list');
          return false;
        }

        const { favoriteIds } = get();
        if (favoriteIds.includes(seriesId)) return true;

        // Optimistic update
        const newIds = [...favoriteIds, seriesId];
        set({ favoriteIds: newIds });

        // Broadcast immediately
        window.localStorage.setItem(SYNC_KEY, JSON.stringify({ 
          action: 'add',
          seriesId,
          timestamp: Date.now()
        }));

        try {
          await api.post('/api/fav/cda', { userId, seriesId });
          return true;
        } catch (error) {
          logger.error('Failed to add favorite:', error);
          toast.error('Failed to add to list');
          // Rollback
          set({ favoriteIds });
          return false;
        }
      },

      // Remove from favorites
      remove: async (userId, seriesId) => {
        if (!userId) return false;

        const { favoriteIds } = get();
        if (!favoriteIds.includes(seriesId)) return true;

        // Optimistic update
        const newIds = favoriteIds.filter(id => id !== seriesId);
        const previousIds = [...favoriteIds];
        set({ favoriteIds: newIds });

        // Broadcast immediately
        window.localStorage.setItem(SYNC_KEY, JSON.stringify({ 
          action: 'remove',
          seriesId,
          timestamp: Date.now()
        }));

        try {
          await api.post('/api/fav/cda', { userId, seriesId });
          return true;
        } catch (error) {
          logger.error('Failed to remove favorite:', error);
          toast.error('Failed to remove from list');
          // Rollback
          set({ favoriteIds: previousIds });
          return false;
        }
      },

      // Toggle favorite
      toggle: async (userId, seriesId) => {
        const isFav = get().isFavorite(seriesId);
        return isFav 
          ? await get().remove(userId, seriesId)
          : await get().add(userId, seriesId);
      },

      // Check if favorite
      isFavorite: (seriesId) => {
        return get().favoriteIds.includes(seriesId);
      },

      // Get count
      getCount: () => {
        return get().favoriteIds.length;
      },

      // Clear all
      clear: () => {
        set({ 
          favoriteIds: [], 
          isLoading: false, 
          error: null, 
          isInitialized: false 
        });
      },

      // Sync from other tabs
      _syncFromStorage: (data) => {
        if (!data) return;
        
        const { action, seriesId, favoriteIds: syncedIds } = data;
        const currentIds = get().favoriteIds;

        if (action === 'init' && syncedIds) {
          set({ favoriteIds: syncedIds, isInitialized: true });
        } else if (action === 'add' && !currentIds.includes(seriesId)) {
          set({ favoriteIds: [...currentIds, seriesId] });
        } else if (action === 'remove') {
          set({ favoriteIds: currentIds.filter(id => id !== seriesId) });
        }
      }
    }),
    {
      name: 'watchlist-storage',
      partialize: (state) => ({ 
        favoriteIds: state.favoriteIds,
        isInitialized: state.isInitialized
      })
    }
  )
);

// Cross-tab sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === SYNC_KEY && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        useWatchlistStore.getState()._syncFromStorage(data);
      } catch (error) {
        logger.error('Watchlist sync error:', error);
      }
    }
  });
}
