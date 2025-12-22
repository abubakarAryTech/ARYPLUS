import React, { useState, useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link, useNavigate } from "react-router-dom";
import FsLightbox from "fslightbox-react";
import api from "../../services/api";
import "swiper/css";
import "swiper/css/navigation";
import logger from '../../services/logger';
import { toast } from "react-hot-toast";

// Legacy import removed - using props instead
import { getConfig } from "../../../config.js";
import VideoPlayer from "../VideoPlayer";
import { toTitleCase } from "../../utilities/usePage";
import { useWatchlist } from "../../hooks/useWatchlist";

const HomeHeroSlider = React.memo(({ list = [], favorites = [], user = null }) => {
  const [toggler, setToggler] = useState(false);
  const [videoSource, setVideoSource] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // const [user, setUser] = useState(null);
  const config = getConfig();
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const { isFavorite, toggle: toggleFav } = useWatchlist();

  const toggleFavorite = async (seriesId) => {
    const wasFavorite = isFavorite(seriesId);
    const success = await toggleFav(seriesId);
    if (success) {
      toast.success(
        wasFavorite ? "Removed from My List" : "Added to My List"
      );
    }
  };

  const handleVideoOpen = useCallback((source) => {
    if (source) {
      setVideoSource(source);
      setToggler((prev) => !prev);
    }
  }, []);

  const playNow = useCallback(
    async (seriesId) => {
      if (!seriesId) return;
      try {
        const response = await api.get(
          `/api/cdn/${seriesId}`
        );
        const data = response.data;
        if (data?.episode?.length > 0) {
          const ep1Id = data.episode[0]._id;
          navigate(
            user
              ? `/video/v1/3/${ep1Id}/${seriesId}`
              : `/login?redirect=/video/v1/3/${ep1Id}/${seriesId}`,
          );
        }
      } catch (error) {
        logger.error("Failed to fetch episodes:", error);
      }
    },
    [user, navigate],
  );

  // useEffect(() => {
  // User data now passed as props from parent component
  // }, []);



  const goToSlide = useCallback(
    (index) => {
      if (swiperRef.current && index >= 0 && index < list.length) {
        swiperRef.current.slideTo(index);
      }
    },
    [list.length],
  );

  return (
    <>
      <Swiper
        navigation={{
          prevEl: "#home-banner-slider-prev",
          nextEl: "#home-banner-slider-next",
        }}
        id="home-banner-slider"
        className="iq-main-slider banner-home-swiper overflow-hidden mb-0 banner-height"
        modules={[Navigation]}
        loop={false}
        wrapperClass="m-0 p-0"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        style={{ contain: "paint" }}
      >
        {list.map((item, index) => (
          <SwiperSlide
            className="slide s-bg-1 p-0"
            key={item?.data?._id || index}
          >
            <SlideItem
              item={item}
              index={index}
              activeIndex={activeIndex}
              handleVideoOpen={handleVideoOpen}
              isFavorite={isFavorite(item?.data?._id)}
              toggleFavorite={toggleFavorite}
              playNow={playNow}
              user={user}
              seriesId={item?.data?._id}
              seriesType={item?.data?.seriesType}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="slide-controls end-0 d-flex align-items-center">
        {list.map((_, index) => (
          <span
            key={index}
            className={`slide-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            title={`Go to slide ${index + 1}`}
          >
            -
          </span>
        ))}
      </div>

      <FsLightbox toggler={toggler} sources={[videoSource].filter(Boolean)} />
    </>
  );
});

const SlideItem = React.memo(
  ({
    item,
    index,
    activeIndex,
    handleVideoOpen,
    isFavorite,
    toggleFavorite,
    playNow,
    user,
    seriesId,
    seriesType,
  }) => {
    const [showVideo, setShowVideo] = useState(false);
    const [showText, setShowText] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [width, setWidth] = useState(
      typeof window !== "undefined" ? window.innerWidth : 1024,
    );
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      if (index === activeIndex) {
        setShowText(true);
        setShowVideo(false);
        timerRef.current = setTimeout(() => {
          setShowText(false);
          setShowVideo(true);
        }, 2000);
      } else {
        clearTimeout(timerRef.current);
        setShowText(true);
        setShowVideo(false);
      }
      return () => clearTimeout(timerRef.current);
    }, [activeIndex, index]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          const video = videoRef.current;
          if (
            video &&
            entry.isIntersecting &&
            index === activeIndex &&
            showVideo
          ) {
            video.play().catch(() => {});
          } else if (video) {
            video.pause();
          }
        },
        { threshold: 0.5 },
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
      };
    }, [index, activeIndex, showVideo]);

    if (!item?.data) {
      return null; // Early return if item or item.data is undefined
    }

    const videoSrc = item.data.trailer;

    return (
      <div
        ref={containerRef}
        className="position-relative w-100 h-100 overflow-hidden"
        style={{ contain: "paint" }}
      >
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={`${import.meta.env.VITE_APP_IMAGE_PATH}slider/${item.imagePath}?format=webp 1x`}
            type="image/webp"
          />
          <img
            src={`${import.meta.env.VITE_APP_IMAGE_PATH}slider/${item.imagePath}`}
            alt={item.data.title || "banner-home-swiper-image"}
            className="w-100 h-100 position-absolute top-0 start-0 object-fit-cover d-none d-md-block"
            style={{ objectFit: "cover", objectPosition: "top center" }}
            loading="lazy"
            onError={(e) => {
              e.target.src = "/assets/images/slider-place-holder-image.jpg";
            }}
          />
        </picture>

        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.data.imageCoverMobile}?format=webp 1x`}
            type="image/webp"
          />
          <img
            src={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.data.imageCoverMobile}`}
            alt={item.data.title || "banner-home-swiper-image-mobile"}
            className="w-100 d-block d-md-none"
            style={{ objectFit: "cover", position: "relative" }}
            loading="lazy"
            onError={(e) => {
              e.target.src =
                "/assets/images/slider-place-holder-image-mobile.jpg";
            }}
          />
        </picture>

        {videoSrc && showVideo && (
          <VideoPlayer
            videoUrl={videoSrc}
            isMuted={isMuted}
            autoPlay={false}
            loop={true}
            playsInline={true}
            className="w-100 h-100 position-absolute top-0 start-0 object-fit-cover d-none-mobile scaleVideo"
            style={{
              objectFit: "cover",
              opacity: showVideo ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
            showControls={false}
            ref={videoRef}
            preload="none"
          />
        )}

        {/* Volume Control */}
        {videoSrc != "null" && videoSrc && showVideo && (
          <button
            className="position-absolute d-none-mobile btn btn-sm bg-transparent border-0 text-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // console.log('Volume button clicked, isMuted:', isMuted);
              setIsMuted(!isMuted);
            }}
            title={isMuted ? "Unmute" : "Mute"}
            style={{ 
              bottom: "100px", 
              right: "100px", 
              zIndex: 9999, 
              padding: "12px", 
              borderRadius: "50%", 
              backgroundColor: "rgba(255,255,255,0.9)", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/${isMuted ? "mute" : "unmute"}.png`}
              alt={isMuted ? "Mute" : "Unmute"}
              style={{ width: "40px", height: "40px", pointerEvents: "none" }}
            />
          </button>
        )}

        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-none-mobile"
          style={{
            boxShadow:
              "inset 200px 0 60px -10px rgba(31, 31, 31, 0.8), inset 0 100px 50px -20px rgba(0, 0, 0, 0.3)",
            pointerEvents: "none",
          }}
        />

        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            boxShadow: "inset 0 -120px 70px -30px rgba(31, 31, 31, 1)",
            pointerEvents: "none",
          }}
        />

        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ pointerEvents: "none" }}
        />

        <div className="container-fluid position-relative h-100" style={{ pointerEvents: "none" }}>
          <div className="slider-inner homeSliderContent" style={{ pointerEvents: "auto" }}>
            <div className="row iq-ltr-direction h-100">
              <div className="order-2 order-md-1 col-lg-6 col-md-12 hero-mobile-content">
                <div className="hover-trigger-wrapper-home">
                  <h1 className="big-font-3 letter-spacing-1 line-count-1 text-uppercase mb-0 RightAnimate">
                    {item.data.logo ? (
                      <div className="sliderLogoDiv">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.data.logo}`}
                          alt={item.data.title || item.title || "Slider Logo"}
                          className="img-fluid"
                          style={{
                            maxWidth:
                              width > 768 ? (showText ? "60%" : "50%") : "75%",
                            transition: "max-width 0.5s ease-in-out",
                          }}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src =
                              "/assets/images/logo-placeholder.png";
                          }}
                        />
                      </div>
                    ) : (
                      toTitleCase(item.data.title || item.title || "Untitled")
                    )}
                  </h1>
                  
                  <div className="d-flex flex-wrap align-items-center r-mb-23 mt-4">
                  <div className="slider-ratting d-flex align-items-center">
                    <span className="">
                      {item?.data?.releaseDate
                        ? new Date(item?.data?.releaseDate).getFullYear()
                        : 2025}
                    </span>
                    <span className="ms-2 line-clamp-1">
                      {logger.log('🔍 item.data.genreId[0]:', item?.data?.genreId?.[0])}
                      {item?.data?.genreId?.length > 0
                        ? item.data.genreId[0].title || item.data.genreId[0]
                        : "Romance"}
                    </span>
                    <span className="ms-2 line-clamp-1">
                      {item?.data?.seriesType === "show" ||
                      item?.data?.seriesType === "programs"
                        ? `${item?.data?.episodeCount ?? 20} Episodes`
                        : item?.data?.seriesType === "live" ||
                            item?.data?.seriesType === "live-event"
                          ? "Live"
                          : `${item?.data?.videoDuration ?? "01:01:38"}`}
                    </span>
                  </div>
                </div>

                <div
                  className="flex-wrap align-items-center fadeInLeft animated mt-4"
                  data-animation-in="fadeInLeft"
                  // style={{
                  //   opacity: width < 768 ? 1 : showText ? 1 : 0,
                  //   transition: "opacity 0.5s ease-in-out",
                  // }}
                >
                  <p
                    className="movie-banner-text line-count-3"
                    data-animation-in="fadeInUp"
                    data-delay-in="1.2"
                  >
                    {item.data.description || "No description available."}
                  </p>
                </div>

                  <div className="RightAnimate-four mt-4">
                    <div className="iq-button gap-2 align-items-start align-items-md-center">
                      {item.data.seriesType === "live-event" ? (
                        <>
                          <Link
                            to={`/live-event/v1/${item.data._id}`}
                            className="position-relative d-flex align-items-center bg-transparent border-0 text-white"
                            title="Watch Now"
                          >
                            <img
                              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/play-green.svg`}
                              alt="Play"
                              style={{ width: "40px", height: "40px", flexShrink: 0 }}
                            />
                                                                                    <span className="ms-2 d-none-mobile">Watch Now</span>

                          </Link>
                          {(seriesType === "show" ||
                            seriesType === "programs" ||
                            seriesType === "singleVideo") && (
                              <Link
                                onClick={() => toggleFavorite(seriesId)}
                                className="position-relative heroLinks text-white"
                                title="Add to List"
                              >
                                {!isFavorite ? (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/add.png`}
                                    alt="Add to List"
                                    style={{ width: "40px", height: "40px" }}
                                  />
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/added.png`}
                                    alt="Added to List"
                                    style={{ width: "40px", height: "40px" }}
                                  />
                                )}
                                <span className="ms-2 d-none-mobile">
                                  Add to List
                                </span>
                              </Link>
                            )}
                          <Link
                            to={`/series/${item.data.seriesLayout}/6897597bf333c02388d3f39e`}
                            className="position-relative heroLinks text-white"
                            title="More Info"
                          >
                            <img
                              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/info.png`}
                              alt="More Info"
                              style={{ width: "40px", height: "40px" }}
                            />
                            <span className="ms-2 d-none-mobile">More Info</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            onClick={() => playNow(item?.data?._id)}
                            className="position-relative align-items-center bg-transparent border-0 text-white"
                            title="Watch Now"
                          >
                            <img
                              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/play-green.svg`}
                              alt="Play"
                              style={{ width: "40px", height: "40px", flexShrink: 0 }}
                            />
                                                        <span className="ms-2 d-none-mobile">Watch Now</span>

                          </Link>
                          {(seriesType === "show" ||
                            seriesType === "programs" ||
                            seriesType === "singleVideo") && (
                              <Link
                                onClick={() => toggleFavorite(seriesId)}
                                className="position-relative heroLinks text-white"
                                title="Add to List"
                              >
                                 {!isFavorite ? (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/add.png`}
                                    alt="Add to List"
                                    style={{ width: "40px", height: "40px" }}
                                  />
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/added.png`}
                                    alt="Added to List"
                                    style={{ width: "40px", height: "40px" }}
                                  />
                                )}
                                <span className="ms-2 d-none-mobile">
                                  Add to List
                                </span>
                              </Link>
                            )}
                          <Link
                            to={`/series/v3/${item.data._id}`}
                            className="position-relative heroLinks text-white"
                            title="More Info"
                          >
                            <img
                              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/info.png`}
                               style={{ width: "40px", height: "40px" }}
                              alt="More Info"
                            />
                            <span className="ms-2 d-none-mobile">More Info</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default HomeHeroSlider;
