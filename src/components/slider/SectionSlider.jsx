import { memo, useRef, useState, useEffect } from "react";
import logger from '../../services/logger';

// react-bootstrap
import { Container } from "react-bootstrap";

import {
  ShimmerTable,
  ShimmerContentBlock,
  ShimmerDiv,
} from "shimmer-effects-react";

import ErrorBoundary from "../../components/ErrorBoundary";

// react-router
import { Link } from "react-router-dom";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { toTitleCase } from "../../utilities/usePage";
import PersonalityCard from "./../cards/PersonalityCard";
import api from "../../services/api";
import { getTaglineByTitle } from '../../constants/titleTaglines';

const modules = [Autoplay, Navigation];

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const SectionSlider = memo(
  ({
    children,
    title,
    list,
    slidesPerView = 6,
    spaceBetween = 0,
    className = "",
    link,
    type,
    index,
  }) => {
    // if list is greater than 6 then loop unlimiteddd
    const loop = list.length > 6;
    const isviewAll = list.length > 6;
    const isviewAllshows = list.length > 3;
    const isviewAlllivestream = list.length > 5;
    const isviewAllDramaOst = list.length > 3;

    const slider = useRef(null);
    const [visible, setVisible] = useState(false);
    const [lazyList, setLazyList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [shimmerCount, setShimmerCount] = useState(6);

    const [shimmerHeight, setShimmerHeight] = useState(320);

    const handleViewAllClick = () => {
      localStorage.setItem("listData", JSON.stringify(list));
    };

    useEffect(() => {
      const updateShimmerSettings = () => {
        const width = window.innerWidth;

        if (width < 768) {
          setShimmerCount(2); // Mobile view
          setShimmerHeight(250); // Adjust height for mobile
        } else if (width >= 768 && width < 1024) {
          setShimmerCount(4); // Tablet view
          setShimmerHeight(280); // Adjust height for tablet
        } else {
          setShimmerCount(6); // Desktop view
          setShimmerHeight(320); // Adjust height for desktop
        }
      };

      updateShimmerSettings(); // Run on component mount
      window.addEventListener("resize", updateShimmerSettings); // Update on resize

      return () => {
        window.removeEventListener("resize", updateShimmerSettings); // Cleanup listener
      };
    }, []);

    // Intersection Observer for Lazy Loading
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            setVisible(true);
          }
        },
        { threshold: 0.1 },
      );

      if (slider.current) {
        observer.observe(slider.current);
      }

      return () => {
        if (slider.current) {
          observer.unobserve(slider.current);
        }
      };
    }, []);

    // Fetch movies when visible and type is SeriesByGenres
    useEffect(() => {
      if (visible && type === "SeriesByGenres" && lazyList.length === 0) {
        setLoading(true);
        api.get(
          `/api/genres/genreid/pg/${list}`
        )
          .then((response) => {
            setLazyList(response.data.series); // Adjust this based on your API's response format
            setLoading(false);
          })
          .catch((error) => {
            logger.error("Error fetching movies:", error);
            setLoading(false);
          });
      }
    }, [visible, type, list, lazyList]);

    const initSwiper = (swiper) => {
      addCustomClassToVisibleSlides(swiper);
    };

    const addCustomClassToVisibleSlides = (swiper) => {
      if (slider.current) {
        if (swiper) {
          slider.current
            .querySelectorAll(".swiper-slide")
            .forEach((separateSlide) => separateSlide.classList.remove("last"));

          const swiperSlide = slider.current.querySelectorAll(
            ".swiper-slide-visible",
          );

          const lastVisibleSlide = swiperSlide[swiperSlide.length - 1];

          setTimeout(() => {
            if (lastVisibleSlide) {
              lastVisibleSlide.classList.add("swiper-active", "last");
            }
          }, 0);
        }
      }
    };

    // Define breakpoints
    const getBreakpoints = () => {
      if (title === "Casts") {
        return {
          0: { slidesPerView: 3, spaceBetween: 15 },
          576: { slidesPerView: 3, spaceBetween: 15 },
          768: { slidesPerView: 3, spaceBetween: 15 },
          1025: { slidesPerView: slidesPerView, spaceBetween: 15 },
          1500: { slidesPerView: slidesPerView, spaceBetween: 15 },
        };
      }

      if (title === "SHOWS" || title === "Drama's OST") {
        return {
          0: { slidesPerView: 1, spaceBetween: 15 },
          576: { slidesPerView: 1, spaceBetween: 15 },
          768: { slidesPerView: 3, spaceBetween: 15 },
          1025: { slidesPerView: slidesPerView, spaceBetween: 15 },
          1500: { slidesPerView: slidesPerView, spaceBetween: 15 },
        };
      }

      return {
        0: { slidesPerView: 2, spaceBetween: 15 },
        576: { slidesPerView: 2, spaceBetween: 15 },
        768: { slidesPerView: 3, spaceBetween: 15 },
        1025: { slidesPerView: slidesPerView, spaceBetween: 15 },
        1500: { slidesPerView: slidesPerView, spaceBetween: 15 },
      };
    };

    return (
      <div className={className}>
        <Container fluid>
          <div style={{ position: "relative" }}>
            {/* Shadow element */}

            {index == 3 || index == 11 ? (
              <div
                className="position-absolute"
                style={{
                  top: -200,
                  left: -250,
                  width: "500px",
                  height: "500px",
                  background:
                    "radial-gradient(circle, rgba(209, 253, 21, 0.12) 0%, transparent 50%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              ></div>
            ) : null}

            <div
              className="card-style-slider"
              // className="overflow-hidden card-style-slider"
              ref={slider}
            >
              {/* {!(type === "SeriesByGenres" && loading) && ( */}
              {/* <div className="d-flex align-items-end justify-content-between px-1 mb-2 mt-4"> */}
              <div
                className={`d-flex align-items-top justify-content-between px-1 section-title mb-4 ${title !== "Continue Watching" ? "mt-5" : "CWatching"}`}
              >
                <div>
                <h5 className="main-title mb-0 homepageh5">
                  {!loading ? toTitleCase(title) : null}
                </h5>
                {!loading && getTaglineByTitle(title) && (
                  <p className="section-subtitle mb-0">
                    {getTaglineByTitle(title)}
                  </p>
                )}
                </div>
                {(title === "SHOWS" && isviewAllshows) ||
                (title === "LIVE STREAMING" && isviewAlllivestream) ||
                (title === "Drama's OST" && isviewAllDramaOst) ||
                title === "DRAMA ARCHIVE" ||
                (isviewAll &&
                  title !== "SHOWS" &&
                  title !== "Live Streaming" &&
                  title !== "Drama's OST" &&
                  title !== "TOP 10 PICKS" &&
                  title !== "Continue Watching" &&
                  title !== "Recommended For You" &&
                  title !== "Casts") ? (
                    <div>
                  <Link
                    to={link ? link : `/view-all/${type}/${title}`}
                    className="iq-view-all text-decoration-none text-light btn view-all-btn view-all-btn-home"
                    onClick={handleViewAllClick}
                  >
                    View All <i className="fas fa-chevron-right ms-1"></i>
                  </Link>
                  </div>
                ) : null}
              </div>

              {/* // )} */}

              {loading ? (
                // <div className="shimmer">Loading...</div> // Replace with your shimmer effect
                // <ShimmerTable mode="light" row={1} col={6} border={1} borderColor={"#6BFE12"} rounded={0.25} rowGap={10} colPadding={[5, 5, 5, 5]} />
                // <ShimmerContentBlock mode="light" rounded={1} items={1} itemsGap={20} thumbnailHeight={300} thumbnailWidth={300} thumbnailRounded={1} contentDetailsPosition="start" contentDetailTextLines={0} />
                <div className="d-flex justify-content-between">
                  {Array.from({ length: shimmerCount }).map((_, index) => (
                    <ShimmerDiv
                      key={index}
                      mode="custom"
                      from={"#131313"}
                      via={"#242323"}
                      to={"#131313"}
                      height={shimmerHeight} // Dynamically set height
                      width={220}
                      className="m-1"
                    />
                  ))}
                </div>
              ) : (
                <Swiper
                  className="position-relative swiper swiper-card"
                  slidesPerView={slidesPerView}
                  loop={lazyList.length > 6}
                  watchSlidesProgress
                  spaceBetween={15}
                  navigation={{
                    prevEl: ".swiper-button-prev",
                    nextEl: ".swiper-button-next",
                  }}
                  breakpoints={getBreakpoints()}
                  onSwiper={initSwiper}
                  onSlideChange={initSwiper}
                  modules={modules}
                >
                  <>


                    {(type !== "SeriesByGenres" ? list : lazyList).map(
                      (data, index) => (
                        <SwiperSlide
                          tag="li"
                          key={index + generateUUID() + "slider"}
                        >
                          {children(data)}
                        </SwiperSlide>
                      ),
                    )}
                  </>

                  <div className="swiper-button swiper-button-next"></div>
                  <div className="swiper-button swiper-button-prev"></div>
                </Swiper>
              )}
            </div>
          </div>
        </Container>
      </div>
    );
  },
);

SectionSlider.displayName = "SectionSlider";

export default SectionSlider;
