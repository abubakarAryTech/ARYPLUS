import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Controller, EffectFade, Autoplay } from "swiper/modules";
import { Container, Row, Tab, Nav, Col } from "react-bootstrap";
import EpisodeCard from "../cards/EpisodeCard";
import { useState } from "react";
import { Link } from "react-router-dom";
import { generateImgPath } from "../../StaticData/data";

export default function () {
  const [mainSwiper, setMainSwiper] = useState(null);
  const [thumbSwiper, setThumbSwiper] = useState(null);

  const [trendingSlider, setTrendingSlider] = useState([
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}poster/Parwaraish_1746171996054.webp`,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}poster/Naqaab_1746172031805.webp`,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}poster/Aye%20Dil_1746172038216.webp`,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}poster/Aye%20Dil_1746172038216.webp`,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}poster/Aye%20Dil_1746172038216.webp`,
    },
  ]);

  return (
    <>
      <section className="tranding-tab-slider">
        <Container>
          <Row className="m-0 p-0">
            <div
              id="iq-trending"
              className="s-margin iq-tvshow-tabs iq-trending-tabs overflow-hidden"
            >
              <div className="trending-contens position-relative">
                <div
                  id="gallery-top"
                  className="swiper gallery-thumbs"
                  data-swiper="gallery-top"
                >
                  <Swiper
                    slidesPerView={3}
                    modules={[Navigation, Controller, Autoplay]}
                    touchRatio={0.2}
                    initialSlide={1} // assuming you have at least 3 slides
                    loop={true}
                    //                    autoplay={{
                    //   delay: 2500,
                    //   disableOnInteraction: false,
                    // }}
                    slideToClickedSlide={true}
                    centeredSlides={true}
                    className="list-inline p-0 m-0 trending-slider-nav align-items-center"
                    controller={{ control: thumbSwiper }}
                    onSwiper={setMainSwiper}
                    breakpoints={{
                      0: {
                        slidesPerView: 2,
                      },
                      479: {
                        slidesPerView: 3,
                      },
                      1000: {
                        slidesPerView: 3,
                      },
                    }}
                  >
                    {trendingSlider.map((data) => (
                      <SwiperSlide
                        key={data.image + "thumb"}
                        as="li"
                        className="swiper-slide"
                      >
                        <Link to="#">
                          <div className="movie-swiper position-relative">
                            <img
                              src={data.image}
                              alt="img"
                              className="w-full h-auto"
                            />
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </Row>
        </Container>
      </section>
    </>
  );
}
