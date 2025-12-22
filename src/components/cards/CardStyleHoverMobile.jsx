import { memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "react-bootstrap/ProgressBar";
import logger from '../../services/logger';


import api from "../../services/api";
import { shouldShowLockIcon } from "../../utilities/tvodHelper";
import { useAuthStore } from "../../stores/useAuthStore";

const CardStyleHoverMobile = memo(
  ({
    link,
    image,
    episodeCount,
    duration,
    seriesType,
    watchedTime,
    totalTime,
    title,
    genres,
    cast,
    videoEpNumber,
    onRemoveFromHistory,
    id,
    packageInfo,
  }) => {
    const { user, isAuthenticated } = useAuthStore();
    const showLock = shouldShowLockIcon({ packageIds: packageInfo }, user);
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
      <div className="iq-watching-block continueWatchCard mt-2">
        {/* <p>{watchedTime}</p>
        <p>{totalTime}</p> */}
        <div className="block-images position-relative">
          {/* lock icon  */}
              {showLock && (
                <div className="lock-icon-wrapper position-absolute">
                  <span className="lock-icon fs-5 text-white" style={{lineHeight:'0px'}}>
                    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M4.17505 0.000125443C4.18358 0.000176602 4.19148 0.000223888 4.19867 0.000223888H6.33959C6.35042 -5.60509e-05 6.36127 -5.76403e-05 6.37216 0.000223888H9.62784C9.63873 -5.76403e-05 9.64959 -5.60509e-05 9.66041 0.000223888H11.8013C11.8085 0.000223888 11.8164 0.000176602 11.8249 0.000125443C11.9083 -0.000374037 12.0525 -0.00123799 12.1945 0.0381104C12.3161 0.0717962 12.4339 0.127983 12.5421 0.206443C12.6638 0.294635 12.7598 0.410835 12.8148 0.479491L15.5237 3.18432C15.5432 3.20375 15.5618 3.22436 15.5793 3.24605L15.5898 3.259C15.6427 3.32438 15.7068 3.40358 15.7589 3.47867C15.8193 3.56587 15.9004 3.69821 15.9502 3.87795C16.0166 4.11786 16.0166 4.3744 15.9502 4.61431C15.9004 4.79404 15.8193 4.92639 15.7589 5.01358C15.7081 5.08682 15.6459 5.16397 15.5937 5.22839L9.0665 14.31C9.05746 14.3226 9.04811 14.3348 9.03845 14.3468L9.02508 14.3633C8.95031 14.4558 8.86579 14.5603 8.78526 14.6439C8.69298 14.7397 8.55711 14.8615 8.36809 14.9326C8.12952 15.0225 7.87048 15.0225 7.63191 14.9326C7.44289 14.8615 7.30702 14.7397 7.21474 14.6439C7.13422 14.5603 7.0497 14.4558 6.97494 14.3633L6.96155 14.3468C6.95189 14.3348 6.94254 14.3226 6.9335 14.31L0.406269 5.22838C0.354117 5.16396 0.29187 5.08681 0.241122 5.01358C0.1807 4.92638 0.0996135 4.79404 0.0498336 4.6143C-0.0166112 4.3744 -0.0166113 4.11786 0.0498337 3.87795C0.0996135 3.69821 0.1807 3.56587 0.241122 3.47867C0.293163 3.40357 0.357296 3.32436 0.410234 3.25898C0.413774 3.25461 0.417263 3.2503 0.420696 3.24605C0.438246 3.22436 0.456792 3.20375 0.476255 3.18432L3.18521 0.479491C3.24023 0.410834 3.3362 0.294635 3.45786 0.206443C3.5661 0.127982 3.68391 0.0717956 3.80546 0.0381104C3.94745 -0.00123799 4.09168 -0.000374037 4.17505 0.000125443ZM2.18353 5.07945L6.51425 11.105L4.9882 5.07945H2.18353ZM6.50276 5.07945L8 10.9912L9.49724 5.07945H6.50276ZM9.51043 3.41281H6.48958L6.91005 1.66687H9.08995L9.51043 3.41281ZM11.0118 5.07945L9.48575 11.105L13.8165 5.07945H11.0118ZM13.5386 3.41281H11.0193L10.5989 1.66687H11.7925C11.8042 1.6802 11.8162 1.69308 11.8286 1.70548L13.5386 3.41281ZM5.40114 1.66687L4.98067 3.41281H2.46144L4.17137 1.70548C4.18379 1.69308 4.19584 1.6802 4.20749 1.66687H5.40114Z" fill="black"/>
                    </svg>
                  </span>
                </div>
              )}
          <div className="iq-image-box overly-images">
            <Link to={link} className="d-block">
              <img
                src={image}
                alt="movie-card"
                className="img-fluid object-cover w-100 d-block border-0"
              />
            </Link>
          </div>
        </div>
        {/* New Section for Title and Episode */}
        <div className="descriptionMobile  px-1 ">
          <div className="d-flex justify-content-between align-items-center mt-2 titleandep ">
            <h6
              className="mb-0 text-white text-truncate text-capitalize"
              style={{ flex: "1 1 auto", minWidth: 0 }}
            >
              {title
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </h6>

            {seriesType !== "live" && seriesType !== "live-event" ? (
              <>
                {!(
                  episodeCount &&
                  episodeCount > 0 &&
                  seriesType !== "singleVideo"
                ) ? null : (
                  <p
                    className="mb-0 text-muted small text-end ms-2 flex-shrink-0"
                    style={{
                      maxWidth: "60px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <span className="d-inline d-sm-none">
                      {episodeCount} Episodes
                    </span>
                  </p>
                )}

                {duration &&
                  duration !== "00:00:00" &&
                  seriesType == "singleVideo" && (
                    <p
                      className="mb-0 text-muted small text-end ms-2 flex-shrink-0"
                      style={{
                        maxWidth: "60px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span className="d-inline d-sm-none">{duration}</span>
                    </p>
                  )}
              </>
            ) : (
              <p
                className="mb-0 text-muted small text-end ms-2 flex-shrink-0"
                style={{
                  maxWidth: "60px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span className="d-inline d-sm-none">Live</span>
              </p>
            )}

            {/* {seriesType} */}
          </div>
          {cast ? (
            <p className="movie-time-text font-normal genre line-clamp-1">
              {`${cast?.slice(0, 2).join(" | ")}`}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);

CardStyleHoverMobile.displayName = "CardStyleHoverMobile";
export default CardStyleHoverMobile;
