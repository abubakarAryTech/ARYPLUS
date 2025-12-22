import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import sessionService from '../services/session';
import { useAuthStore } from './useAuthStore';

import logger from '../services/logger';

export const useSessionStore = create(
  persist(
    (set, get) => ({
      isSessionValid: true,
      lastValidation: null,
      sessionExpired: false,

      validateSession: async () => {
        const result = await sessionService.validateSession();
        
        set({ 
          isSessionValid: result.valid,
          lastValidation: Date.now(),
          sessionExpired: !result.valid
        });

        if (!result.valid) {
          logger.warn('⚠️ Session validation failed:', result.reason);
          get().handleSessionExpiry(result.reason);
        }

        return result;
      },

      handleSessionExpiry: (reason) => {
        logger.warn('🚪 Handling session expiry:', reason);
        
        // Don't logout if PayFast payment is in progress
        try {
          if (sessionStorage.getItem('payfastPaymentInProgress') === 'true') {
            logger.log('⏸️ PayFast payment in progress, skipping logout');
            return;
          }
        } catch (e) {}
        
        // Clear session and logout
        sessionService.logoutSession();
        useAuthStore.getState().logout();
        
        set({ sessionExpired: true, isSessionValid: false });
      },

      startSessionMonitoring: () => {
        sessionService.startValidation((reason) => {
          get().handleSessionExpiry(reason);
        });
        logger.log('🔍 Session monitoring started');
      },

      stopSessionMonitoring: () => {
        sessionService.stopValidation();
        logger.log('⏹️ Session monitoring stopped');
      },

      reset: () => {
        set({
          isSessionValid: true,
          lastValidation: null,
          sessionExpired: false
        });
      }
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        lastValidation: state.lastValidation
      })
    }
  )
);