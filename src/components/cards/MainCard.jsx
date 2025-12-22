import { memo, useState, useCallback, Fragment, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import './MainCard.css';
import SharePopupPortal from "../SharePopupPortal";

const VideoPlayer = lazy(() => import("../VideoPlayer"));

const MainCard = memo(({
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
  packageData,
  location,
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef();
  
  // Share popup state
  const [showSharePopup, setShowSharePopup] = useState(false);
  
  const { isFavorite: checkFavorite, toggle } = useWatchlist();
  const isFavorite = checkFavorite(id);
  
  const showLock = shouldShowLockIcon({ packageIds: packageInfo }, user);
  const externalVideo = isExternalVideo(trailer);

  const getPricingByCurrency = () => {
    logger.log('PackageData:', packageData);
    logger.log('Location:', location);
    
    if (!packageData || !packageData.packagePricing) {
      logger.log('No packageData or packagePricing');
      return { currency: "PKR", price: "N/A" };
    }
    
    const targetCurrency = location === "PK" ? "PKR" : "USD";
    logger.log('Target Currency:', targetCurrency);
    logger.log('Package Pricing:', packageData.packagePricing);
    
    const pricing = packageData.packagePricing.find(
      (p) => p.currency === targetCurrency
    );
    
    logger.log('Found Pricing:', pricing);
    return pricing || { currency: "PKR", price: "N/A" };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  
  // Stop video preview when share popup opens
  useEffect(() => {
    if (showSharePopup) setShowVideo(false);
  }, [showSharePopup]);

  const toggleMute = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  }, []);

  const toggleFavorite = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle(id);
  }, [id, toggle]);

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

  const handlePlayClick = useCallback((e) => {
    if (seriesType === "show" || seriesType === "programs") {
      e.preventDefault();
      playFirstEpisode();
      return;
    }

    if (seriesType === "singleVideo" && isTvodEnabled() && packageInfo?.length > 0) {
      e.preventDefault();
      
      const hasSubscription = 
        user?.subscriptions?.[packageInfo]?.subscription_status === "active";
      
      if (!hasSubscription) {
        navigate(`/Tvod/${id}`);
      } else {
        navigate(getPlayLink(seriesType, id));
      }
    }
  }, [seriesType, packageInfo, user, id, navigate, playFirstEpisode]);

  const detailLink = getDetailLink(seriesType, id);
  const playLink = getPlayLink(seriesType, id);
  const shareLink = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/sharer/series/${id}`;

  return (
    <div
      className="main-card"
      onMouseEnter={() => isInView && setShowVideo(true)}
      onMouseLeave={() => setShowVideo(false)}
      ref={cardRef}
    >
      <Link to={detailLink} className="main-card__link">
        {/* Lock icon overlay for paid content */}
        {showLock && seriesType !== "live" && seriesType !== "live-event" && (
          <div className="main-card__lock-overlay">
            <img
              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/crown-lock.png`}
              alt="Exclusive Content"
            />
          </div>
        )}

        <div className="main-card__image">
          <img
            src={image}
            loading="lazy"
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${import.meta.env.VITE_APP_IMAGE_PATH}images/card-place-holderv2.jpg`;
            }}
          />
          
          {showVideo && trailer && !externalVideo && (
            <Suspense fallback={null}>
              <VideoPlayer
                videoUrl={trailer}
                isMuted={isMuted}
                autoPlay={true}
                loop={true}
                playsInline={true}
                showControls={false}
                className="main-card__video"
              />
            </Suspense>
          )}

          <div className="main-card__gradient"></div>
        </div>

        {/* Top-right (Mute) */}
        <div className="main-card__actions main-card__actions--top">
          <button
            className="main-card__action-btn"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
          >
             {isMuted ? (
              // <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              //   <path d="M9.617 7.5L12.617 10.5M9.617 10.5L12.617 7.5M6.617 11.11V6.89C6.617 4.531 6.617 3.351 5.923 3.058C5.229 2.764 4.412 3.598 2.779 5.266C1.933 6.13 1.45 6.322 0.247 6.322C-0.806 6.322 -1.332 6.322 -1.71 6.579C-2.495 7.115 -2.376 8.162 -2.376 9C-2.376 9.839 -2.495 10.885 -1.71 11.421C-1.332 11.678 -0.806 11.678 0.247 11.678C1.45 11.678 1.933 11.87 2.779 12.734C4.412 14.402 5.229 15.236 5.923 14.942C6.617 14.648 6.617 13.469 6.617 11.11Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              // </svg>
              <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/mute.png`}
                alt={"Mute"}              
              />
            ) : (
              // <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              //   <path d="M6.617 11.11V6.89C6.617 4.531 6.617 3.351 5.923 3.058C5.229 2.764 4.412 3.598 2.779 5.266C1.933 6.13 1.45 6.322 0.247 6.322C-0.806 6.322 -1.332 6.322 -1.71 6.579C-2.495 7.115 -2.376 8.162 -2.376 9C-2.376 9.839 -2.495 10.885 -1.71 11.421C-1.332 11.678 -0.806 11.678 0.247 11.678C1.45 11.678 1.933 11.87 2.779 12.734C4.412 14.402 5.229 15.236 5.923 14.942C6.617 14.648 6.617 13.469 6.617 11.11Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              // </svg>
              <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/unmute.png`}
                alt={"Unmute"}              
              />
            )}
          </button>
        </div>

        {/* Bottom-right (Favorite + Share + Info) */}
        <div className="main-card__actions main-card__actions--bottom">
          <button
            className="main-card__action-btn"
            onClick={toggleFavorite}
            title="Add to List"
          >
           {/* <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3V15M15 9H3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> */}
            {/* <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/add.png`}
                alt={"add to list"}              
              /> */}
              <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/${
                  isFavorite ? "added" : "add"
                }.png`}
                alt="add to list"
              />
          </button>
          <Link
            className="main-card__action-btn"
            onClick={() => setShowSharePopup(true)}
            title="Share"
          >
           {/* <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3V15M15 9H3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> */}
            <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/share.png`}
                alt={"Share"}              
              />
          </Link>

          <button
            className="main-card__action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(detailLink);
            }}
            title="More Info"
          >
            {/* <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 12.25V6.25M9 5.75V5.75M15 9C15 12.866 11.866 16 8 16C4.13401 16 1 12.866 1 9C1 5.13401 4.13401 2 8 2C11.866 2 15 5.13401 15 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> */}
            <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/info.png`}
                alt={"info"}              
              />
          </button>

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


        <div className="main-card__info">
          <h3 className="main-card__title">{title?.length > 20 ? title.slice(0, 20) + '...' : title}</h3>
          <div className="main-card__meta">{getDurationText(seriesType, episodeCount, duration)}</div>
          <div className="main-card__genre">
            {genres?.slice(0, 2).map((genre, index) => (
              <span key={index}>
                {genre}
                {index < genres.slice(0, 2).length - 1 && <span className="main-card__genre-separator"> | </span>}
              </span>
            ))}
          </div>
          {showLock && seriesType !== "live" && seriesType !== "live-event" ? (
            packageData ? (
              <Link to={getTvodUrl(id)} className="main-card__rent-section">
                <div className="main-card__rent-info">
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/unlock-to-play.png`}
                    alt="Unlock"
                    className="main-card__unlock-icon"
                  />
                  <div className="main-card__rent-text">
                    <div className="main-card__price">{getPricingByCurrency().currency} {getPricingByCurrency().price}</div>
                    <div className="main-card__rent-label">Rent Now</div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="main-card__play-icon">
                <img
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/unlock-to-play.png`}
                  alt="Lock"
                />
              </div>
            )
          ) : (
            <div className="main-card__play-icon">
              <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/play.png`}
                alt="Play"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

MainCard.displayName = "MainCard";
export default MainCard;
