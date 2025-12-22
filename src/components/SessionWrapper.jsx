import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSessionStore } from '../stores/useSessionStore';
import sessionService from '../services/session';
import logger from '../services/logger';

const SessionWrapper = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { startSessionMonitoring, stopSessionMonitoring } = useSessionStore();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      const initSession = async () => {
        await sessionService.createSession();
        startSessionMonitoring();
      };
      
      initSession();
    }
    
    return () => {
      stopSessionMonitoring();
    };
  }, [isAuthenticated, user?.uid, startSessionMonitoring, stopSessionMonitoring]);

  return children;
};

export default SessionWrapper;