import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';
import logger from '../services/logger';

export const useRoyaltyStore = create((set, get) => ({
  points: 0,
  dailyStreak: {
    current: 0,
    longest: 0,
    lastActivity: null
  },
  bonusAvailable: true,
  isLoading: false,
  dailyBonusData: null,
  showDailyBonusModal: false,

  fetchRoyaltyData: async (userId) => {
    if (!userId) return;

    try {
      const response = await api.get(`/api/v2/royalty-points/summary/${userId}`);
      
      if (response.data && response.data.success) {
        const userData = response.data.data;
        
        set({
          points: userData.totalPoints || 0,
          dailyStreak: userData.dailyStreak || {
            current: 0,
            longest: 0,
            lastActivity: null
          }
        });

        get().checkBonusAvailability(userData.dailyStreak);
      }
    } catch (error) {
      logger.error('Error fetching royalty data:', error);
    }
  },

  checkBonusAvailability: (streakData) => {
    if (!streakData?.lastActivity) {
      set({ bonusAvailable: true });
      return;
    }

    const lastActivity = new Date(streakData.lastActivity);
    const today = new Date();
    const daysSince = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    set({ bonusAvailable: daysSince >= 1 });
  },

  claimDailyBonus: async (userId) => {
    if (!userId) return;

    set({ isLoading: true });
    try {
      const response = await api.post(`/api/v2/royalty-points/daily-login/${userId}`);

      if (response.data && response.data.success) {
        const bonusData = response.data.data;

        const userResponse = await api.get(`/api/v2/royalty-points/summary/${userId}`);
        
        if (userResponse.data && userResponse.data.success) {
          const userData = userResponse.data.data;
          
          set({
            dailyBonusData: {
              ...bonusData,
              currentStreak: userData.dailyStreak?.current || 0,
              longestStreak: userData.dailyStreak?.longest || 0,
              lastActivity: userData.dailyStreak?.lastActivity || null
            },
            bonusAvailable: false,
            points: userData.totalPoints || 0,
            dailyStreak: userData.dailyStreak,
            isLoading: false,
            showDailyBonusModal: true
          });

          toast.success(`Daily bonus claimed! +${bonusData.bonus || 50} points!`);
          return true;
        }
      } else {
        const errorMessage = response.data?.message || 'Failed to claim daily login bonus.';
        toast.error(errorMessage);
      }
    } catch (error) {
      logger.error('Error claiming daily bonus:', error);
      toast.error(error.response?.data?.message || 'Failed to claim bonus');
      set({ isLoading: false });
      return false;
    }
  },

  calculateExpectedBonus: (currentStreak) => {
    if (currentStreak <= 7) {
      return Math.floor(currentStreak * 0.1 * 50);
    } else {
      const cycleDay = ((currentStreak - 1) % 7) + 1;
      return Math.floor(cycleDay * 0.1 * 50);
    }
  },

  setShowDailyBonusModal: (show) => {
    set({ showDailyBonusModal: show });
  },

  clearBonusData: () => {
    set({ dailyBonusData: null });
  }
}));
