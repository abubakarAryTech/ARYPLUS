import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useWatchlistStore } from '../stores';

export const useWatchlist = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  const favoriteIds = useWatchlistStore(state => state.favoriteIds);
  const add = useWatchlistStore(state => state.add);
  const remove = useWatchlistStore(state => state.remove);
  const toggle = useWatchlistStore(state => state.toggle);
  const isFavorite = useWatchlistStore(state => state.isFavorite);
  const getCount = useWatchlistStore(state => state.getCount);

  const handleToggle = useCallback(async (seriesId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return await toggle(user?.uid, seriesId);
  }, [isAuthenticated, user?.uid, toggle, navigate]);

  const handleAdd = useCallback(async (seriesId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return await add(user?.uid, seriesId);
  }, [isAuthenticated, user?.uid, add, navigate]);

  const handleRemove = useCallback(async (seriesId) => {
    if (!isAuthenticated) {
      return false;
    }
    return await remove(user?.uid, seriesId);
  }, [isAuthenticated, user?.uid, remove]);

  const checkIsFavorite = useCallback((seriesId) => {
    return isFavorite(seriesId);
  }, [isFavorite]);

  return {
    favoriteIds,
    count: getCount(),
    isFavorite: checkIsFavorite,
    toggle: handleToggle,
    add: handleAdd,
    remove: handleRemove
  };
};
