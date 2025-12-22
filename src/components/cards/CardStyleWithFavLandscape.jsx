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

const CardStyleWithFavLandscape = memo(
  ({
    title,
    movieTime,
    watchlistLink,
    link,
    image,
    hoverImage,
    hoverVideo,
    seriesType,
    id,
    isFavorite: initialFavoriteState,
    name,
    genreIds,
    description,
    releaseDate,
  }) => {
    const config = getConfig();
    const { user, isAuthenticated } = useAuthStore();
    const [isFavorite, setIsFavorite] = useState(initialFavoriteState);
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const loginRequired = () => toast("Login Required!", { icon: "👤" });

    const shareLink = config.sharingURI + id;

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
        setIsFavorite((prev) => !prev); // optimistic update
        const response = await api.post(
          `/api/fav/cda`,
          payload,
        );
        if (response.status === 200 || response.status === 201) {
          if (response.data.message.includes("added")) {
            // toast('Added to favorites!', { icon: '❤️' });
          } else if (response.data.message.includes("removed")) {
            // toast('Removed from favorites!', { icon: '💔' });
          }
        }
      } catch (error) {
        logger.error(
          "Error toggling favorite:",
          error.response?.data || error.message,
        );
        // toast.error('Failed to toggle favorite!');
        setIsFavorite((prev) => !prev); // revert
      }
    }, [isAuthenticated, id, user?.uid]);

    return (
      <div className="LandscapeCard">
        <div className="iq-card card-hover position-relative">
          <div
            className="block-images position-relative w-100 card-hover-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="favorite-icon-wrapper position-absolute top-0 end-0 p-2">
              <span
                className="favorite-icon text-white fs-5"
                onClick={toggleFavorite}
                style={{ cursor: "pointer" }}
              >
                {isFavorite ? (
                  <i className="fa-solid fa-bookmark text-white "></i>
                ) : null}
              </span>
            </div>
            <div className="img-box w-100">
              <Link
                to={link}
                className="position-absolute top-0 bottom-0 start-0 end-0"
              ></Link>

              {isHovered ? (
                hoverVideo ? (
                  <video
                    src={hoverVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="img-fluid object-cover w-100 d-block border-0"
                  />
                ) : hoverImage ? (
                  <img
                    src={hoverImage}
                    alt={title}
                    className="img-fluid object-cover w-100 d-block border-0"
                  />
                ) : (
                  <img
                    src={image}
                    alt={title}
                    className="img-fluid object-cover w-100 d-block border-0"
                  />
                )
              ) : (
                <img
                  src={image}
                  alt={title}
                  className="img-fluid object-cover w-100 d-block border-0"
                />
              )}
            </div>

            {/* Remaining unchanged content */}
            <div className="card-description with-transition">
              <div className="cart-content">
                <div className="">
                  <h5 className="iq-title">
                    <Link to={link}>{title}</Link>
                  </h5>

                  <div className="movie-time d-flex align-items-center">
                    <span className="text-primary">
                      <i
                        className="fa-regular fa-calendar text-sm"
                        style={{
                          fontSize: "15px",
                        }}
                      ></i>
                    </span>

                    <span className="movie-time-text font-normal ms-2 me-3">
                      Release Date :{" "}
                      {new Date(releaseDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="movie-time d-flex align-items-center">
                    <span className="text-primary">&#8226;</span>
                    <span className="movie-time-text font-normal ms-2 me-2">
                      Drama
                    </span>
                    <span className="text-primary">&#8226;</span>
                    <span className="movie-time-text font-normal ms-2">
                      Romance
                    </span>
                  </div>

                  {/* Vertical bar next to description */}
                  <div
                    className="movie-time d-flex align-items-stretch mt-1"
                    style={{ minHeight: "1px" }}
                  >
                    <div
                      style={{
                        width: "4px",
                        backgroundColor: "var(--bs-primary)",
                        borderRadius: "2px",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div className="ms-2 movie-time-text font-normal line-clamp-1">
                      {description}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center px-2">
                {/* Icons container */}
                <div className="d-flex align-items-center gap-3 mt-3">
                  {/* Play Button */}
                  <div
                    className="d-flex align-items-center text-white"
                    style={{ gap: "8px" }}
                  >
                    <Link
                      to={link}
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        color: "#000",
                        textDecoration: "none",
                        fontSize: "12px",
                      }}
                      title="Play"
                    >
                      <i className="fa-solid fa-play"></i>
                    </Link>
                    <span style={{ fontSize: "12px" }}>Play</span>
                  </div>

                  {/* Add to List */}
                  <div
                    className="d-flex align-items-center text-white"
                    style={{ gap: "8px" }}
                  >
                    <button
                      onClick={toggleFavorite}
                      className="btn p-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        border: "none",
                        fontSize: "12px",
                      }}
                      title="Add to List"
                    >
                      {isFavorite ? (
                        <i className="fa-solid fa-bookmark text-white"></i>
                      ) : (
                        <i className="fa-regular fa-bookmark"></i>
                      )}
                    </button>
                    <span style={{ fontSize: "12px" }}>My WatchList</span>
                  </div>

                  {/* Share Button */}
                  <div
                    className="d-flex align-items-center text-white"
                    style={{ gap: "8px" }}
                  >
                    <button
                      onClick={() => copyLinkToClipboard(shareLink)}
                      className="btn p-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        border: "none",
                        fontSize: "12px",
                      }}
                      title="Share"
                    >
                      <i className="fa-solid fa-share-nodes"></i>
                    </button>
                    <span style={{ fontSize: "12px" }}>Share</span>
                  </div>
                </div>

                {/* Play Button */}
                {/* <Link
    to={link}
    className="d-flex align-items-center justify-content-center"
    style={{
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      backgroundColor: '#fff',
      color: '#000',
      textDecoration: 'none'
    }}
    title="Play"
  >
    <i className="fa-solid fa-play"></i>
  </Link> */}
              </div>

              {/* <div className="block-social-info align-items-center" style={{ zIndex: 3 }}>
              <ul className="p-0 m-0 d-flex gap-2 music-play-lists">
                {(seriesType === "show" || seriesType === "programs") && (
                  <li className="share position-relative d-flex align-items-center text-center mb-0 rounded-border">
                    <span className="w-100 h-100 d-inline-block bg-transparent" onClick={toggleFavorite}>
                      {isFavorite ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
                    </span>
                  </li>
                )}
                <li className="age-rating position-relative d-flex align-items-center text-center mb-0">
                  <span className="badge bg-dark text-white px-1 py-0 rounded">16+</span>
                </li>
              </ul>

              <div className="iq-button my-2">
                <Link to={link} className="btn text-uppercase position-relative rounded-circle">
                  <i className="fa-solid fa-play ms-0"></i>
                </Link>
              </div>
            </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CardStyleWithFavLandscape.displayName = "CardStyleWithFav";
export default CardStyleWithFavLandscape;
