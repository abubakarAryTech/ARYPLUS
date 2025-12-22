import { memo, useState, useCallback, Fragment, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getConfig } from "../../../config";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useAuthStore } from "../../stores/useAuthStore";
import { shouldShowLockIcon, getTvodUrl, isTvodEnabled } from "../../utilities/tvodHelper";
import { 
  getDetailLink, 
  getPlayLink, 
  withLoginRedirect, 
  canFavorite, 
  getDurationText,
  isExternalVideo 
} from "../../utilities/cardLinkHelper";
import logger from '../../services/logger';

// Lazy load heavy components
const VideoPlayer = lazy(() => import("../VideoPlayer"));
const SharePopupPortal = lazy(() => import("../SharePopupPortal"));

/**
 * CardStyleHover Component
 * Displays content card with hover effects, trailer preview, and action buttons
 */
const CardStyleHover = memo(({
  title,
  image,
  seriesType,
  trailer,
  id,
  episodeCount,
  duration,
  genres,
  ageRating,
  packageInfo,
  descBox = true,
}) => {
  const config = getConfig();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Video preview state
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef();
  
  // Share popup state
  const [showSharePopup, setShowSharePopup] = useState(false);
  
  // Watchlist hook
  const { isFavorite: checkFavorite, toggle } = useWatchlist();
  const isFavorite = checkFavorite(id);
  
  // TVOD (paid content) checks
  const showLock = shouldShowLockIcon({ packageIds: packageInfo }, user);
  const tvodEnabled = isTvodEnabled();
  
  // Check if trailer is from external source (YouTube, Dailymotion)
  const externalVideo = isExternalVideo(trailer);

  // Stop video preview when share popup opens
  useEffect(() => {
    if (showSharePopup) setShowVideo(false);
  }, [showSharePopup]);

  // Intersection observer for lazy video loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Toggle video mute
  const toggleMute = useCallback((e) => {
    e.preventDefault();
    setIsMuted((prev) => !prev);
  }, []);

  // Toggle favorite/watchlist
  const toggleFavorite = useCallback(async () => {
    await toggle(id);
  }, [id, toggle]);

  /**
   * Play first episode for shows/programs
   * Fetches episode list and navigates to first episode
   */
  const playFirstEpisode = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/cdn/${id}`
      );
      const data = await response.json();

      if (data?.episode?.length > 0) {
        const ep1Id = data.episode[0]._id;
        const redirect = `/video/v1/3/${ep1Id}/${id}`;
        navigate(user ? redirect : `/login?redirect=${redirect}`);
      }
    } catch (error) {
      logger.error("Failed to fetch episodes:", error);
    }
  }, [id, navigate, user]);

  /**
   * Handle play button click
   * - For locked content: redirect to TVOD page
   * - For shows/programs: play first episode
   * - For singleVideo: check subscription and redirect accordingly
   */
  const handlePlayClick = useCallback((e) => {
    // For shows/programs, fetch and play first episode
    if (seriesType === "show" || seriesType === "programs") {
      e.preventDefault();
      playFirstEpisode();
      return;
    }

    // For singleVideo with TVOD enabled
    if (seriesType === "singleVideo" && tvodEnabled && packageInfo?.length > 0) {
      e.preventDefault();
      
      // Check if user has active subscription
      const hasSubscription = 
        user?.subscriptions?.[packageInfo]?.subscription_status === "active";
      
      if (!hasSubscription) {
        navigate(`/Tvod/${id}`); // Redirect to rent/purchase page
      } else {
        navigate(getPlayLink(seriesType, id)); // Play content
      }
    }
  }, [seriesType, tvodEnabled, packageInfo, user, id, navigate, playFirstEpisode]);

  // Generate links
  const detailLink = getDetailLink(seriesType, id);
  const playLink = getPlayLink(seriesType, id);
  const shareLink = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/sharer/series/${id}`;

  return (
    <Fragment>
      <div
        className="hover-custom-card"
        onMouseEnter={() => isInView && setShowVideo(true)}
        onMouseLeave={() => setShowVideo(false)}
        ref={cardRef}
      >
        <div className="iq-card card-hover">
          <div className="block-images position-relative w-100">
            
            {/* Lock icon for paid content */}
            {showLock && seriesType !== "live" && seriesType !== "live-event" && (
              <div className="lock-icon-wrapper position-absolute top-0 start-0">
                <span className="lock-icon text-white" style={{ lineHeight: '0px' }}>
                  <span className="rent-text">Exclusive Content</span>
                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.17505 0.000125443C4.18358 0.000176602 4.19148 0.000223888 4.19867 0.000223888H6.33959C6.35042 -5.60509e-05 6.36127 -5.76403e-05 6.37216 0.000223888H9.62784C9.63873 -5.76403e-05 9.64959 -5.60509e-05 9.66041 0.000223888H11.8013C11.8085 0.000223888 11.8164 0.000176602 11.8249 0.000125443C11.9083 -0.000374037 12.0525 -0.00123799 12.1945 0.0381104C12.3161 0.0717962 12.4339 0.127983 12.5421 0.206443C12.6638 0.294635 12.7598 0.410835 12.8148 0.479491L15.5237 3.18432C15.5432 3.20375 15.5618 3.22436 15.5793 3.24605L15.5898 3.259C15.6427 3.32438 15.7068 3.40358 15.7589 3.47867C15.8193 3.56587 15.9004 3.69821 15.9502 3.87795C16.0166 4.11786 16.0166 4.3744 15.9502 4.61431C15.9004 4.79404 15.8193 4.92639 15.7589 5.01358C15.7081 5.08682 15.6459 5.16397 15.5937 5.22839L9.0665 14.31C9.05746 14.3226 9.04811 14.3348 9.03845 14.3468L9.02508 14.3633C8.95031 14.4558 8.86579 14.5603 8.78526 14.6439C8.69298 14.7397 8.55711 14.8615 8.36809 14.9326C8.12952 15.0225 7.87048 15.0225 7.63191 14.9326C7.44289 14.8615 7.30702 14.7397 7.21474 14.6439C7.13422 14.5603 7.0497 14.4558 6.97494 14.3633L6.96155 14.3468C6.95189 14.3348 6.94254 14.3226 6.9335 14.31L0.406269 5.22838C0.354117 5.16396 0.29187 5.08681 0.241122 5.01358C0.1807 4.92638 0.0996135 4.79404 0.0498336 4.6143C-0.0166112 4.3744 -0.0166113 4.11786 0.0498337 3.87795C0.0996135 3.69821 0.1807 3.56587 0.241122 3.47867C0.293163 3.40357 0.357296 3.32436 0.410234 3.25898C0.413774 3.25461 0.417263 3.2503 0.420696 3.24605C0.438246 3.22436 0.456792 3.20375 0.476255 3.18432L3.18521 0.479491C3.24023 0.410834 3.3362 0.294635 3.45786 0.206443C3.5661 0.127982 3.68391 0.0717956 3.80546 0.0381104C3.94745 -0.00123799 4.09168 -0.000374037 4.17505 0.000125443ZM2.18353 5.07945L6.51425 11.105L4.9882 5.07945H2.18353ZM6.50276 5.07945L8 10.9912L9.49724 5.07945H6.50276ZM9.51043 3.41281H6.48958L6.91005 1.66687H9.08995L9.51043 3.41281ZM11.0118 5.07945L9.48575 11.105L13.8165 5.07945H11.0118ZM13.5386 3.41281H11.0193L10.5989 1.66687H11.7925C11.8042 1.6802 11.8162 1.69308 11.8286 1.70548L13.5386 3.41281ZM5.40114 1.66687L4.98067 3.41281H2.46144L4.17137 1.70548C4.18379 1.69308 4.19584 1.6802 4.20749 1.66687H5.40114Z" fill="black"/>
                  </svg>
                </span>
              </div>
            )}

            {/* Favorite/Bookmark icon */}
            {canFavorite(seriesType) && (
              <div className="favorite-icon-wrapper position-absolute top-0 end-0 p-2">
                <span
                  className="favorite-icon fs-5"
                  onClick={toggleFavorite}
                  style={{ cursor: "pointer" }}
                >
                  {isFavorite && <i className="fa-solid fa-bookmark"></i>}
                </span>
              </div>
            )}

            {/* Main image with trailer preview */}
            <div className="img-box w-100 position-relative">
              <Link
                to={detailLink}
                className="w-100 h-100 position-relative d-block"
              >
                <img
                  src={image}
                  loading="lazy"
                  alt={title}
                  className="img-fluid object-cover w-100 d-block border-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${import.meta.env.VITE_APP_IMAGE_PATH}images/card-place-holder.jpg`;
                  }}
                />
                
                {/* Trailer video preview on hover */}
                {showVideo && trailer && !externalVideo && (
                  <Suspense fallback={null}>
                    <VideoPlayer
                      videoUrl={trailer}
                      isMuted={isMuted}
                      autoPlay={true}
                      loop={true}
                      playsInline={true}
                      showControls={false}
                      className="w-100 h-100 position-absolute top-0 start-0 object-fit-cover d-none-mobile scaleVideo"
                      style={{
                        objectFit: "cover",
                        zIndex: 1,
                        opacity: showVideo ? 1 : 0,
                        transition: "opacity 1.5s ease-in-out",
                        pointerEvents: "none",
                      }}
                    />
                    <span
                      onClick={toggleMute}
                      className="position-absolute top-0 end-0 m-2 p-2 bg-opacity-50 rounded-circle text-white"
                      style={{
                        zIndex: 2,
                        cursor: "pointer",
                        pointerEvents: "auto",
                      }}
                    >
                      <ion-icon
                        name={`volume-${isMuted ? "mute" : "medium"}-outline`}
                        style={{ fontSize: "24px" }}
                      ></ion-icon>
                    </span>
                  </Suspense>
                )}
              </Link>
            </div>

            {/* Card description (title, age rating, duration, genres) */}
            {descBox && (
              <div className="card-description with-transition">
                <div className="cart-content">
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-start mt-2">
                      <h5 className="iq-title heading text-capitalize mb-0">
                        <Link
                          className="line-clamp-1"
                          to={detailLink}
                        >
                          {title}
                        </Link>
                      </h5>
                      <span className="text-muted ms-2 ageRating">
                        {ageRating ?? "16+"}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <p
                        className="movie-time-text font-normal mb-0 text-truncate me-2 text-start"
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {getDurationText(seriesType, episodeCount, duration)}
                      </p>
                      <p
                        className="movie-time-text font-normal genre mb-0 text-truncate text-end ms-auto"
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {genres?.slice(0, 2).join(" • ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons (Play, Favorite, Share, Info) */}
            <div className="block-social-info align-items-center">
              <div className="iq-button">
                {/* Lock button for paid content */}
                {showLock && seriesType !== "live" && seriesType !== "live-event" ? (
                // {showLock ? (
                  <Link
                    to={getTvodUrl(id)}
                    title="Rent Now"
                    className="btn text-uppercase position-relative rounded-circle play-btn-custom"
                  >
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/lock-iconv2.png`}
                      alt="Rent"
                      className="icons-size"
                    />
                  </Link>
                ) : (
                  /* Play button */
                  <Link
                    to={playLink ? withLoginRedirect(playLink, !!user) : "#"}
                    onClick={handlePlayClick}
                    title="Play Now"
                    className="btn text-uppercase position-relative rounded-circle play-btn-custom"
                  >
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/play.svg`}
                      alt="Play"
                      className="icons-size"
                    />
                  </Link>
                )}
              </div>

              <ul className="p-0 m-0 d-flex gap-2 music-play-lists">
                {/* Favorite button */}
                {canFavorite(seriesType) && (
                  <li
                    onClick={toggleFavorite}
                    title="Add to List"
                    className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center"
                  >
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/${
                        isFavorite ? "add-to-list-done" : "add-to-list"
                      }.svg`}
                      alt="Favorite"
                      className="icons-size"
                    />
                  </li>
                )}

                {/* Share button */}
                <li
                  onClick={() => setShowSharePopup(true)}
                  className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center"
                  title="Share"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/link.svg`}
                    alt="Share"
                    className="icons-size"
                  />
                </li>

                {/* Info button */}
                <li
                  onClick={() => navigate(detailLink)}
                  title="More Info"
                  className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center"
                >
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/info.svg`}
                    alt="Info"
                    className="icons-size"
                  />
                </li>
              </ul>

              {/* Share popup modal */}
              {showSharePopup && (
                <Suspense fallback={null}>
                  <SharePopupPortal
                    url={shareLink}
                    onClose={() => setShowSharePopup(false)}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

CardStyleHover.displayName = "CardStyleHover";
export default CardStyleHover;
