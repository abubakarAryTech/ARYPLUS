import React, {
  memo,
  Fragment,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import logger from '../../services/logger';

// react-bootstrap
import { Button, Col, Row } from "react-bootstrap";

// react-router
import { Link, useNavigate } from "react-router-dom";

// react fs-lightbox
import FsLightbox from "fslightbox-react";

// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// img
const img1 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/video/banner-1.webp`;
const img2 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/video/banner-2.webp`;
const img3 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/video/banner-3.webp`;

// Legacy Firebase imports removed

import axios from "axios";
import { toast } from "react-hot-toast";
import VideoPlayer from "../VideoPlayer";
import SharePopupPortal from "../SharePopupPortal";
import Rating from "react-rating-stars-component";
import { FaHeart } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../services/api";
import { calculateDaysLeft } from "../../utilities/calculateDaysLeft";
import { useWatchlist } from "../../hooks/useWatchlist";
import { shouldShowLockIcon, getTvodUrl, isTvodEnabled } from "../../utilities/tvodHelper";
import { useAuthStore } from "../../stores/useAuthStore";


const VideoHeroSliderNew = memo((props) => {
  // Authentication now handled by useAuthStore
  const [toggler, setToggler] = useState(false);
  const { isFavorite: checkFavorite, toggle: toggleFav } = useWatchlist();
  const isFavorite = checkFavorite(props.seriesId);
  // alert(isFavorite);
  const [promoLoaded, setPromoLoaded] = useState(false);
  const [LoadVideoPlayer, SetVideoPlayer] = useState(false);

  const [showRating, setShowRating] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [userRating, setUserRating] = useState(null); // To store the current user's rating
  const [ratingLoading, setRatingLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(true);
  const timerRef = useRef(null);

  
  const tvodEnabled = isTvodEnabled();

  const navigate = useNavigate();

  // User data now from useAuthStore
  
  const { user: currentUser, isAuthenticated: Authenticated } = useAuthStore();
logger.log("CurrentUSER:   ",currentUser);
  const title = props.title;
  const coverimage = props.image;
  // alert(coverimage);
  const description = props.description;
  const episodeCount = props.episodeCount;
  const ost = props.ost;
  const promo = props.promo;
  const genreId = props.genre;
  const allGenre = props.allGenre;
  const logo = props.logo;
  const location = props.location;

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // alert(promo);
  const genreTitles = allGenre.map((genre) => genre.title).join(", ");
  //  alert(genreTitles);
  const duration = props.duration;
  const cast = props.cast.map((name) => name.trim()).join(", ");
  // const id = props.id;
  const episode1 = props.firstEpisode;
  const series = props.series;
  const seriesid = props.seriesId;
  const platform_type = props.type || 2;
  const specificImagePart = "BG-BLACK";
  const seriesType = props.seriesType;
  const packageIds = props.packageIds;
  const packageData = props.packageData;
  const showLock = shouldShowLockIcon({ packageIds: packageIds }, currentUser);
  const releaseDate = props.releaseDate;
  const [isLoading, setIsLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);

  const cleanImageUrl = (url) => {
    return url.replace(/(desktop\/)+/, "desktop/");
  };

  const getPlayLink = () => {
    return seriesType === "singleVideo" 
      ? `/watch/v1/${seriesid}` 
      : `/video/v1/3/${episode1}/${seriesid}`;
  };

  const getPricingByCurrency = () => {
    if (!packageData || !packageData[0]?.packagePricing) {
      return { currency: "PKR", price: "N/A" };
    }

    const targetCurrency = location === "PK" ? "PKR" : "USD";
    const pricing = packageData[0].packagePricing.find(
      (p) => p.currency === targetCurrency
    );

    return pricing || { currency: "PKR", price: "N/A" };
  };

  // Set locationLoading to false once location is available
  useEffect(() => {
    logger.log("Location in Hero Slider: ", location);
    if (location) {
      logger.log("Location: ", location);
      setLocationLoading(false);
    }
  }, [location]);

  const [showSharePopup, setShowSharePopup] = useState(false);

  const toggleSharePopup = () => {
    setShowSharePopup(!showSharePopup);
  };

  const shareUrl = `${window.location.origin}/series/v3/${seriesid}`;

  const cleanedCoverImage = coverimage ? cleanImageUrl(coverimage) : "";

  // const imageSrc =
  //   coverimage &&
  //     (coverimage.includes(specificImagePart) ||
  //       coverimage.includes("undefined") ||
  //       coverimage.includes("null"))
  //     ? genreId === "669a467156ded50194cf0df0"
  //       ? "/assets/images/banners/news-banner.webp"
  //       : genreId === "65e6ea981a094a45057a1137"
  //         ? "/assets/images/banners/qtv-banner.webp"
  //         : "/assets/images/banners/digital-banner.webp"
  //     : `/assets/images/series-placeholder-image.webp`;



  useEffect(() => {
    setShowVideo(false);
    setShowText(true);
    setIsVisible(true);
    timerRef.current = setTimeout(() => {
      setShowVideo(true);
      setShowText(false);
      setTimeout(() => setIsVisible(false), 500); // Match animation duration
    }, 3000);
    return () => clearTimeout(timerRef.current);
  }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {

  //     setShowVideo(true);
  //     setShowText(true);
  //     setIsVisible(true);

  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, []);

  const toggleFavorite = async () => {
    await toggleFav(props.seriesId);
  };

  // Fetch the current user's rating for the series
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!currentUser?.uid || !seriesid) return;

      try {
        const response = await api.get(
          `/api/ratings/user/${currentUser?.uid}/${seriesid}`
        );
        setUserRating(response.data); // Set the user's rating
        setIsRated(!!response.data); // Set isRated to true if the user has rated
      } catch (error) {
        logger.error("Error fetching user rating:", error);
      } finally {
        setRatingLoading(false);
      }
    };

    fetchUserRating();
  }, [currentUser?.uid, seriesid]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Submit a rating
  const submitRating = async (ratingValue) => {
    const ratingData = {
      seriesId: seriesid,
      userId: currentUser.uid,
      rate: ratingValue,
      comments:
        ratingValue === 3
          ? "Liked this drama"
          : ratingValue === 1
            ? "Didn't like this drama"
            : "Best drama!",
    };

    try {
      const response = await api.post(
        `/api/ratings/create`,
        ratingData
      );
      if (response.status === 200 || response.status === 201) {
        setIsRated(true);
        toast("Thank you for your rating!");
        setShowRating(false);
        setUserRating(ratingData); // Update local state with new rating
      } else {
        toast("Failed to submit your rating!");
      }
    } catch (error) {
      logger.error("Error submitting rating:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.5 }, // At least 50% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Toggle the rating options visibility
  const toggleRatingOptions = () => {
    setShowRating(!showRating);
  };

  return (
    <Fragment>
      <section className="banner-container">
        <div className="movie-banner">
          <div id="banner-detail-slider" className="banner-container">
            <div ref={containerRef} className="movie-banner tvshows-slider">
              <Swiper
                navigation={{
                  prevEl: ".swiper-banner-button-prev",
                  nextEl: ".swiper-banner-button-next",
                }}
                onSlideChange={() => setIsLoading(true)}
                slidesPerView={1}
                modules={[Navigation]}
                loop={true}
                centeredSlides={true}
              >
                <SwiperSlide key={coverimage}>
                  <div className="movie-banner-image ">
                    {!showVideo || isMobile || !promo || promo == "null" ? (
                      <img
                        src={
                          `${import.meta.env.VITE_APP_IMAGE_PATH}` + coverimage
                        }
                        className="flipimage"
                        alt=""
                      />
                    ) : (
                      <VideoPlayer
                        videoUrl={promo}
                        isMuted={true}
                        autoPlay={true}
                        loop={true}
                        playsInline={true}
                        className="w-100 h-100 top-0 start-0 scaleVideo"
                        style={{
                          objectFit: "cover",
                          zIndex: 1,
                          visibility: showVideo ? "visible" : "hidden",
                          opacity: showVideo ? 1 : 0,
                          transition: "opacity 1.5s ease-in-out",
                        }}
                        showControls={false}
                        ref={videoRef}
                      />
                    )}
                  </div>

                  <div
                    className="shows-contentnew h-100"
                    style={{ zIndex: 999 }}
                  >
                    <Row className="align-items-center h-100">
                      <Col lg="8" md="12" className="p-4">
                        <div className="hover-trigger-wrapper">
                          <h1 className="big-font-3 letter-spacing-1 line-count-1 text-uppercase mb-0">
                            {logo != null ? (
                              <div
                                className={
                                  !isMobile
                                    ? `sliderLogoDiv${showVideo ? " shrink-logo" : ""}`
                                    : ""
                                }
                              >
                                <img
                                  className="img-fluid w-50"
                                  src={
                                    `${import.meta.env.VITE_APP_IMAGE_PATH}` +
                                    logo
                                  }
                                  alt={title}
                                />
                              </div>
                            ) : (
                              title
                            )}
                          </h1>

                          <div
                            className={`flex-wrap align-items-center fadeInLeft animated mt-4 ${!isMobile ? `sliderTextDiv w-60 ${showVideo ? "shrink-text" : ""}` : ""}`}
                            data-animation-in="fadeInLeft"
                            style={{
                              ...(!isMobile
                                ? {
                                  opacity: showText ? 1 : 0.5,
                                  transition: "0.5s ease-in-out",
                                  // display: isVisible ? "block" : "none",
                                }
                                : {}),
                            }}
                          >
                            <p
                              className="movie-banner-text line-count-3"
                              data-animation-in="fadeInUp"
                              data-delay-in="1.2"
                            >
                              {description}
                            </p>

                            <p
                              className="movie-banner-text line-clamp-2"
                              data-animation-in="fadeInUp"
                              data-delay-in="1.2"
                            >
                              Starring: {cast}
                            </p>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap align-items-center r-mb-23 RightAnimate-two mt-2 mobileAlign">
                          <div className="slider-ratting d-flex">
                            {/* <ul className="ratting-start p-0 m-0 list-inline text-warning d-flex align-items-center justify-content-left">
                              <li><i className="fa fa-star" aria-hidden="true"></i></li>
                              <li><i className="fa fa-star" aria-hidden="true"></i></li>
                              <li><i className="fa fa-star" aria-hidden="true"></i></li>
                              <li><i className="fa fa-star" aria-hidden="true"></i></li>
                              <li><i className="fa fa-star-half" aria-hidden="true"></i></li>
                            </ul> */}
                            <span className="">
                              {releaseDate
                                ? new Date(releaseDate).getFullYear()
                                : 2025}
                            </span>

                            {genreTitles.length > 0 ? (
                              <span className="ms-2 line-clamp-1">
                                {genreTitles}
                              </span>
                            ) : null}

                            {/* <span className="ms-2 line-clamp-1">21 Episodes</span> */}
                            <span className="ms-2 line-clamp-1">
                              {seriesType === "show" ||
                                seriesType === "programs"
                                ? `${episodeCount ?? 20} Episodes`
                                : seriesType === "live" ||
                                  seriesType === "live-event"
                                  ? "Live"
                                  : `${duration ?? "01:01:38"}`}
                            </span>
                          </div>
                        </div>

                        <div
                          className="iq-button series-banner-d-flex gap-2 mt-5 RightAnimate-two align-items-start align-items-md-center"
                          data-animation-in="fadeInUp"
                          data-delay-in="1.2"
                        >

                          {/* {packageData ?  ( */}
                          {/* {packageData && currentUser?.subscriptions?.[packageIds] ? ( */}
                            {tvodEnabled && packageData && currentUser?.subscriptions?.[packageIds]?.subscription_status === "active" ? (
                            // Condition 1: If content is locked and rented then show play now with time left
                            // <Link
                            //   to={`/video/v1/3/${episode1}/${seriesid}`}
                            //   className="btn position-relative"
                            //   title="Play"
                            // >
                            //   <img
                            //     src="/assets/images/icons/play-now.svg"
                            //     alt="Play"
                            //     className="play-icon"
                            //   />
                            //   <span className="button-text ms-1 fw-bold">Play Now <br></br><span className="I want to align it with play now not with logo img"> 2 days left</span></span>
                            // </Link>
                            <Link
                              to={getPlayLink()}
                              className="btn position-relative d-flex align-items-center"
                              title="Play"
                            >
                              <img
                                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/play-now.svg`}
                                alt="Play"
                                className="play-icon me-2"
                              />
                              <div className="button-text-wrapper">
                                <span className="button-text fw-bold">Play Now</span>
                                <span className="expiry-text">
                                {currentUser?.subscriptions?.[packageIds].daysLeftText} 
                                  {/* {calculateDaysLeft(currentUser?.subscriptions?.[packageIds]?.subscription_expiry)} */}
                                </span>
                              </div>
                            </Link>

                          ) : showLock ? (
                            // Condition 2: If content is locked and not rented then show rent now
                            locationLoading ? (
                              <div className="btn d-inline-flex align-items-center gap-3 rent-BTN py-3">
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="ms-2">Loading...</span>
                              </div>
                            ) : (
                              <Link
                                to={`/tvod/${seriesid}`}
                                className="btn d-inline-flex align-items-start gap-3 rent-BTN"
                                aria-label="Rent Now"
                                title="Rent Now"
                              >
                                {/* Icon */}
                                <span className="btn__icon" aria-hidden="true">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="35"
                                    viewBox="0 0 28 35"
                                    fill="none"
                                  >
                                    <path
                                      d="M14 0.417969C18.7172 0.418113 22.5409 4.24173 22.541 8.95898V14.084H24.25C26.1369 14.0841 27.666 15.6141 27.666 17.501V31.168C27.6658 33.0546 26.1367 34.5838 24.25 34.584H3.75C1.86318 34.584 0.333257 33.0547 0.333008 31.168V17.501C0.333008 15.614 1.86303 14.084 3.75 14.084H19.125V8.95898C19.1249 6.1287 16.8303 3.83413 14 3.83398C11.1696 3.83398 8.8751 6.12861 8.875 8.95898C8.875 9.90247 8.1095 10.668 7.16602 10.668C6.22271 10.6678 5.45801 9.90234 5.45801 8.95898C5.45811 4.24164 9.28263 0.417969 14 0.417969Z"
                                      fill="black"
                                    />
                                  </svg>
                                </span>

                                {/* Text */}
                                <span className="btn__text">
                                  <span className="btn__price">
                                    {getPricingByCurrency().currency} {getPricingByCurrency().price}
                                  </span>
                                  <span className="btn__cta">Rent now</span>
                                </span>
                              </Link>
                            )
                          ) : (
                            // Condition 3: Otherwise, show simple "Play Now" because content is free
                            <Link
                              to={getPlayLink()}
                              className="btn position-relative"
                              title="Play"
                            >
                              <img
                                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/play-now.svg`}
                                alt="Play"
                                className="play-icon"
                              />
                              <span className="button-text ms-1 fw-bold">Play Now</span>
                            </Link>
                          )}

                          {(seriesType === "show" ||
                            seriesType === "programs" ||
                            seriesType === "singleVideo") && (
                              <Link
                                onClick={toggleFavorite}
                                className="position-relative heroLinks text-white"
                                title="Add to List"
                              >
                                {!isFavorite ? (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/add-to-list.svg`}
                                    alt="Add to List"
                                  />
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/add-to-list-done.svg`}
                                    alt="Added to List"
                                  />
                                )}
                                <span className="ms-2 d-none-mobile">
                                  Add to List
                                </span>
                              </Link>
                            )}

                          <Link
                            onClick={toggleSharePopup}
                            className="position-relative heroLinks share-button text-white"
                            style={{ background: "none", border: "none" }}
                          >
                            <img
                              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/link.svg`}
                              alt="Share"
                              title="Share"
                            />
                            <span className="ms-2 d-none-mobile">Share</span>
                          </Link>
                          {showSharePopup && (
                            <SharePopupPortal
                              url={
                                import.meta.env.VITE_APP_API_HOME_ENDPOINT +
                                "/sharer/series/" +
                                seriesid
                              }
                              onClose={() => setShowSharePopup(false)}
                            />
                          )}
                          {/* <SharePopup url={shareUrl} onClose={() => setShowSharePopup(false)} /> */}

                          {Authenticated && (
                            <Link
                              className="position-relative rating heroLinks text-white"
                              onClick={toggleRatingOptions}
                              title="Rate This Content"
                            >
                              <span>
                                {userRating && userRating.rate === 1 ? (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/disliked.svg`}
                                    alt="Thumbs Down"
                                  />
                                ) : userRating && userRating.rate === 3 ? (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/liked.svg`}
                                    alt="Thumbs Up"
                                  />
                                ) : userRating && userRating.rate === 5 ? (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/loved.svg`}
                                    alt="Heart"
                                  />
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/like.svg`}
                                    alt="Default Icon"
                                  />
                                )}
                              </span>
                              <span className="ms-2 d-none-mobile">Rate</span>
                            </Link>
                          )}

                          {showRating && (
                            <div className="content-rating-tooltip">
                              <div
                                className={userRating && userRating.rate === 1 ? "selected rating-option" : "rating-option"}
                                onClick={() => submitRating(1)}
                                title="Dislike"
                              >
                                <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/dislike.svg`} alt="Dislike" style={{ width: '22px', height: '22px' }} />
                                <span className="rating-label">Dislike</span>
                              </div>
                              <div
                                className={
                                  userRating && userRating.rate === 3
                                    ? "selected rating-option"
                                    : "rating-option"
                                }
                                onClick={() => submitRating(3)}
                                title="Like"
                              >
                                <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/like2.svg`} alt="Like" style={{ width: '22px', height: '22px' }} />
                                <span className="rating-label">Like</span>
                              </div>
                              <div
                                className={
                                  userRating && userRating.rate === 5
                                    ? "selected rating-option"
                                    : "rating-option"
                                }
                                onClick={() => submitRating(5)}
                                title="Love"
                              >
                                <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/love.svg`} alt="Love" style={{ width: '22px', height: '22px' }} />
                                <span className="rating-label">Love</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-none-mobile"
                    style={{
                      zIndex: 2,
                      boxShadow: `
                            inset 250px 0 70px -5px rgba(31, 31, 31, 0.8),
                            inset 0 120px 60px -20px rgba(31, 31, 31, 0.3)` ,
                      pointerEvents: "none",
                    }}
                  ></div>

                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      zIndex: 2,
                      boxShadow:
                        "inset 0 -150px 80px -30px rgba(31, 31, 31, 1)",
                      pointerEvents: "none",
                    }}
                  ></div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>
      <FsLightbox
        toggler={toggler}
        sources={[
          ost && ost !== "null" && ost !== ""
            ? ost
            : promo && promo !== "null" && promo !== ""
              ? promo
              : null,
        ]}
      // sources={[{"/assets/images/video/trailer.mp4"}]}
      />
    </Fragment>
  );
});

export default VideoHeroSliderNew;
