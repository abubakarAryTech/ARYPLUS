import { getConfig } from '../../config.js';
import logger from '../services/logger';

const LOCATION_KEY = 'user_location';
let pendingRequest = null;

export const fetchLocation = async () => {
  const cached = sessionStorage.getItem(LOCATION_KEY);
  if (cached) {
    logger.log('✅ Using cached location (no API call)');
    return cached;
  }

  if (pendingRequest) {
    logger.log('⏳ Waiting for existing location request');
    return pendingRequest;
  }

  pendingRequest = (async () => {
    try {
      const config = getConfig();
      const cacheBuster = `deviceID=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      const url = `${config.appClouflareLocationIp}?${cacheBuster}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      const results = await resp.json();
      const countryCode = results.country_code?.toUpperCase() || 'PK';
      logger.log('🌍 Detected country code:', countryCode);
      sessionStorage.setItem(LOCATION_KEY, countryCode);
      return countryCode;
    } catch (error) {
      logger.error('Error fetching location:', error);
      const fallback = 'PK';
      sessionStorage.setItem(LOCATION_KEY, fallback);
      return fallback;
    } finally {
      pendingRequest = null;
    }
  })();

  return pendingRequest;
};
