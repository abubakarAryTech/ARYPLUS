import { memo, useCallback, useState, useEffect, useRef, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProgressBar from "react-bootstrap/ProgressBar";
import axios from "axios";
import { useAuthStore } from "../../stores/useAuthStore";
import SharePopupPortal from "../SharePopupPortal";
import { getConfig } from "../../../config";
import api from "../../services/api";
import logger from '../../services/logger';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const ContinueWatchCardNew = memo(
  ({
    link,
    imagePath,
    watchedTime,
    totalTime,
    title,
    videoEpNumber,
    onRemoveFromHistory,
    isFavorite: initialFavoriteState,
    id,
    seriesLink,
    seriesType,
    genres,
  }) => {
    const watchedSeconds = Number(watchedTime) || 0;
    const totalSeconds = Number(totalTime) || 0;
    const progressPercentage =
      totalTime && watchedTime && totalTime > 0
        ? (Number(watchedTime) / Number(totalTime)) * 100
        : 0;
    const timeDisplay = `${formatTime(watchedSeconds)} of ${formatTime(totalSeconds)}`;
    const config = getConfig();

    const { user, isAuthenticated } = useAuthStore();
    const [isRemoving, setIsRemoving] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const cardRef = useRef();
    const [isFavorite, setIsFavorite] = useState(initialFavoriteState);
    const [isHovered, setIsHovered] = useState(false);

    const navigate = useNavigate();
    const [showSharePopup, setShowSharePopup] = useState(false);
    const shareLink = config.sharingURI + id;

    const openLink = useCallback(
      (url) => () => {
        if (url) navigate(url);
      },
      [navigate],
    );

    const toggleFavorite = useCallback(async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      const payload = { userId: user?.uid, seriesId: id };
      try {
        setIsFavorite((prev) => !prev);
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/fav/cda`,
          payload,
        );
        const message = response.data.message;
        if (
          response.status === 200 ||
          response.status === 201 ||
          message.includes("successfully")
        ) {
          // toast success here if desired
        }
      } catch (error) {
        logger.error("Error toggling favorite:", error);
        // toast.error("Failed to toggle favorite!");
        setIsFavorite((prev) => !prev); // revert
      }
    }, [isAuthenticated, id, navigate]);

    const removeHistory = useCallback(async () => {
      try {
        const response = await api.delete(
          `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/watch-history/delete/${user?.uid}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
            },
          },
        );
        if (response.status === 200 || response.status === 201) {
          logger.log("Watch history entry removed successfully");
          setIsRemoving(true);
          onRemoveFromHistory(id);
        }
      } catch (error) {
        logger.error(
          "Error removing history:",
          error.response?.data || error.message,
        );
      }
    }, [isAuthenticated, id, user?.uid, onRemoveFromHistory]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIsInView(entry.isIntersecting),
        { threshold: 0.3 },
      );
      if (cardRef.current) observer.observe(cardRef.current);
      return () => observer.disconnect();
    }, []);

    return (
      <div className="hover-custom-card" ref={cardRef}>
        <div className="iq-card card-hover">
          <div className="block-images position-relative w-100">
            <div className="favorite-icon-wrapper position-absolute top-0 end-0 p-2">
              <span
                className="favorite-icon fs-5"
                onClick={removeHistory}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/remove.svg`}
                  alt="Remove"
                  className="icons-size"
                />
              </span>
            </div>

            {/* Image Box */}
            <div
              className="img-box w-100 position-relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Link
                to={user ? link : `/login?redirect=${link}`}
                className="w-100 h-100 position-relative d-block"
              >
                <img
                  src={imagePath}
                  loading="lazy"
                  alt={title}
                  className="img-fluid object-cover w-100 d-block border-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/images/card-place-holder.jpg";
                  }}
                />
                <div
                  className="position-absolute bottom-0 start-0 w-100"
                  style={{
                    height: "80px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
                    pointerEvents: "none",
                  }}
                ></div>
                {progressPercentage > 0 && (
                  <div
                    className="position-absolute bottom-0 start-0 w-100 p-3"
                    style={{ transform: "translateY(-5px)" }}
                  >
                    <ProgressBar
                      now={progressPercentage}
                      style={{ height: "5px", borderRadius: 0 }}
                    />
                  </div>
                )}
              </Link>
            </div>

            {/* New Section for Title and Episode */}
            <div
              className={`d-flex justify-content-between align-items-center mt-2 px-2 titleandep ${isHovered ? "d-none" : ""}`}
            >
              <h6
                className="mb-0 text-white text-truncate"
                style={{ width: videoEpNumber ? "70%" : "100%" }}
              >
                {title}
              </h6>
              {videoEpNumber ? (
                <p
                  className="mb-0 text-muted small text-end"
                  style={{ width: "30%" }}
                >
                  <span className="d-inline d-sm-none">EP {videoEpNumber}</span>
                  <span className="d-none d-sm-inline">
                    Episode {videoEpNumber}
                  </span>
                </p>
              ) : null}
            </div>

            {/* Content */}
            <div
              className="card-description with-transition"
              style={{ bottom: "-96px" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="cart-content">
                <div className="w-100">
                  <div className="d-flex justify-content-between align-items-start mt-2">
                    <h5 className="iq-title heading text-capitalize mb-0">
                      <Link
                        className="line-clamp-1"
                        to={user ? link : `/login?redirect=${link}`}
                      >
                        Resume {title}
                      </Link>
                    </h5>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    {videoEpNumber ? (
                      <p
                        className="movie-time-text font-normal mb-0 text-truncate me-2 text-start"
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        Episode {videoEpNumber}
                      </p>
                    ) : (
                      <p
                        className="movie-time-text font-normal mb-0 text-truncate me-2 text-start"
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {genres?.slice(0, 1)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="block-social-info align-items-center">
              <div className="iq-button">
                <Link
                  to={user ? link : `/login?redirect=${link}`}
                  title="Play Now"
                  className="btn text-uppercase position-relative rounded-circle play-btn-custom"
                >
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/play.svg`}
                    alt="Play"
                    className="icons-size"
                  />
                </Link>
              </div>
              <ul className="p-0 m-0 d-flex gap-2 music-play-lists">
                {(seriesType === "show" ||
                  seriesType === "programs" ||
                  seriesType === "singleVideo") && (
                  <li
                    onClick={toggleFavorite}
                    title="Add to List"
                    className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center"
                  >
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/${isFavorite ? "add-to-list-done" : "add-to-list"}.svg`}
                      alt="Favorite"
                      className="icons-size"
                    />
                  </li>
                )}
                <li
                  onClick={setShowSharePopup.bind(null, true)}
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
                <li
                  onClick={openLink(seriesLink)}
                  title="Watch Episodes"
                  className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center"
                >
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/info.svg`}
                    alt="Info"
                    className="icons-size"
                  />
                </li>
                <li
                  onClick={removeHistory}
                  className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center"
                  title="Remove from History"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/remove.svg`}
                    alt="Remove"
                    className="icons-size"
                  />
                </li>
              </ul>
              {showSharePopup && (
                <Suspense fallback={null}>
                  <SharePopupPortal
                    url={import.meta.env.VITE_APP_API_HOME_ENDPOINT + "/sharer/series/" + id}
                    onClose={() => setShowSharePopup(false)}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ContinueWatchCardNew.displayName = "ContinueWatchCardNew";
export default ContinueWatchCardNew;