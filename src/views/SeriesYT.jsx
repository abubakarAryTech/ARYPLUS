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
import logger from '../services/logger';

import { getConfig } from "../../config.js";
import api from "../services/api";

const SeriesYT = memo(() => {
  const config = getConfig();
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
  const [episode1, setEpisode1] = useState(null);
  const seasonRef = useRef(null);
  const [MoreLikeThis, setMoreLikeThis] = useState(null);
  const [seriesType, setSeriesType] = useState(null);
  const [nextPageToken, setNextPageToken] = useState("");
  const [prevPageToken, setPrevPageToken] = useState("");
  const [platform, setPlatform] = useState(null);
  const currentURL = window.location.href;
  const [hasError, setHasError] = useState(false);
  const dimension = window.innerWidth;

  // const YOUTUBE_API_KEY = 'AIzaSyDJraNMuVIoIVQWVnrejH6-OzoEEYNtFls'
  const YOUTUBE_API_KEY = `${config.appYtApiKey}`;

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

        setSeries(seriesResult.seriesYT);
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
        setGenre(seriesResult.genreId);
        setGenreID(seriesResult.genreId[0]._id);
        setSeriesType(seriesResult.seriesType);
        fetchVideos(seriesResult.seriesYT, "");
        setPlatform(seriesResult.isDM ? "v2" : "v1");

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

  const fetchVideos = (seriesYT, page) => {
    // setisloading(true);
    api.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${seriesYT}&key=${YOUTUBE_API_KEY}&maxResults=10&pageToken=${page}`,
    ).then((resp) => {
      let result1 = resp.data;
      const ep_keywords = ["ep 1", "episode 1", "ep1", "episode1"];
      const promo_keywords = ["promo", "ost", "teaser", "starting"];
      // Check if the first item's title contains any episode keywords
      let firstItem = result1.items[0];
      setEpisode1(firstItem.contentDetails.videoId);
      let title = firstItem.snippet.title.toLowerCase();
      let containsEpKeyword = ep_keywords.some((keyword) =>
        title.includes(keyword)
      );
      if (!containsEpKeyword) {
        result1 = { ...result1, list: result1.items };
      }

      firstItem = result1.items[0];
      title = firstItem.snippet.title.toLowerCase();
      const containsPromoKeyword = promo_keywords.some((keyword) =>
        title.includes(keyword)
      );

      if (containsPromoKeyword) {
        result1.items.shift(); // Remove the first item from the list
      }

      if (result1.nextPageToken) {
        setNextPageToken(result1.nextPageToken);
      } else {
        setNextPageToken("");
      }

      if (result1.prevPageToken) {
        setPrevPageToken(result1.prevPageToken);
      } else {
        setPrevPageToken("");
      }

      setVideos(result1);
      setTotalPages(result1.pageInfo.totalResults / 10); // Assuming the API provides this information
      setisloading(false);
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
          <meta name="description" content={`${description}`} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={title} data-react-helmet="true" />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={currentURL} />
          <meta
            property="og:site_name"
            content={title}
            data-react-helmet="true"
          />
          <meta
            property="article:publisher"
            content="https://www.facebook.com/aryzappk"
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
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:creator" content="@aryzapofficial" />
          <meta name="twitter:site" content="@aryzapofficial" />
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
              series={seriesid}
              type={1}
              genre={genreID}
              seriesId={seriesid}
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
                                        {seriesType === "show" ? (
                                          <Nav.Link eventKey={"1season"}>
                                            ALL EPISODES
                                          </Nav.Link>
                                        ) : (
                                          <Nav.Link eventKey={"1season"}>
                                            ALL VIDEOS
                                          </Nav.Link>
                                        )}
                                      </Nav.Item>
                                    </Nav>
                                    <Tab.Content className="tab-content trending-content">
                                      <Tab.Pane
                                        eventKey={"1season"}
                                        key={"nav1"}
                                      >
                                        {videos
                                          ? videos.items.map(
                                              (episode, index) => (
                                                <>
                                                  {episode.snippet.title !==
                                                    "Private video" &&
                                                  episode.snippet.title !==
                                                    "Deleted video" ? (
                                                    <>
                                                      <ul
                                                        className="list-inline m-0 p-0 my-2"
                                                        key={
                                                          episode.snippet
                                                            .title + "ep"
                                                        }
                                                      >
                                                        <li className="d-flex align-items-center justify-content-between bg-li-series mt-2 px-2 py-2">
                                                          <div className="d-flex align-items-center gap-3">
                                                            <div className="image-box flex-shrink-0">
                                                              <Link
                                                                to={
                                                                  "/video/1/" +
                                                                  episode
                                                                    .contentDetails
                                                                    .videoId +
                                                                  "/" +
                                                                  seriesid
                                                                }
                                                              >
                                                                <img
                                                                  src={
                                                                    episode
                                                                      .snippet
                                                                      .thumbnails
                                                                      .medium
                                                                      .url
                                                                  }
                                                                  alt="image-icon"
                                                                  className="img-fluid rounded"
                                                                />
                                                              </Link>
                                                            </div>
                                                            <div className="image-details">
                                                              <Link
                                                                to={
                                                                  "/video/1/" +
                                                                  episode
                                                                    .contentDetails
                                                                    .videoId +
                                                                  "/" +
                                                                  seriesid
                                                                }
                                                              >
                                                                <h6 className="mb-1 text-capitalize">
                                                                  {
                                                                    episode
                                                                      .snippet
                                                                      .title
                                                                  }
                                                                </h6>
                                                              </Link>
                                                              {/* <small><i className="fa-solid fa-clock"></i> {Math.round(episode.duration / 60)} minutes</small>
                                                    <small className="m-2">
                                                      <i className="fa-solid fa-eye"></i> {formatViews(Math.round(episode.views_total))}
                                                    </small> */}
                                                            </div>
                                                          </div>
                                                          <div
                                                            className="iq-button"
                                                            data-animation-in="fadeInUp"
                                                            data-delay-in="1.2"
                                                          >
                                                            <Link
                                                              to={
                                                                "/video/1/" +
                                                                episode
                                                                  .contentDetails
                                                                  .videoId +
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
                                                    </>
                                                  ) : null}
                                                </>
                                              ),
                                            )
                                          : null}
                                        <div className="pagination d-flex align-items-center justify-content-center mt-2 px-2 py-2">
                                          <Button
                                            className="mx-2 py-2"
                                            onClick={() =>
                                              handlePageChange(prevPageToken)
                                            }
                                            disabled={prevPageToken == ""}
                                          >
                                            Previous
                                          </Button>
                                          {/* <span>Page {page} of {totalPages}</span> */}
                                          <Button
                                            className="mx-2 py-2"
                                            onClick={() =>
                                              handlePageChange(nextPageToken)
                                            }
                                            disabled={nextPageToken == ""}
                                          >
                                            Next
                                          </Button>
                                        </div>
                                      </Tab.Pane>
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
                      cast={cast}
                      poster={poster}
                      genre={genre}
                      type={seriesType}
                    />
                  </Col>
                </Row>

                {seriesType && seriesType === "show" ? (
                  <div className="card-style-grid">
                    <h4>More like this</h4>
                    <Row className="row row-cols-xl-6 row-cols-md-6 row-cols-2 widgetBox">
                      {isloading ? (
                        <p>Loading...</p>
                      ) : (
                        MoreLikeThis?.series
                          ?.filter(
                            (item) => item.seriesType !== "single-series",
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
                                        : `/series/${platform}/${item._id}`
                                }
                              />
                            </Col>
                          ))
                      )}
                    </Row>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
});

export default SeriesYT;
