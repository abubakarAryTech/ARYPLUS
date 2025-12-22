import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import logger from '../services/logger';

const SYNC_KEY = 'watch_history_sync';

const TTL_MINUTES = 60;
const TTL_MS = TTL_MINUTES * 60 * 1000;

export const useWatchHistoryStore = create(
  persist(
    (set, get) => ({
      continueWatching: [],
      isLoading: false,
      isInitialized: false,
      isInitializing: false,
      lastFetchTime: null,

      // Initialize watch history from server
      initialize: async (userId) => {
        const state = get();
        const now = Date.now();
        const isExpired = state.lastFetchTime && (now - state.lastFetchTime) > TTL_MS;
        
        if (!userId) return;
        if (state.isInitializing) return;
        if (state.isInitialized && !isExpired) return;

        set({ isLoading: true, isInitializing: true });
        try {
          const response = await api.get(`/api/v2/watch-history/complete/${userId}`);
          const history = response.data || [];

          // Enrich each series with episode watch history
          // const enrichedHistory = await Promise.all(
          //   history.map(async (item) => {
          //     try {
          //       const progressRes = await api.get(
          //         `/api/v2/watch-history/by-user-series/${userId}/${item.seriesId}`
          //       );
          //       const episodeHistory = progressRes.data || [];

          //       // Fetch episode metadata for multi-episode series
          //       if (item.seriesType === 'show' || item.seriesType === 'programs') {
          //         const episodeMetaMap = {};
          //         const uniqueEpisodeIds = [...new Set(episodeHistory.map(ep => ep.episodeId))];

          //         await Promise.all(
          //           uniqueEpisodeIds.map(async (episodeId) => {
          //             try {
          //               const cdnResponse = await api.get(`/api/cdn/ep/${episodeId}`);
          //               episodeMetaMap[episodeId] = cdnResponse.data;
          //             } catch {}
          //           })
          //         );

          //         const enrichedEpisodes = episodeHistory.map(ep => ({
          //           ...ep,
          //           metadata: episodeMetaMap[ep.episodeId] || null
          //         }));

          //         return { ...item, episodeWatchHistory: enrichedEpisodes };
          //       }

          //       // For single videos
          //       const enrichedEpisodes = episodeHistory.map(ep => ({
          //         ...ep,
          //         metadata: {
          //           episode: {
          //             videoLength: item.videoLength || 0,
          //             videoEpNumber: null
          //           }
          //         }
          //       }));

          //       return { ...item, episodeWatchHistory: enrichedEpisodes };
          //     } catch {
          //       return { ...item, episodeWatchHistory: [] };
          //     }
          //   })
          // );

          set({
            continueWatching: history,
            isLoading: false,
            isInitialized: true,
            isInitializing: false,
            lastFetchTime: Date.now()
          });
        } catch (error) {
          logger.error('Failed to initialize watch history:', error);
          set({ isLoading: false, isInitialized: true, isInitializing: false, lastFetchTime: Date.now() });
        }
      },

      // Get progress for specific episode
      getProgress: (seriesId, episodeId) => {
        const { continueWatching } = get();
        const series = continueWatching.find(item => item.seriesId === seriesId);
        return series?.episodeWatchHistory?.find(ep => ep.episodeId === episodeId);
      },

      // Update watch progress
      updateProgress: async (userId, seriesId, episodeId, currentTime) => {
        if (!userId || !seriesId || currentTime == null) {
        logger.warn("updateProgress called with missing parameters:", {
          userId,
          seriesId,
          currentTime,
        });
        return;
      }

        try {
          const updateResponse = await api.post('/api/watch-history/upd', {
            userId,
            seriesId,
            episodeId,
            currentTime: Math.floor(currentTime),
            seriesType: episodeId ? 'show' : 'singleVideo'
          });

          // Handle buffered response (coalescing service)
          if (updateResponse.data.buffered) {
            // For buffered responses, update local state optimistically
            const { continueWatching } = get();
            const existingIndex = continueWatching.findIndex(item => item.seriesId === seriesId);

            if (existingIndex >= 0) {
              const updated = [...continueWatching];
              updated[existingIndex] = { 
                ...updated[existingIndex], 
                episodeWatchHistory: updated[existingIndex].episodeWatchHistory?.map(ep => 
                  ep.episodeId === episodeId 
                    ? { ...ep, currentTime: Math.floor(currentTime), updatedAt: new Date().toISOString() }
                    : ep
                ) || []
              };
              set({ continueWatching: updated });
            }
          } else {
            // Handle direct write response (fallback)
            const watchHistoryId = updateResponse.data._id;

            if (watchHistoryId) {
              // Fetch only the specific updated watch history
              const specificResponse = await api.get(`/api/watch-history/complete-by-id/${watchHistoryId}`);
              const updatedRecord = specificResponse.data;

              const { continueWatching } = get();
              const existingIndex = continueWatching.findIndex(item => item.seriesId === seriesId);

              if (existingIndex >= 0) {
                const updated = [...continueWatching];
                updated[existingIndex] = { ...updated[existingIndex], ...updatedRecord };
                set({ continueWatching: updated });
              } else {
                set({ continueWatching: [updatedRecord, ...continueWatching] });
              }
            }
          }

          window.localStorage.setItem(SYNC_KEY, JSON.stringify({
            action: 'update',
            seriesId,
            currentTime,
            timestamp: Date.now()
          }));
        } catch (error) {
          logger.error('Failed to update watch progress:', error);
        }
      },



      // Delete from watch history
      deleteItem: async (userId, seriesId) => {
        if (!userId || !seriesId) return;

        const { continueWatching } = get();
        const newContinueWatching = continueWatching.filter(item => item.seriesId !== seriesId);
        set({ continueWatching: newContinueWatching });

        try {
          await api.delete(`/api/v2/watch-history/delete/${userId}/${seriesId}`);
          
          window.localStorage.setItem(SYNC_KEY, JSON.stringify({
            action: 'remove',
            seriesId,
            timestamp: Date.now()
          }));
        } catch (error) {
          logger.error('Failed to delete watch history:', error);
        }
      },

      // Clear all
      clear: () => {
        set({
          continueWatching: [],
          isLoading: false,
          isInitialized: false,
          isInitializing: false,
          lastFetchTime: null
        });
      },

      // Sync from other tabs
      _syncFromStorage: (data) => {
        if (!data) return;

        const { action, seriesId, continueWatching: syncedHistory } = data;
        const { continueWatching, lastFetchTime } = get();

        if (action === 'init' && syncedHistory) {
          set({ continueWatching: syncedHistory, isInitialized: true, lastFetchTime: data.timestamp || lastFetchTime });
        } else if (action === 'remove') {
          set({
            continueWatching: continueWatching.filter(item => item.seriesId !== seriesId)
          });
        } else if (action === 'update') {
          const { currentTime } = data;
          const index = continueWatching.findIndex(item => item.seriesId === seriesId);
          if (index >= 0) {
            const updated = [...continueWatching];
            updated[index] = { ...updated[index], currentTime, updatedAt: new Date().toISOString() };
            set({ continueWatching: updated });
          }
        }
      }
    }),
    {
      name: 'watch-history-storage',
      version: 1,
      partialize: (state) => ({
        continueWatching: state.continueWatching,
        isInitialized: state.isInitialized,
        lastFetchTime: state.lastFetchTime
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
        useWatchHistoryStore.getState()._syncFromStorage(data);
      } catch (error) {
        logger.error('Watch history sync error:', error);
      }
    }
  });
}
