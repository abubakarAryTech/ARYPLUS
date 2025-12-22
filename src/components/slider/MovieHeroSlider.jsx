import React, { memo, Fragment } from "react";

// react-router
import { Link } from "react-router-dom";

// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// img
const img1 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/movies/movie-banner-1.webp`;
const img2 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/movies/movie-banner-2.webp`;
const img3 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/movies/movie-banner-3.webp`;

const MovieHeroSlider = memo(() => {
  return (
    <Fragment>
      <section className="banner-container section-padding-bottom">
        <div className="movie-banner">
          <div id="banner-detail-slider" className="banner-container">
            <div className="movie-banner tvshows-slider">
              <Swiper
                navigation={{
                  prevEl: ".swiper-banner-button-prev",
                  nextEl: ".swiper-banner-button-next",
                }}
                slidesPerView={1.2}
                modules={[Navigation]}
                loop={true}
                centeredSlides={true}
                className="swiper-banner-container mb-0"
              >
                <SwiperSlide>
                  <div className="movie-banner-image">
                    <img src={img1} alt="movie-banner-image" />
                  </div>
                  <div className="shows-content h-100">
                    <div className="row align-items-center h-100">
                      <div className="col-lg-7 col-md-12">
                        <h1
                          className="texture-text big-font letter-spacing-1 line-count-1 text-uppercase RightAnimate-two"
                          data-animation-in="fadeInLeft"
                          data-delay-in="0.6"
                        >
                          John Wick
                        </h1>
                        <div
                          className="flex-wrap align-items-center fadeInLeft animated"
                          data-animation-in="fadeInLeft"
                          style={{ opacity: 1 }}
                        >
                          <div className="slider-ratting d-flex align-items-center gap-3">
                            <ul className="ratting-start p-0 m-0 list-inline text-primary d-flex align-items-center justify-content-left">
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fa fa-star-half"
                                  aria-hidden="true"
                                ></i>
                              </li>
                            </ul>
                            <span className="text-white">3.5(lmdb)</span>
                          </div>
                          <div className="d-flex flex-wrap align-items-center gap-3 movie-banner-time">
                            <span className="badge bg-secondary p-2">
                              <i className="fa fa-eye"></i>
                              PG
                            </span>
                            <span className="font-size-6">
                              <i className="fa-solid fa-circle"></i>
                            </span>
                            <span className="trending-time font-normal">
                              {" "}
                              1hr : 44mins{" "}
                            </span>
                            <span className="font-size-6">
                              <i className="fa-solid fa-circle"></i>
                            </span>
                            <span className="trending-year font-normal">
                              {" "}
                              Feb 2018{" "}
                            </span>
                          </div>
                          <p
                            className="movie-banner-text line-count-3"
                            data-animation-in="fadeInUp"
                            data-delay-in="1.2"
                          >
                            Dinosaurs are a diverse group of reptiles of the
                            clade Dinosauria. They first appeared during the
                            Triassic period, between 243 and 233.23 million
                            years ago, although the exact origin and timing of
                            the evolution of dinosaurs is the subject of active
                            research.
                          </p>
                        </div>
                        <div
                          className="iq-button"
                          data-animation-in="fadeInUp"
                          data-delay-in="1.2"
                        >
                          <Link
                            to="/movies-detail"
                            className="btn text-uppercase position-relative"
                          >
                            <span className="button-text">Play Now</span>
                            <i className="fa-solid fa-play"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="movie-banner-image">
                    <img src={img2} alt="movie-banner-image" />
                  </div>
                  <div className="shows-content h-100">
                    <div className="row align-items-center h-100">
                      <div className="col-lg-7 col-md-12">
                        <h1
                          className="texture-text big-font letter-spacing-1 line-count-1 text-uppercase RightAnimate-two"
                          data-animation-in="fadeInLeft"
                          data-delay-in="0.6"
                        >
                          jumanjj
                        </h1>
                        <div
                          className="flex-wrap align-items-center fadeInLeft animated"
                          data-animation-in="fadeInLeft"
                          style={{ opacity: 1 }}
                        >
                          <div className="slider-ratting d-flex align-items-center gap-3">
                            <ul className="ratting-start p-0 m-0 list-inline text-primary d-flex align-items-center justify-content-left">
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fa fa-star-half"
                                  aria-hidden="true"
                                ></i>
                              </li>
                            </ul>
                            <span className="text-white">3.5(lmdb)</span>
                          </div>
                          <div className="d-flex flex-wrap align-items-center gap-3 movie-banner-time">
                            <span className="badge bg-secondary p-2">
                              <i className="fa fa-eye"></i>G
                            </span>
                            <span className="font-size-6">
                              <i className="fa-solid fa-circle"></i>
                            </span>
                            <span className="trending-time font-normal">
                              2hr : 42mins{" "}
                            </span>
                            <span className="font-size-6">
                              <i className="fa-solid fa-circle"></i>
                            </span>
                            <span className="trending-year font-normal">
                              {" "}
                              Nov 2017{" "}
                            </span>
                          </div>
                          <p
                            className="movie-banner-text line-count-3"
                            data-animation-in="fadeInUp"
                            data-delay-in="1.2"
                          >
                            The most brutal emperor in the history of world.He
                            was the founder of the most contiguous empire of the
                            world i.e. the Mongol empire.He made an army by
                            himself by uniting some nomadic tribes and trained
                            them.
                          </p>
                        </div>
                        <div
                          className="iq-button"
                          data-animation-in="fadeInUp"
                          data-delay-in="1.2"
                        >
                          <Link
                            to="/movies-detail"
                            className="btn text-uppercase position-relative"
                          >
                            <span className="button-text">Play Now</span>
                            <i className="fa-solid fa-play"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="movie-banner-image">
                    <img src={img3} alt="movie-banner-image" />
                  </div>
                  <div className="shows-content h-100">
                    <div className="row align-items-center h-100">
                      <div className="col-lg-7 col-md-12">
                        <h1
                          className="texture-text big-font letter-spacing-1 line-count-1 text-uppercase RightAnimate-two"
                          data-animation-in="fadeInLeft"
                          data-delay-in="0.6"
                        >
                          The Witcher
                        </h1>
                        <div
                          className="flex-wrap align-items-center fadeInLeft animated"
                          data-animation-in="fadeInLeft"
                          style={{ opacity: 1 }}
                        >
                          <div className="slider-ratting d-flex align-items-center gap-3">
                            <ul className="ratting-start p-0 m-0 list-inline text-primary d-flex align-items-center justify-content-left">
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fas fa-star"
                                  aria-hidden="true"
                                ></i>
                              </li>
                              <li>
                                <i
                                  className="fa fa-star-half"
                                  aria-hidden="true"
                                ></i>
                              </li>
                            </ul>
                            <span className="text-white">3.5(lmdb)</span>
                          </div>
                          <div className="d-flex flex-wrap align-items-center gap-3 movie-banner-time">
                            <span className="badge bg-secondary p-2">
                              <i className="fa fa-eye"></i>
                              PG-13
                            </span>
                            <span className="font-size-6">
                              <i className="fa-solid fa-circle"></i>
                            </span>
                            <span className="trending-time font-normal">
                              {" "}
                              2hr : 12mins{" "}
                            </span>
                            <span className="font-size-6">
                              <i className="fa-solid fa-circle"></i>
                            </span>
                            <span className="trending-year font-normal">
                              {" "}
                              Dec 2018{" "}
                            </span>
                          </div>
                          <p
                            className="movie-banner-text line-count-3"
                            data-animation-in="fadeInUp"
                            data-delay-in="1.2"
                          >
                            Jumbo also known as Jumbo the Elephant and Jumbo the
                            Circus Elephant, was a 19th-century male African
                            bush elephant born in Sudan. Jumbo was exported to
                            Jardin des Plantes, a zoo in Paris, and then
                            transferred in 1865 to London Zoo in England.
                            Despite public protest, Jumbo was sold to P. T.
                            Barnum, who took him to the United States for
                            exhibition in March 1882.
                          </p>
                        </div>
                        <div
                          className="iq-button"
                          data-animation-in="fadeInUp"
                          data-delay-in="1.2"
                        >
                          <Link
                            to="/movies-detail"
                            className="btn text-uppercase position-relative"
                          >
                            <span className="button-text">Play Now</span>
                            <i className="fa-solid fa-play"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <div className="swiper-banner-button-next">
                  <i className="iconly-Arrow-Right-2 icli arrow-icon"></i>
                </div>
                <div className="swiper-banner-button-prev">
                  <i className="iconly-Arrow-Left-2 icli arrow-icon"></i>
                </div>
              </Swiper>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
});

MovieHeroSlider.displayName = "MovieHeroSlider";
export default MovieHeroSlider;
