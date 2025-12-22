import axios from "axios";
import authService from "./auth";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import logger from "./logger";
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_HOME_ENDPOINT || "http://localhost:5000",
});
api.interceptors.request.use(
  async (config) => {
    // Only attach token if user is present
    const user = auth.currentUser;
    if (user) {
      try {
        // Force refresh token to ensure it's not expired
        const idToken = await user.getIdToken(true);
        config.headers["Authorization"] = `Bearer ${idToken}`;
        logger.log('🔑 Using Firebase ID token for API request');
      } catch (e) {
        logger.error('❌ Failed to get Firebase ID token:', e);
        // Try to get token without refresh as fallback
        try {
          const fallbackToken = await user.getIdToken(false);
          config.headers["Authorization"] = `Bearer ${fallbackToken}`;
          logger.log('🔑 Using fallback Firebase ID token');
        } catch (fallbackError) {
          logger.error('❌ Failed to get fallback token:', fallbackError);
        }
      }
    } else {
      // Fallback: if we have an override ID token (e.g., via deep link), attach it (session-scoped)
      let overrideToken = null;
      try { overrideToken = sessionStorage.getItem("idTokenOverride"); } catch (_) {}
      if (overrideToken) {
        config.headers["Authorization"] = `Bearer ${overrideToken}`;
        logger.log('🔑 Using override ID token for API request');
      } else {
        logger.warn('⚠️ No authentication token available for API request');
      }
    }
    // Always add x-api-key
    config.headers["x-api-key"] = import.meta.env.VITE_X_API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if ((error.response && (error.response.status === 401 || error.response.status === 403))) {
      logger.warn('🚪 API returned 401/403, session may be expired');
      
      // Don't trigger logout if PayFast payment is in progress
      try {
        if (sessionStorage.getItem('payfastPaymentInProgress') === 'true') {
          logger.log('⏸️ PayFast payment in progress, ignoring 401/403');
          return Promise.reject(error);
        }
      } catch (e) {}
      
      // Import session store dynamically to avoid circular dependency
      const { useSessionStore } = await import('../stores/useSessionStore');
      useSessionStore.getState().handleSessionExpiry('api_error');
      
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);
export default api;