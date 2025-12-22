import { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import { useAuthStore } from "../../stores/useAuthStore";
import logger from '../../services/logger';

import { getConfig } from "../../../config";
import { ShareLink } from "react-facebook-share-link";

import { motion, AnimatePresence } from "framer-motion";

const CardStyleForCW = memo(
  ({
    title,
    movieTime,
    watchlistLink,
    link,
    image,
    seriesType,
    id,
    isFavorite: initialFavoriteState,
    name,
    onRemoveFromHistory,
  }) => {
    const config = getConfig();
    const { user, isAuthenticated } = useAuthStore();
    const [isFavorite, setIsFavorite] = useState(initialFavoriteState);
    const [copied, setCopied] = useState(false);
    const loginRequired = () => toast("Login Required!", { icon: "👤" });
    const baseLink = window.location.origin;
    const shareLink = config.sharingURI + id;
    const [isRemoving, setIsRemoving] = useState(false);

    const copyLinkToClipboard = (link) => {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Copied!");
    };

    const toggleFavorite = useCallback(async () => {
      if (!isAuthenticated) {
        toast("Login Required!", { icon: "👤" });
        return;
      }

      const payload = { userId: user?.uid, seriesId: id };

      try {
        setIsFavorite((prev) => !prev); // Optimistically toggle favorite
        const response = await api.post(
          "/api/fav/cda",
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
    }, [isAuthenticated, id, user?.uid]);

    const removeHistory = useCallback(async () => {
      if (!isAuthenticated) {
        toast("Login Required!", { icon: "👤" });
        return;
      }

      try {
        const response = await api.delete(
          `/api/v2/watch-history/delete/${user?.uid}/${id}`
        );

        if (response.status === 200 || response.status === 201) {
          toast("Removed from History", { icon: "👉🏻🗑️" });
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
        toast.error("Failed to remove!");
      }
    }, [isAuthenticated, id, user?.uid, onRemoveFromHistory]);

    return (
      <AnimatePresence>
        {!isRemoving && (
          <motion.div className="iq-card card-hover">
            <div className="block-images position-relative w-100">
              <div className="favorite-icon-wrapper position-absolute top-0 end-0 p-2">
                {(seriesType === "show" ||
                  seriesType === "programs" ||
                  seriesType === "singleVideo") && (
                  <span
                    className="favorite-icon text-white fs-5"
                    onClick={toggleFavorite}
                    style={{ cursor: "pointer" }}
                  >
                    {isFavorite ? (
                      <i className="fa-solid fa-bookmark text-white "></i>
                    ) : null}
                  </span>
                )}
              </div>
              <div className="img-box w-100">
                <Link
                  to={link}
                  className="position-absolute top-0 bottom-0 start-0 end-0"
                ></Link>
                <img
                  src={image}
                  alt={title}
                  className="img-fluid object-cover w-100 d-block border-0"
                />
              </div>
              <div className="block-social-info align-items-center">
                <ul className="p-0 m-0 d-flex gap-2 music-play-lists">
                  <li className="share position-relative d-flex align-items-center text-center mb-0">
                    <span className="w-100 h-100 d-inline-block bg-transparent">
                      <i className="fas fa-share-alt"></i>
                    </span>

                    <div className="share-wrapper">
                      <div className="share-boxs d-inline-block">
                        <svg
                          width="15"
                          height="40"
                          className="share-shape"
                          viewBox="0 0 15 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.8842 40C6.82983 37.2868 1 29.3582 1 20C1 10.6418 6.82983 2.71323 14.8842 0H0V40H14.8842Z"
                            fill="#191919"
                          ></path>
                        </svg>
                        <div className="overflow-hidden">
                          {shareLink ? (
                            <>
                              <FacebookShareButton url={shareLink}>
                                <FacebookIcon size={22} round={true} />
                              </FacebookShareButton>
                              <TwitterShareButton url={shareLink}>
                                <TwitterIcon size={22} round={true} />
                              </TwitterShareButton>
                              <WhatsappShareButton url={shareLink}>
                                <WhatsappIcon size={22} round={true} />
                              </WhatsappShareButton>
                              <Link
                                onClick={() => copyLinkToClipboard(shareLink)}
                              >
                                <i className="fas fa-link"></i>
                              </Link>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                  {(seriesType === "show" ||
                    seriesType === "programs" ||
                    seriesType === "singleVideo") && (
                    <>
                      <li className="share position-relative d-flex align-items-center text-center fav-icon mb-0">
                        <span
                          className="w-100 h-100 d-inline-block bg-transparent"
                          onClick={toggleFavorite}
                        >
                          {isFavorite ? (
                            <i className="fa-solid fa-bookmark text-white"></i>
                          ) : (
                            <i className="fa-regular fa-bookmark"></i>
                          )}
                        </span>
                      </li>
                      <li className="share position-relative d-flex align-items-center text-center mb-0 remove-icon">
                        <span
                          className="w-100 h-100 d-inline-block bg-transparent"
                          onClick={removeHistory}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </span>
                      </li>
                    </>
                  )}
                </ul>
                <div className="iq-button">
                  <Link
                    to={link}
                    className="btn text-uppercase position-relative rounded-circle"
                  >
                    <i className="fa-solid fa-play ms-0"></i>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

CardStyleForCW.displayName = "CardStyleForCW";
export default CardStyleForCW;
