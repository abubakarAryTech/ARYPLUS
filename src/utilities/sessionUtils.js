import { useSessionStore } from '../stores/useSessionStore';
import sessionService from '../services/session';
import logger from '../services/logger';

/**
 * Utility functions for session management
 */

// Force session validation
export const forceSessionValidation = async () => {
  const sessionStore = useSessionStore.getState();
  const result = await sessionStore.validateSession();
  logger.log('🔍 Manual session validation result:', result);
  return result;
};

// Force logout all user sessions (admin function)
export const forceLogoutAllSessions = async (uid) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/sessions/user/${uid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_X_API_KEY
      }
    });
    
    const result = await response.json();
    logger.log('🚪 Force logout all sessions result:', result);
    return result;
  } catch (error) {
    logger.error('❌ Failed to force logout all sessions:', error);
    return { success: false, error: error.message };
  }
};

// Check session status without validation
export const getSessionStatus = () => {
  const sessionStore = useSessionStore.getState();
  return {
    isValid: sessionStore.isSessionValid,
    lastValidation: sessionStore.lastValidation,
    expired: sessionStore.sessionExpired,
    buildVersion: sessionStore.buildVersion
  };
};

// Reset session state (for testing)
export const resetSessionState = () => {
  const sessionStore = useSessionStore.getState();
  sessionStore.reset();
  logger.log('🔄 Session state reset');
};