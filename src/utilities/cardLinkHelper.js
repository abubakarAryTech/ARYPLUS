/**
 * Card Link Helper Utility
 * Centralizes all link generation logic for content cards
 */

/**
 * Generates the detail page link based on series type
 * @param {string} seriesType - Type of content (show, programs, singleVideo, etc.)
 * @param {string} id - Content ID
 * @returns {string} - Detail page URL
 */
export const getDetailLink = (seriesType, id) => {
  switch (seriesType) {
    case "live":
      return `/live/v1/${id}`;
    case "live-event":
      return `/live-event/v1/${id}`;
    case "singleVideo":
      return `/series/v3/${id}`;
    case "show":
    case "programs":
      return `/series/v3/${id}`;
    default:
      return `/series/v3/${id}`;
  }
};

/**
 * Generates the play/watch link based on series type
 * @param {string} seriesType - Type of content
 * @param {string} id - Content ID
 * @returns {string} - Play/watch URL
 */
export const getPlayLink = (seriesType, id) => {
  switch (seriesType) {
    case "live":
      return `/live/v1/${id}`;
    case "live-event":
      return `/live-event/v1/${id}`;
    case "singleVideo":
      return `/watch/v1/${id}`;
    case "show":
    case "programs":
      // For shows, play button fetches first episode dynamically
      return null;
    default:
      return `/watch/v1/${id}`;
  }
};

/**
 * Wraps link with login redirect if user is not authenticated
 * @param {string} link - Target link
 * @param {boolean} isAuthenticated - User authentication status
 * @returns {string} - Link with or without login redirect
 */
export const withLoginRedirect = (link, isAuthenticated) => {
  return isAuthenticated ? link : `/login?redirect=${link}`;
};

/**
 * Checks if content supports favoriting
 * @param {string} seriesType - Type of content
 * @returns {boolean}
 */
export const canFavorite = (seriesType) => {
  return ["show", "programs", "singleVideo"].includes(seriesType);
};

/**
 * Gets display text for duration/episode count
 * @param {string} seriesType - Type of content
 * @param {number} episodeCount - Number of episodes
 * @param {string} duration - Duration string
 * @returns {string} - Display text
 */
export const getDurationText = (seriesType, episodeCount, duration) => {
  if (seriesType === "show" || seriesType === "programs") {
    return `${episodeCount ?? 20} Episodes`;
  }
  if (seriesType === "live" || seriesType === "live-event") {
    return "Live";
  }
  return duration ?? "01:01:38";
};

/**
 * Checks if video is from external source
 * @param {string} trailer - Trailer URL
 * @returns {boolean}
 */
export const isExternalVideo = (trailer) => {
  if (!trailer) return false;
  return (
    trailer.includes("youtube") ||
    trailer.includes("youtu.be") ||
    trailer.includes("dailymotion")
  );
};
