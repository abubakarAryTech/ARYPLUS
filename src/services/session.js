import api from './api';
import { auth } from '../firebase';
import logger from './logger';

class SessionService {
  constructor() {
    this.sessionId = null;
    this.validationInterval = null;
    this.VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
  }

  async createSession() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const sessionToken = await user.getIdToken();
      const deviceInfo = navigator.userAgent;

      const response = await api.post('/api/sessions/login', {
        uid: user.uid,
        sessionToken,
        deviceInfo
      });

      if (response.data.success && response.data.sessionId) {
        this.sessionId = response.data.sessionId;
        localStorage.setItem('sessionId', this.sessionId);
        logger.log('✅ Session created successfully', { sessionId: this.sessionId });
        return response.data.session;
      }
      return null;
    } catch (error) {
      logger.error('❌ Session creation failed:', error);
      return null;
    }
  }

  async validateSession() {
    try {
      const user = auth.currentUser;
      if (!user) {
        logger.warn('⚠️ No current user found');
        return { valid: false, reason: 'no_user' };
      }

      // Get sessionId from memory or localStorage
      if (!this.sessionId) {
        this.sessionId = localStorage.getItem('sessionId');
      }

      if (!this.sessionId) {
        logger.warn('⚠️ No sessionId found');
        return { valid: false, reason: 'no_session' };
      }

      logger.log('🔄 Validating session with sessionId');

      const response = await api.get(`/api/sessions/validate/${this.sessionId}`);
      
      if (response.data.success && response.data.valid) {
        logger.log('✅ Session is valid');
        return { valid: true };
      } else {
        logger.warn('⚠️ Session is invalid:', response.data);
        return { valid: false, reason: response.data.reason || 'expired' };
      }
    } catch (error) {
      logger.error('❌ Session validation failed:', error.response?.data || error.message);
      return { valid: false, reason: 'error' };
    }
  }

  async logoutSession() {
    try {
      if (this.sessionId) {
        await api.delete(`/api/sessions/${this.sessionId}`);
        logger.log('✅ Session logged out successfully');
      }
    } catch (error) {
      logger.error('❌ Failed to logout session:', error);
    } finally {
      this.sessionId = null;
      localStorage.removeItem('sessionId');
      this.stopValidation();
    }
  }

  startValidation(onInvalid) {
    if (this.validationInterval) return;

    this.validationInterval = setInterval(async () => {
      const result = await this.validateSession();
      if (!result.valid && onInvalid) {
        onInvalid(result.reason);
      }
    }, this.VALIDATION_INTERVAL);

    logger.log('🔄 Session validation started');
  }

  stopValidation() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
      logger.log('⏹️ Session validation stopped');
    }
  }
}

export default new SessionService();