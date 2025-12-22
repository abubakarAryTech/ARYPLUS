import { useEffect } from 'react';
import { useSessionStore } from '../stores/useSessionStore';
import { useAuthStore } from '../stores/useAuthStore';
import sessionService from '../services/session';
import logger from '../services/logger';

export const useSession = () => {
  const { 
    isSessionValid, 
    sessionExpired, 
    validateSession, 
    startSessionMonitoring, 
    stopSessionMonitoring
  } = useSessionStore();
  
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const initializeSession = async () => {
        await sessionService.createSession();
        await validateSession();
        startSessionMonitoring();
      };

      initializeSession();

      return () => {
        stopSessionMonitoring();
      };
    }
  }, [isAuthenticated, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSessionMonitoring();
    };
  }, []);

  return {
    isSessionValid,
    sessionExpired,
    validateSession
  };
};