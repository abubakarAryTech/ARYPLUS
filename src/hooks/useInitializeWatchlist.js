import { useEffect } from 'react';
import { useWatchlistStore, useAuthStore } from '../stores';

export const useInitializeWatchlist = () => {
  const user = useAuthStore(state => state.user);
  const isInitialized = useWatchlistStore(state => state.isInitialized);
  const initialize = useWatchlistStore(state => state.initialize);

  useEffect(() => {
    if (user?.uid && !isInitialized) {
      initialize(user.uid);
    }
  }, [user?.uid, isInitialized, initialize]);
};
