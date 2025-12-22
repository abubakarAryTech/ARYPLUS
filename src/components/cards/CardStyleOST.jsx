import { memo, useState, useCallback, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import SharePopup from "../SharePopup";
import { useAuthStore } from "../../stores/useAuthStore";
import logger from '../../services/logger';

import { getConfig } from "../../../config";

const CardStyleOST = memo(
  ({
    title,
    link,
    image,
    seriesType,
    id,
    isFavorite: initialFavoriteState,
    cast,
    duration,
  }) => {
    const truncate = (str, maxLength) =>
      str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str;

    const truncatedTitle = truncate(title, 30);

    const config = getConfig();
    const { user, isAuthenticated } = useAuthStore();
    const [isFavorite, setIsFavorite] = useState(initialFavoriteState);
    const [copied, setCopied] = useState(false);
    const loginRequired = () => toast("Login Required!", { icon: "👤" });
    const baseLink = window.location.origin;
    const shareLink = config.sharingURI + id;

    const navigate = useNavigate();
    const [showSharePopup, setShowSharePopup] = useState(false);

    const copyLinkToClipboard = (link) => {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Copied!");
    };

    const openLink = useCallback((url) => {
      return () => {
        if (url) {
          navigate(url);
        }
      };
    }, []);

    const playNow = async (seriesId) => {
      if (!seriesId) {
        logger.warn("Navigation error: series ID parameter missing from route");
        return;
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/cdn/${seriesId}`,
        );
        const data = await response.json();

        if (data?.episode?.length > 0) {
          const firstEpisode = data.episode[0]; // Get the first episode
          const ep1Id = firstEpisode._id;
          navigate(`/video/v1/3/${ep1Id}/${seriesId}`);
        } else {
          logger.error("Content error: no episodes available for this series");
        }
      } catch (error) {
        logger.error("Failed to fetch episodes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const toggleFavorite = useCallback(async () => {
      if (!isAuthenticated) {
        navigate("/login"); // 👈 Redirect to login
        // toast("Login Required!", { icon: "👤" });
        return;
      }
      const payload = { userId: user?.uid, seriesId: id };

      try {
        setIsFavorite((prev) => !prev); // Optimistically toggle favorite
        const response = await api.post(
          `/api/fav/cda`,
          payload,
        );
        if (response.status === 200 || response.status === 201) {
          if (response.data.message === "Favorite added successfully") {
            // toast('Added to favorites!', { icon: '❤️' });
          } else if (
            response.data.message === "Favorite removed successfully"
          ) {
            // toast('Removed from favorites!', { icon: '💔' });
          }
        }
      } catch (error) {
        logger.error(
          "Error toggling favorite:",
          error.response?.data || error.message,
        );
        toast.error("Failed to toggle favorite!");
        setIsFavorite((prev) => !prev); // Revert optimistic update if failed
      }
    }, [isAuthenticated, id, user?.uid, navigate]);

    return (
      <Fragment>
        <div className="card-style-ost">
          <div className="iq-card card-hover">
            <div className="block-images position-relative w-100">
              <div className="favorite-icon-wrapper position-absolute top-0 end-0 p-2">
                {/* top badge for my list indicate  */}
                {(seriesType === "show" ||
                  seriesType === "programs" ||
                  seriesType === "singleVideo") && (
                  <span
                    className="favorite-icon fs-5"
                    onClick={toggleFavorite}
                    style={{ cursor: "pointer" }}
                  >
                    {isFavorite ? (
                      <i className="fa-solid fa-bookmark"></i>
                    ) : null}
                  </span>
                )}
              </div>
              {/* image box  */}
              <div className="img-box w-100">
                <Link
                  to={user ? link : `/login?redirect=${link}`}
                  // navigate(user ?`/video/v1/3/${ep1Id}/${seriesId}`: `/login`);
                  className="position-absolute top-0 bottom-0 start-0 end-0"
                ></Link>
                <img
                  src={image}
                  alt="movie-card"
                  className="img-fluid object-cover w-100 d-block border-0"
                />
              </div>
              <>
                {/* description box  */}
                <div className="card-description with-transition">
                  <div className="cart-content d-flex align-items-center">
                    <div className="content-left">
                      <h5 className="iq-title heading text-capitalize">
                        <Link
                          className="line-clamp-1"
                          to={user ? link : `/login?redirect=${link}`}
                        >
                          {title}
                        </Link>
                      </h5>
                      <div className="movie-time d-flex align-items-center mt-1">
                        <p className="movie-time-text font-normal genre">
                          {`${cast?.slice(0, 2).join(" | ")}`}
                        </p>
                      </div>

                      {/* <div className="movie-time d-flex align-items-center mt-2">
                        
                          <p>{duration}</p>
                        </div> */}
                    </div>
                    <div className="content-right">
                      <div className="movie-time d-flex align-items-center">
                        <p>{duration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </Fragment>
    );
  },
);

CardStyleOST.displayName = "CardStyleOST";
export default CardStyleOST;
