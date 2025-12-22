import { useWatchHistoryStore } from '../stores/useWatchHistoryStore';
import { useAuthStore } from '../stores/useAuthStore';

export const useWatchHistory = () => {
  const user = useAuthStore(state => state.user);
  const continueWatching = useWatchHistoryStore(state => state.continueWatching);
  const isLoading = useWatchHistoryStore(state => state.isLoading);
  const getProgress = useWatchHistoryStore(state => state.getProgress);
  const updateProgress = useWatchHistoryStore(state => state.updateProgress);
  const deleteItem = useWatchHistoryStore(state => state.deleteItem);

  return {
    continueWatching,
    isLoading,
    count: continueWatching.length,
    getProgress: (seriesId, episodeId) => getProgress(seriesId, episodeId),
    updateProgress: (seriesId, episodeId, currentTime, seriesType) => 
      updateProgress(user?.uid, seriesId, episodeId, currentTime, seriesType),
    remove: (seriesId) => deleteItem(user?.uid, seriesId)
  };
};
