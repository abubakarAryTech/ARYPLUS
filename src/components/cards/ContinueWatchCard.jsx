import { memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "react-bootstrap/ProgressBar";
import logger from '../../services/logger';

import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../services/api";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const ContinueWatchCard = memo(
  ({
    link,
    imagePath,
    watchedTime,
    totalTime,
    title,
    videoEpNumber,
    onRemoveFromHistory,
    id,
  }) => {
    // Ensure numeric values and default to 0 if invalid
    const watchedSeconds = Number(watchedTime) || 0;
    const totalSeconds = Number(totalTime) || 0;

    // Calculate progress percentage, ensuring no division by zero
    const progressPercentage =
      totalTime && watchedTime && totalTime > 0
        ? (Number(watchedTime) / Number(totalTime)) * 100
        : 0;

    // Format time string
    const timeDisplay = `${formatTime(watchedSeconds)} of ${formatTime(totalSeconds)}`;

    const { user, isAuthenticated } = useAuthStore();
    const [isRemoving, setIsRemoving] = useState(false);

    const removeHistory = useCallback(async () => {

      try {
        const response = await api.delete(
          `/api/v2/watch-history/delete/${user?.uid}/${id}`
        );

        if (response.status === 200 || response.status === 201) {
          logger.log("API response received:", response);
          logger.log("Watch history entry removed successfully");
          // toast("Removed from History", { icon: '👉🏻🗑️' });
          setIsRemoving(true);

          onRemoveFromHistory(id);
          // setTimeout(() => {
          //   onRemoveFromHistory(id);  // Remove from parent list
          // }, 300);  // Wait for exit animation
        }
      } catch (error) {
        logger.error(
          "Error removing history :",
          error.response?.data || error.message,
        );

        logger.log(
          "Error removing history :",
          error.response?.data || error.message,
        );
        // toast.error('Failed to remove!');
      }
    }, [isAuthenticated, id, user?.uid, onRemoveFromHistory]);

    return (
      <div className="iq-watching-block continueWatchCard">
        {/* <p>{watchedTime}</p>
        <p>{totalTime}</p> */}
        <div className="block-images position-relative">
          <div className="iq-image-box overly-images">
            <Link to={link} className="d-block">
              <img
                src={imagePath}
                alt="movie-card"
                className="img-fluid object-cover w-100 d-block border-0"
              />
            </Link>
          </div>
          <div className="iq-preogress px-3">
            <span className="data-left-timing font-size-14 fw-500 text-lowercase">
              {timeDisplay}
            </span>
            {progressPercentage > 0 && (
              <ProgressBar now={progressPercentage} style={{ height: "5px" }} />
            )}
          </div>
          <button
            className="remove-button"
            onClick={removeHistory}
            // onClick={(e) => {
            //   e.preventDefault(); // Prevent navigation
            //   onRemove && onRemove(); // Call the passed callback
            // }}
          >
            ×
          </button>
        </div>
        {/* New Section for Title and Episode */}
        <div className="d-flex justify-content-between align-items-center mt-2 px-2 titleandep">
          <h6
            className="mb-0 text-white text-truncate"
            style={{ width: videoEpNumber ? "75%" : "100%" }}
          >
            {title}
          </h6>
          {videoEpNumber ? (
            <p
              className="mb-0 text-muted small text-end"
              style={{ width: "25%" }}
            >
              <span className="d-inline d-sm-none">EP {videoEpNumber}</span>
              <span className="d-none d-sm-inline">
                Episode {videoEpNumber}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);

ContinueWatchCard.displayName = "ContinueWatchCard";
export default ContinueWatchCard;
