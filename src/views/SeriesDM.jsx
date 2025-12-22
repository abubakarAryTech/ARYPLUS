import React, { Fragment, memo, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
//react bootstrap
import { Col, Container, Row, Nav, Tab, Button } from "react-bootstrap";
import CardStyle from "../components/cards/CardStyle";
import { Link } from "react-router-dom";
import { useEnterExit } from "../utilities/usePage";
import Loader from "../components/ReactLoader";
import VideoHeroSliderNew from "../components/slider/VideoHeroSliderNew";
import SeriesSidebar from "./SeriesSidebar";
import { Helmet } from "react-helmet";
import BlankSpace from "../components/BlankSpace";
import LeaderboardInner from "../Ads/LeaderboardInner";
import MrecInner from "../Ads/MrecInner";
import ErrorPage2 from "../views/ExtraPages/ErrorPage2";
import Series from "./Series_old";
import api from "../services/api";
import logger from '../services/logger';

const SeriesDM = memo(() => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [videos, setVideos] = useState(null);
  const [page, setPage] = useState(1); // current page
  const [totalPages, setTotalPages] = useState(1); // total pages
  const { seriesid } = useParams();
  useEnterExit();
  const [series, setSeries] = useState(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [poster, setPoster] = useState(null);
  const [genre, setGenre] = useState(null);
  const [genreID, setGenreID] = useState(null);
  const [description, setDescription] = useState(null);
  const [cast, setCast] = useState(null);
  const [ost, setOst] = useState(null);
  const [promo, setPromo] = useState(null);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [logo, setLogo] = useState(null);
  const [isloading, setisloading] = useState(false);
  const [videosloading, setVideosloading] = useState(false);
  const [episode1, setEpisode1] = useState(null);
  const seasonRef = useRef(null);
  const [MoreLikeThis, setMoreLikeThis] = useState(null);
  const [seriesType, setSeriesType] = useState(null);
  const currentURL = window.location.href;
  const [hasError, setHasError] = useState(false);
  const dimension = window.innerWidth;

  function formatViews(views) {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1).replace(/\.0$/, "") + "M"; // Format to millions
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1).replace(/\.0$/, "") + "k"; // Format to thousands
    }
    return views; // Return as is if less than 1000
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setisloading(true);

        // Fetch series data
        const seriesResponse = await api.get(
          `/api/series/${seriesid}`,
        );
        const seriesResult = seriesResponse.data;

        if (seriesResult?.message?.name === "CastError") {
          setHasError(true);
        }

        setSeries(seriesResult.seriesDM);
        setTitle(seriesResult.title);
        if (dimension < 768) {
          setImage(seriesResult.imageCoverMobile);
        } else {
          setImage(seriesResult.imageCoverDesktop);
        }
        // setImage(seriesResult.imageCoverDesktop);
        setDescription(seriesResult.description);
        setCast(seriesResult.cast);
        setOst(seriesResult.ost);
        setPromo(seriesResult.trailer);
        setDay(seriesResult.day);
        setTime(seriesResult.time);
        setLogo(seriesResult.logo);
        setPoster(seriesResult.imagePoster);
        setGenre(seriesResult);
        setGenreID(seriesResult.genreId[0]._id);
        setSeriesType(seriesResult.seriesType);
        // alert(seriesResult.seriesType);
        fetchVideos(seriesResult.seriesDM, 1);

        // alert(seriesResult.ost);

        // Fetch genres data
        const genreId = seriesResult.genreId[0]._id;
        const genresResponse = await api.get(
          `/api/genres/genreid/${genreId}`,
        );
        const genresResult = genresResponse.data;

        setMoreLikeThis(genresResult);
      } catch (error) {
        logger.error("Data fetch failed:", error);
      } finally {
        setisloading(false);
      }
    };

    fetchData();
  }, [seriesid]);

  const fetchVideos = (seriesDM, page) => {
    setVideosloading(true);
    api.get(
      `https://api.dailymotion.com/playlist/${seriesDM}/videos?fields=thumbnail_480_url,title,id,views_total,duration,owner.screenname,owner&limit=10&page=${page}`,
    ).then((resp) => {
      let result1 = resp.data;
        const ep_keywords = ["ep 1", "episode 1", "ep1", "episode1"];
        const promo_keywords = ["promo", "ost", "teaser", "starting"];
        // Check if the first item's title contains any episode keywords
        let firstItem = result1.list[0];
        setEpisode1(firstItem.id);
        let title = firstItem.title.toLowerCase();
        let containsEpKeyword = ep_keywords.some((keyword) =>
          title.includes(keyword),
        );
        if (!containsEpKeyword) {
          result1 = { ...result1, list: result1.list };
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
        setTotalPages(result1.total / 10); // Assuming the API provides this information
        setisloading(false);
        setVideosloading(false);
      });
    };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchVideos(series, newPage);

    // Scroll to the specific tab
    if (seasonRef.current) {
      seasonRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  var nf = new Intl.NumberFormat();

  if (hasError) {
    return <ErrorPage2 />; // Render the error page if there's an error
  }

  return (
    <Fragment>
      {isloading == false ? (
        <Helmet>
          <title>{`${title}`}</title>
          <link rel="canonical" href={currentURL} data-react-helmet="true" />
          <meta
            name="description"
            content={`${description}`}
            data-react-helmet="true"
          />
          <meta property="og:type" content="article" data-react-helmet="true" />
          <meta property="og:title" content={title} data-react-helmet="true" />
          <meta
            property="og:description"
            content={`Watch ${title} now! on ARY PLUS`}
            data-react-helmet="true"
          />
          <meta
            property="og:url"
            content={currentURL}
            data-react-helmet="true"
          />
          <meta
            property="og:site_name"
            content={title}
            data-react-helmet="true"
          />
          <meta
            property="article:publisher"
            content="https://www.facebook.com/aryzappk"
            data-react-helmet="true"
          />
          <meta
            property="article:published_time"
            content={new Date().toLocaleString()}
          />
          <meta
            property="article:modified_time"
            content={new Date().toLocaleString()}
          />
          <meta
            property="og:image"
            content={`${import.meta.env.VITE_APP_IMAGE_PATH}` + image}
            data-react-helmet="true"
          />
          <meta property="og:image:width" content="1280" />
          <meta property="og:image:height" content="720" />
          {/* <meta property="fb:app_id" content="375569812886822" /> */}
          <meta
            name="twitter:card"
            content="summary"
            data-react-helmet="true"
          />
          <meta name="twitter:title" content={title} data-react-helmet="true" />

          <meta
            name="twitter:description"
            content={`Watch ${title} now on ARY PLUS!`}
            data-react-helmet="true"
          />
          <meta
            name="twitter:creator"
            content="@aryzapofficial"
            data-react-helmet="true"
          />
          <meta
            name="twitter:site"
            content="@aryzapofficial"
            data-react-helmet="true"
          />
          <meta
            name="twitter:image"
            content={`${import.meta.env.VITE_APP_IMAGE_PATH}` + image}
            data-react-helmet="true"
          />
        </Helmet>
      ) : null}
      {isloading ? (
        <>
          <Loader />
          <BlankSpace />
        </>
      ) : (
        <>
          {genreID && (
            <VideoHeroSliderNew
              title={title}
              image={image}
              description={description}
              ost={ost}
              promo={promo}
              day={day}
              time={time}
              cast={cast}
              firstEpisode={episode1}
              series={series}
              seriesType={seriesType}
              genre={genreID}
              seriesId={seriesid}
              type={2}
            />
          )}

          <div className="mlr-40">
            <LeaderboardInner />
            <div>
              <div className="content-details iq-custom-tab-style-two">
                <Row className="">
                  <Col lg="9" md="9" className="" ref={seasonRef}>
                    <div className="overflow-hidden animated fadeInUp widget">
                      <div className="block-images position-relative w-100">
                        <div className="">
                          <div className="row align-items-center my-4">
                            <div className="col-md-12 col-lg-12 col-xxl-12 mt-5 mt-md-0 mt-remove">
                              <div className="tab-block">
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
                                      {/* <Nav.Item key={"nav2"}>
                                        <Nav.Link eventKey={"2season"}>OST</Nav.Link>
                                      </Nav.Item>
                                      <Nav.Item key={"nav3"}>
                                        <Nav.Link eventKey={"3season"}>PROMO</Nav.Link>
                                      </Nav.Item> */}
                                    </Nav>
                                    <Tab.Content className="tab-content trending-content">
                                      {/* {!videosloading ? (
                                        <p>Loading...</p>
                                      ) : ( */}
                                      <Tab.Pane
                                        eventKey={"1season"}
                                        key={"nav1"}
                                      >
                                        {videos
                                          ? videos.list
                                              // Sort by title in ascending order, assuming titles are numeric
                                              .map((episode, index) => (
                                                <ul
                                                  className="list-inline m-0 p-0 my-2"
                                                  key={episode.title + "ep"}
                                                >
                                                  <li className="d-flex align-items-center justify-content-between bg-li-series mt-2 px-2 py-2">
                                                    <div className="d-flex align-items-center gap-3">
                                                      <div className="image-box flex-shrink-0">
                                                        <Link
                                                          to={
                                                            "/video/2/" +
                                                            episode.id +
                                                            "/" +
                                                            seriesid
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
                                                            seriesid
                                                          }
                                                        >
                                                          <h6 className="mb-1 text-capitalize">
                                                            {episode.title}
                                                          </h6>
                                                        </Link>
                                                        <small>
                                                          <i className="fa-solid fa-clock"></i>{" "}
                                                          {Math.round(
                                                            episode.duration /
                                                              60,
                                                          )}{" "}
                                                          minutes
                                                        </small>
                                                        <small className="m-2">
                                                          <i className="fa-solid fa-eye"></i>{" "}
                                                          {formatViews(
                                                            Math.round(
                                                              episode.views_total,
                                                            ),
                                                          )}
                                                        </small>
                                                      </div>
                                                    </div>
                                                    <div
                                                      className="iq-button"
                                                      data-animation-in="fadeInUp"
                                                      data-delay-in="1.2"
                                                    >
                                                      <Link
                                                        to={
                                                          "/video/2/" +
                                                          episode.id +
                                                          "/" +
                                                          seriesid
                                                        }
                                                        className="btn text-uppercase position-relative"
                                                      >
                                                        <span className="button-text">
                                                          Play Now
                                                        </span>
                                                        <i className="fa-solid fa-play"></i>
                                                      </Link>
                                                    </div>
                                                  </li>
                                                </ul>
                                              ))
                                          : null}
                                        <div className="pagination d-flex align-items-center justify-content-center mt-2 px-2 py-2">
                                          <Button
                                            className="mx-2 py-2"
                                            onClick={() =>
                                              handlePageChange(page - 1)
                                            }
                                            disabled={page <= 1}
                                          >
                                            Previous
                                          </Button>
                                          {/* <span>Page {page} of {totalPages}</span> */}
                                          <Button
                                            className="mx-2 py-2"
                                            onClick={() =>
                                              handlePageChange(page + 1)
                                            }
                                            disabled={page > totalPages}
                                          >
                                            Next
                                          </Button>
                                        </div>
                                      </Tab.Pane>
                                      {/* )} */}
                                      {/* <Tab.Pane eventKey={"2season"} key={"nav2"}>
                               
                                              <ul className="list-inline m-0 p-0 my-2">
                                                <li className="d-flex align-items-center justify-content-between bg-li-series mt-2 px-2 py-2">
                                                  <div className="d-flex align-items-center gap-3">
                                                    <div className="image-box flex-shrink-0">
                                                      <Link to={"/video/1/" + seriesid}>
                                                        <img src={image} alt="image-icon" className="img-fluid rounded" />
                                                      </Link>
                                                    </div>
                                                    <div className="image-details">
                                                      <Link to={"/video/1/" + seriesid}>
                                                        <h6 className="mb-1 text-capitalize">{title}</h6>
                                                      </Link>
                                                      <small>{Math.round(episode.duration / 60)} minutes</small>
                                                    </div>
                                                  </div>
                                                  <div className="iq-button" data-animation-in="fadeInUp" data-delay-in="1.2">
                                                    <Link to={"/video/1/" + seriesid} className="btn text-uppercase position-relative">
                                                      <span className="button-text">Play Now</span>
                                                      <i className="fa-solid fa-play"></i>
                                                    </Link>
                                                  </div>
                                                </li>
                                              </ul>
                                           
                                      </Tab.Pane> */}

                                      {/* <Tab.Pane eventKey={"3season"} key={"nav3"}>
                                        {videos && videos.list ? (
                                          videos.list.filter(episode => episode.title.includes("promo")).length > 0 ? (
                                            videos.list.filter(episode => episode.title.includes("promo")).map((episode, index) => (
                                              <ul className="list-inline m-0 p-0 my-2" key={episode.title + "ep"}>
                                                <li className="d-flex align-items-center justify-content-between bg-li-series mt-2 px-2 py-2">
                                                  <div className="d-flex align-items-center gap-3">
                                                    <div className="image-box flex-shrink-0">
                                                      <Link to={"/video/2/" + episode.id + "/" + series}>
                                                        <img src={episode.thumbnail_480_url} alt="image-icon" className="img-fluid rounded" />
                                                      </Link>
                                                    </div>
                                                    <div className="image-details">
                                                      <Link to={"/video/2/" + episode.id + "/" + series}>
                                                        <h6 className="mb-1 text-capitalize">{episode.title}</h6>
                                                      </Link>
                                                      <small>{Math.round(episode.duration / 60)} minutes</small>
                                                    </div>
                                                  </div>
                                                  <div className="iq-button" data-animation-in="fadeInUp" data-delay-in="1.2">
                                                    <Link to={"/video/2/" + episode.id + "/" + series} className="btn text-uppercase position-relative">
                                                      <span className="button-text">Play Now</span>
                                                      <i className="fa-solid fa-play"></i>
                                                    </Link>
                                                  </div>
                                                </li>
                                              </ul>
                                            ))
                                          ) : (
                                            <p>No videos found for this.</p>
                                          )
                                        ) : (
                                          null
                                        )}
                                      </Tab.Pane> */}
                                    </Tab.Content>
                                  </Tab.Container>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg="3" md="3" className="">
                    <MrecInner />
                    <SeriesSidebar
                      seriesId={seriesid}
                      cast={cast}
                      poster={poster}
                      genre={genre}
                      type={seriesType}
                    />
                  </Col>
                </Row>

                <div className="card-style-grid">
                  <h4>More like this</h4>
                  <Row className="row row-cols-xl-6 row-cols-md-6 row-cols-2 widgetBox">
                    {isloading ? (
                      <p>Loading...</p>
                    ) : (
                      MoreLikeThis?.series
                        ?.filter(
                          (item) =>
                            item.seriesType !== "single-series" &&
                            item.seriesType !== "live-event",
                        )
                        .slice(0, 12)
                        .map((item, index) => (
                          <Col key={index} className="mb-2 c-padding">
                            <CardStyle
                              image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePoster}`}
                              link={
                                item.seriesType === "live"
                                  ? `/live/${item.ost}/${item._id}`
                                  : item.seriesType === "singleVideo"
                                    ? `/watch/${item.seriesLayout}/${item._id}`
                                    : item.seriesType === "live-event"
                                      ? `/live-event/${item.ost}/${item._id}`
                                      : `/series/v2/${item._id}`
                              }
                            />
                          </Col>
                        ))
                    )}
                  </Row>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
});

export default SeriesDM;
