import { isFeatureEnabled } from '../../config';

/**
 * Check if TVOD system is enabled
 * @returns {boolean}
 */
export const isTvodEnabled = () => {
  return isFeatureEnabled('tvodEnabled');
};

/**
 * Check if content requires TVOD payment
 * @param {object} content - Content object with packageIds
 * @param {object} user - User object with subscriptions
 * @returns {boolean}
 */
export const requiresTvodPayment = (content, user) => {
  if (!isTvodEnabled()) return false;
  
  // Check if content has package IDs (TVOD content)
  if (!content?.packageIds || content.packageIds.length === 0) {
    return false;
  }
  
  // Check if user has active subscription for this content
  if (!user?.subscriptions) return true;
  
  const packageId = content.packageIds[0];
  const subscription = user.subscriptions[packageId];
  
  if (!subscription) return true;
  
  // Check if subscription is active
  return subscription.subscription_status !== 'active';
};

/**
 * Get TVOD redirect URL for content
 * @param {string} seriesId - Series ID
 * @returns {string}
 */
export const getTvodUrl = (seriesId) => {
  return `/tvod/${seriesId}`;
};

/**
 * Check if user should see lock icon on content
 * @param {object} content - Content object
 * @param {object} user - User object
 * @returns {boolean}
 */
export const shouldShowLockIcon = (content, user) => {
  return isTvodEnabled() && requiresTvodPayment(content, user);
};
