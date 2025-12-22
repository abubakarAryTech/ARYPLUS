import React, { Fragment, memo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { generateImgPath } from "../StaticData/data";
//react bootstrap
import {
  Col,
  Container,
  Row,
  Nav,
  Tab,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEnterExit } from "../utilities/usePage";
import SeriesSlider from "../components/slider/SeriesSlider";
import VideoHeroSlider from "../components/slider/VideoHeroSlider";
import { Swiper, SwiperSlide } from "swiper/react";
import Loader from "../components/ReactLoader";

const Series = memo(() => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [videos, setVideos] = useState(null);
  const { seriesid } = useParams();
  useEnterExit();
  const [series, setSeries] = useState(null);
  const [title, setTitle] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState(null);
  const [cast, setCast] = useState(null);
  const [ost, setOst] = useState(null);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [logo, setLogo] = useState(null);
  const [isloading, setisloading] = useState(false);
  useEffect(() => {
    if (series == null) {
      setisloading(true);
      // fetch('https://zapi.aryzap.com/api/series/' + seriesid).then((resp) => {
      fetch("https://cdn.aryzap.com/api/zapi_series.php?id=" + seriesid).then(
        (resp) => {
          resp.json().then((result) => {
            setSeries(result.seriesDM);
            setTitle(result.title);
            setImage(result.imageCoverDesktop);
            setDescription(result.description);
            setCast(result.cast);
            setOst(result.ost);
            setDay(result.day);
            setTime(result.time);
            setLogo(result.logo);
            // setPage(2);
            // setPrevPage(1);
            // setPrevPage(prevPage + 1);
            if (videos == null) {
              // "https://api.dailymotion.com/playlist/"+
              //   result.seriesDM +"/videos?fields=thumbnail_480_url%2Ctitle%2Cid%2Cviews_total%2Cduration%2Cowner.screenname%2Cowner&page=1"
              fetch(
                "https://api.dailymotion.com/playlist/" +
                  result.seriesDM +
                  "/videos?fields=thumbnail_480_url%2Ctitle%2Cid%2Cviews_total%2Cduration%2Cowner.screenname%2Cowner&limit=100",
              ).then((resp) => {
                resp.json().then((result1) => {
                  const ep_keywords = ["ep 1", "episode 1", "ep1", "episode1"];
                  const promo_keywords = ["promo", "ost", "teaser", "starting"];
                  // Check if the first item's title contains any episode keywords
                  let firstItem = result1.list[0];
                  let title = firstItem.title.toLowerCase();
                  let containsEpKeyword = ep_keywords.some((keyword) =>
                    title.includes(keyword),
                  );
                  if (!containsEpKeyword) {
                    result1 = { ...result1, list: result1.list.reverse() };
                  }

                  firstItem = result1.list[0];
                  title = firstItem.title.toLowerCase();
                  const containsPromoKeyword = promo_keywords.some((keyword) =>
                    title.includes(keyword),
                  );

                  if (containsPromoKeyword) {
                    result1.list.shift(); // Remove the first item from the list
                  }

                  setVideos(result1);
                  setisloading(false);
                });
              });
            }
          });
        },
      );
    }
  });

  var nf = new Intl.NumberFormat();

  return (
    <Fragment>
      {isloading ? (
        <Loader />
      ) : (
        <>
          <VideoHeroSlider
            title={title}
            image={image}
            description={description}
            ost={ost}
            day={day}
            time={time}
            cast={cast}
          />
          <div className="section-padding-bottom">
            <Container fluid>
              <div className="content-details iq-custom-tab-style-two">
                <div className="overflow-hidden animated fadeInUp">
                  <div className="tab-slider">
                    <div className="slider">
                      <SwiperSlide
                        tag="li"
                        className="tab-slider-banner"
                        key={`https://zapi.aryzap.com/${image}`}
                      >
                        <div className="tab-slider-banner-images">
                          <img
                            src={`https://zapi.aryzap.com/${image}`}
                            alt="tab-slider-background"
                          />
                        </div>
                        <div className="block-images position-relative w-100">
                          <div className="container-fluid">
                            <div className="row align-items-center min-vh-100 h-100 my-4">
                              <div className="col-md-4 col-lg-4 col-xxl-4">
                                <div className="tab-left-details">
                                  {/* <div className="d-flex align-items-center gap-3 mb-4">
                            <Link to="">
                              <img
                                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/movies/trending-label.webp`}
                                className="img-fluid"
                                alt=""
                              />
                            </Link>
                            <h5 className="text-gold">
                              <span className="text-primary">#1</span>{" "}
                              {title}
                            </h5>
                          </div> */}
                                  {/* <h1 className="mb-2 fw-500 text-capitalize texture-text">
                          {title}
                          </h1> */}
                                  <div className="justify-content-center d-flex justify-content-md-start">
                                    <img
                                      src={`https://zapi.aryzap.com/${logo}`}
                                      className="img-fluid rounded"
                                      alt=""
                                    />
                                  </div>
                                  {/* <p className="mb-0 font-size-14 line-count-2">
                            {description}
                          </p> */}
                                  {/* <div className="iq-button">
                            <Link
                              to="/movies-detail"
                              className="btn text-uppercase position-relative"
                            >
                              <span className="button-text">Play now</span>
                              <i className="fa-solid fa-play"></i>
                            </Link>
                          </div> */}
                                </div>
                              </div>
                              <div className="col-md-1 col-lg-2 col-xxl-2"></div>
                              <div className="col-md-6 col-lg-6 col-xxl-6 mt-5 mt-md-0">
                                <div className="tab-block">
                                  {/* <h4 className="tab-title text-capitalize mb-0 mb-3">
                              {title}
                            </h4> */}
                                  <div className="tab-bottom-bordered border-0 trending-custom-tab">
                                    <Tab.Container
                                      id="left-tabs-example"
                                      defaultActiveKey="1season"
                                    >
                                      <Nav
                                        variant="pills"
                                        className="nav nav-tabs nav-pills mb-3 overflow-x-scroll"
                                      >
                                        <Nav.Item key={"nav1"}>
                                          <Nav.Link eventKey={"1season"}>
                                            ALL EPISODES
                                          </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item key={"nav2"}>
                                          <Nav.Link eventKey={"2season"}>
                                            OST
                                          </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item key={"nav3"}>
                                          <Nav.Link eventKey={"3season"}>
                                            PROMO
                                          </Nav.Link>
                                        </Nav.Item>
                                      </Nav>
                                      <Tab.Content className="tab-content trending-content">
                                        <Tab.Pane
                                          eventKey={"1season"}
                                          key={"nav1"}
                                        >
                                          {videos
                                            ? videos.list.map(
                                                (episode, index) => (
                                                  <ul className="list-inline m-0 p-0 my-2">
                                                    <li
                                                      className="d-flex align-items-center gap-3"
                                                      key={episode.title + "ep"}
                                                    >
                                                      <div className="image-box flex-shrink-0 ">
                                                        <Link
                                                          to={
                                                            "/video/2/" +
                                                            episode.id +
                                                            "/" +
                                                            series
                                                          }
                                                        >
                                                          <img
                                                            src={
                                                              episode.thumbnail_480_url
                                                            }
                                                            alt="image-icon"
                                                            className="img-fluid rounded"
                                                          />
                                                        </Link>
                                                      </div>
                                                      <div className="image-details">
                                                        <Link
                                                          to={
                                                            "/video/2/" +
                                                            episode.id +
                                                            "/" +
                                                            series
                                                          }
                                                        >
                                                          <h6 className="mb-1 text-capitalize">
                                                            <span className="text-primary">
                                                              EP {index + 1}
                                                            </span>{" "}
                                                            - {episode.title}
                                                          </h6>
                                                        </Link>
                                                        {/* <small>{episode.duration} minute</small> */}
                                                        <small>
                                                          {Math.round(
                                                            episode.duration /
                                                              60,
                                                          )}{" "}
                                                          minutes
                                                        </small>
                                                      </div>
                                                    </li>
                                                  </ul>
                                                ),
                                              )
                                            : null}
                                        </Tab.Pane>
                                        <Tab.Pane
                                          eventKey={"2season"}
                                          key={"nav2"}
                                        >
                                          <p>TODO</p>
                                        </Tab.Pane>
                                        <Tab.Pane
                                          eventKey={"3season"}
                                          key={"nav3"}
                                        >
                                          <p>TODO</p>
                                        </Tab.Pane>
                                      </Tab.Content>
                                    </Tab.Container>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </>
      )}
    </Fragment>
  );
});

export default Series;
