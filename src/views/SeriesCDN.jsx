import React, {
  Fragment,
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
//react bootstrap
import {
  Col,
  Container,
  Row,
  Nav,
  Tab,
  Button,
  ProgressBar,
} from "react-bootstrap";
import CardStyle from "../components/cards/CardStyle";
import { Link } from "react-router-dom";
import { formatDuration, toTitleCase, useEnterExit } from "../utilities/usePage";
import Loader from "../components/ReactLoader";
import VideoHeroSliderNew from "../components/slider/VideoHeroSliderNew";
import SeriesSidebar from "./SeriesSidebar";
import { Helmet } from "react-helmet";
import BlankSpace from "../components/BlankSpace";
import LeaderboardInner from "../Ads/LeaderboardInner";
import MrecInner from "../Ads/MrecInner";
import ErrorPage2 from "../views/ExtraPages/ErrorPage2";
import Cookies from "universal-cookie";
import logger from '../services/logger';

import { getConfig } from "../../config.js";
import { fetchLocation } from "../utilities/locationManager";
import api from "../services/api";
import { useAuthStore } from "../stores/useAuthStore";
import { useWatchlist } from "../hooks/useWatchlist";
import CardStyleHover from "../components/cards/CardStyleHover.jsx";
// import VideoPlayer from "../components/videoPlayer.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import toast from "react-hot-toast";


import { FaVolumeMute, FaVolumeUp, FaLock } from "react-icons/fa";
import { isTvodEnabled } from "../utilities/tvodHelper.js";


const SeriesCDN = memo(() => {
  const config = getConfig();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [videos, setVideos] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { seriesid } = useParams();
  useEnterExit();
  const [series, setSeries] = useState(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [poster, setPoster] = useState(null);
  const [genre, setGenre] = useState(null);
  const [genreID, setGenreID] = useState(null);
  const [description, setDescription] = useState(null);
  const [releaseDate, setReleaseDate] = useState(null);
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
  const [duration, setDuration] = useState(null);
  const [nextPageToken, setNextPageToken] = useState("");
  const [prevPageToken, setPrevPageToken] = useState("");
  const [platform, setPlatform] = useState(null);
  const currentURL = window.location.href;
  const [hasError, setHasError] = useState(false);
  const [episodeCount, setEpisodeCount] = useState(false);
  const [seriesId, setSeriesId] = useState(false);
  const cookies = new Cookies();
  const dimension = window.innerWidth;
  const user = useAuthStore((state) => state.user);
  const updateUserSubscriptionData = useAuthStore((state) => state.updateUserSubscriptionData);
  const [progressMap, setProgressMap] = useState({});
  const { isFavorite } = useWatchlist();
  const tvodEnabled = isTvodEnabled();
  
  const [location, setLocation] = useState(null);

  const YOUTUBE_API_KEY = `${config.appYtApiKey}`;

  const loadLocation = useCallback(async () => {
    const countryCode = await fetchLocation();
    setLocation(countryCode);
  }, []);


  //Set PackageIds array
  // const [packageIds, setPackagesId] = useState();

  // const [packageData, setPackageData] = useState();
  const [packageIds, setPackageIds] = useState(null);
  const [packageData, setPackageData] = useState(null);

  const [isPackagesLoading, setIsPackagesLoading] = useState(false);



  useEffect(() => {
    let isMounted = true; // 🛠️

    const fetchData = async () => {
      try {
        setisloading(true);
        const seriesResponse = await api.get(
          `${config.appApiHomeEndpoint}/api/series/${seriesid}`,
        ); // 🛠️
        if (seriesResponse.data?.message) setHasError(true);
        if (!isMounted) return; // 🛠️

        setSeries(seriesResponse.data.seriesYT);
        setTitle(seriesResponse.data.title);
        setImage(
          dimension < 768
            ? seriesResponse.data.imageCoverMobile
            : seriesResponse.data.imageCoverDesktop,
        ); // 🛠️
        setSeriesId(seriesResponse.data._id);
        setDescription(seriesResponse.data.description);
        setReleaseDate(seriesResponse.data.releaseDate);
        setCast(seriesResponse.data.cast);
        setDuration(seriesResponse.data.duration);
        setEpisodeCount(seriesResponse.data.episodeCount);
        setOst(seriesResponse.data.ost);
        setPromo(seriesResponse.data.trailer);
        setDay(seriesResponse.data.day);
        setTime(seriesResponse.data.time);
        setLogo(seriesResponse.data.logo);
        setPoster(seriesResponse.data.imagePoster);
        setGenre(seriesResponse.data.genreId);
        setGenreID(seriesResponse.data.genreId[0]._id);
        setSeriesType(seriesResponse.data.seriesType);
        fetchVideos(seriesResponse.data.seriesYT, "");
        setPlatform(seriesResponse.data.isDM ? "v2" : "v1");

        const ids = seriesResponse.data.packageIds ?? null;
        setPackageIds(ids);
        // optionally clear previous data if IDs changed
        setPackageData(null);
        const genreId = seriesResponse.data.genreId[0]._id;
        const genresResponse = await api.get(
          `${config.appApiHomeEndpoint}/api/genres/genreid/${genreId}`
        );
        if (genresResponse.data?.message) throw new Error("Failed to fetch genre data");
        setMoreLikeThis(genresResponse.data);

        // Fetch location
        await loadLocation();

      } catch (error) {
        if (error.response?.status === 404) {
          navigate("/404");
          return;
        }
        logger.error("Data fetch failed:", error);
      } finally {
        if (isMounted) setisloading(false); // 🛠️
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    }; // 🛠️
  }, [seriesid]);

  // fetch package details when packageIds changes
  useEffect(() => {
    let isMounted = true;

    const fetchPackages = async () => {
      if (!packageIds || packageIds.length === 0) {
        return;
      }
      try {
        setIsPackagesLoading(true);
        const requests = packageIds.map((id) =>
          api.get(`${config.appApiHomeEndpoint}/api/packages/${id}`)
        );
        const responses = await Promise.all(requests);
        if (!isMounted) return;

        setPackageData(responses.map((r) => r.data));
      } catch (e) {
        logger.error("Error fetching package data: ", e);
        if (isMounted) setPackageData([]); // fail-safe to avoid hanging UI
      } finally {

        if (isMounted) setIsPackagesLoading(false);
      }
    };

    fetchPackages();
    return () => { isMounted = false; };
  }, [packageIds]);


  useEffect(() => {
    if (user) {
      fetchProgress(seriesid, user);
    }
  }, [seriesid, user]);
  
  // Separate effect for subscription refresh to avoid loops
  useEffect(() => {
    if (user?.uid) {
      updateUserSubscriptionData();
    }
  }, [user?.uid]);

  const fetchVideos = (seriesYT, page) => {
    setisloading(true);
    api.get(`${config.appApiHomeEndpoint}/api/cdn/${seriesid}`) // 🛠️
      .then((resp) => {
        if (resp.data?.message) throw new Error("Failed to fetch videos"); // 🛠️
        setVideos(resp.data);
        setEpisode1(resp.data.episode[0]._id);
        // logger.warn(videos); ← removed stale logging // 🛠️
        setisloading(false);
      })
      .catch((err) => {
        logger.error("Error fetching videos", err); // 🛠️
        setisloading(false);
      });
  };

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const paddedMins = mins.toString().padStart(2, "0");
    const paddedSecs = secs.toString().padStart(2, "0");
    return hrs === 0
      ? `${paddedMins}:${paddedSecs}`
      : `${hrs.toString().padStart(2, "0")}:${paddedMins}:${paddedSecs}`;
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchVideos(series, newPage);
    if (seasonRef.current) {
      seasonRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  var nf = new Intl.NumberFormat();

  const fetchProgress = async (seriesId, currentUser) => {
    try {
      const response = await api.get(
        `${config.appApiHomeEndpoint}/api/v2/watch-history/by-user-series/${currentUser.uid}/${seriesId}`
      );

      const data = response.data;
      const progress = {};
      data.forEach((entry) => {
        if (entry?.episodeId && entry?.currentTime != null) {
          progress[entry.episodeId] = entry.currentTime;
        }
      });

      setProgressMap(progress);
      logger.log("Video progress data retrieved:", progress);
    } catch (error) {
      logger.error("Error fetching progress data:", error);
    }
  };


  if (hasError) return <ErrorPage2 />;

  return (
    <Fragment>
      {isloading == false ? (
        <Helmet>
          <title>{`${toTitleCase(title)}`}</title>
          {/* <meta name="description" content={`${description}`} /> */}
          <meta
            name="description"
            content={description?.replace(/<\/?[^>]+(>|$)/g, "")}
          />{" "}
          {/* 🛠️ */}
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
          {genreID && !isPackagesLoading && (
            <VideoHeroSliderNew
              title={title}
              logo={logo}
              releaseDate={releaseDate}
              duration={duration}
              episodeCount={episodeCount}
              image={image}
              description={description}
              ost={ost}
              promo={promo}
              day={day}
              time={time}
              cast={cast}
              firstEpisode={episode1}
              seriesId={seriesid}
              type={3}
              genre={genreID}
              allGenre={genre}
              seriesType={seriesType}
              packageIds={packageIds}
              packageData={packageData}
              isFavorite={isFavorite(seriesId)}
              location={location}
            />
          )}
          <div className="mlr-40">
            <LeaderboardInner />
            <div>
              <div className="content-details iq-custom-tab-style-two">
                <Row className="">
                  <Col lg="12" md="12" className="" ref={seasonRef}>
                    <div className="overflow-hidden animated fadeInUp">
                      <div className="block-images position-relative w-100">
                        <div className="">
                          <div className="row align-items-center my-4">
                            <div className="col-md-12 col-lg-12 col-xxl-12 mt-5 mt-md-0 mt-remove">
                              <div className="tab-block bg-transparent">
                                <div className="tab-bottom-bordered border-0 trending-custom-tab">
                                  {/* {seriesType === "live-event" ? ( */}
                                  {
                                    seriesType === "live-event" || seriesType === "live" || seriesType === "singleVideo"  ? (
                                    // 🔴 LIVE-EVENT: show only "More Info" content (no tabs)
                                     <Tab.Container
                                      id="left-tabs-example"
                                      defaultActiveKey="related"
                                    >
                                      <Nav
                                        variant="pills"
                                        className="nav nav-tabs nav-pills mb-3 overflow-x-scroll border-0"
                                      >                                        

                                        <Nav.Item key={"nav2"}>
                                          <Nav.Link eventKey={"related"}>
                                            Related
                                          </Nav.Link>
                                        </Nav.Item>

                                        <Nav.Item key={"nav3"}>
                                          <Nav.Link eventKey={"more"}>
                                            More Info
                                          </Nav.Link>
                                        </Nav.Item>
                                      </Nav>
                                      <Tab.Content className="tab-content trending-content ">
                                        <Tab.Pane
                                          eventKey={"related"}
                                          key={"nav2"}
                                        >
                                          {(seriesType === "show" || seriesType === "programs" || seriesType === "singleVideo" || seriesType === "live") ? (
                                            <div className="card-style-grid">
                                              {/* <h4>More like this</h4> */}
                                              <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2 mb-5">
                                                {isloading ? (
                                                  <p>Loading...</p>
                                                ) : (
                                                  MoreLikeThis?.series
                                                    ?.filter(
                                                      (item) =>
                                                        item._id !== seriesId,
                                                    ) // Skip matching seriesId
                                                    .slice(0, 12)
                                                    .map((item, index) => (
                                                      <Col
                                                        key={index}
                                                        className="mb-2 c-padding"
                                                      >
                                                        <CardStyleHover
                                                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                                                          seriesType={
                                                            item.seriesType
                                                          }
                                                          id={item._id}
                                                          title={item.title}
                                                          isFavorite={isFavorite(item._id)}
                                                          name={item.name}
                                                          episodeCount={
                                                            item.episodeCount
                                                          }
                                                          // genres={[
                                                          //   "Romance",
                                                          //   "Drama",
                                                          // ]}
                                                          genres={item?.genresList?.filter(
                                                            (genre) => genre.toLowerCase() !== "telefilms",
                                                          )}
                                                          // genres={item.genreId.filter(
                                                          //   (genre) => genre.toLowerCase() !== "telefilms",
                                                          // )}
                                                          ageRating={
                                                            item.ageRating
                                                          }
                                                          link={
                                                            item.seriesType ===
                                                              "live"
                                                              ? `/live/${item.ost}/${item._id}`
                                                              : item.seriesType ===
                                                                "singleVideo"
                                                                ? `/watch/${item.seriesLayout}/${item._id}`
                                                                : item.seriesType ===
                                                                  "live-event"
                                                                  ? `/live-event/${item.ost}/${item._id}`
                                                                  : `/series/v3/${item._id}`
                                                          }
                                                          trailer={item.trailer}
                                                          duration={formatDuration(item.duration)}
                                                          packageInfo={item.packageIds}
                                                        />
                                                        {/* <CardStyleHover
                                                        image={image}
                                                        seriesType={data.seriesType}
                                                        id={data._id}
                                                        title={data.title}
                                                        watchlistLink="/playlist"
                                                        link={commonLink}
                                                        isFavorite={favorites.some(
                                                          (fav) => fav.seriesId?._id === data._id,
                                                        )}
                                                        name={item.name}
                                                        episodeCount={data.episodeCount}
                                                        // genres={data.genreId}

                                                        genres={data.genreId.filter(
                                                          (genre) => genre.toLowerCase() !== "telefilms",
                                                        )}
                                                        ageRating={data.ageRating}
                                                        trailer={data.trailer}
                                                        duration={formatDuration(data.duration)}
                                                      /> */}
                                                      </Col>
                                                    ))
                                                )}
                                              </Row>
                                            </div>
                                          ) : null}
                                        </Tab.Pane>

                                        <Tab.Pane eventKey={"more"} key={"nav3"}>
                                          {(seriesType === "show" || seriesType === "programs" || seriesType === "singleVideo" || seriesType === "live") ? (
                                            <div className="card-style-grid">
                                              <Row className="row row-cols-1 row-cols-md-2 row-cols-xl-2">
                                                <Col className="mb-2">
                                                  <h6>Synopsis</h6>
                                                  <p className="mt-4">
                                                    {description}
                                                  </p>

                                                  <div className="video-wrapper mt-3 mb-2">
                                                    <VideoPlayer
                                                      videoUrl={promo}
                                                      showControls={true} // show controls
                                                      isMuted={false}
                                                    />
                                                  </div>
                                                </Col>
                                                <Col className="mb-2 c-padding p-3">
                                                  <h6>Actors</h6>
                                                  <div className="d-flex flex-wrap gap-2 mt-3">
                                                    {Array.isArray(cast) &&
                                                      cast.map((actor, index) => (
                                                        <div className="cast">
                                                          <Link
                                                            to={`/cast-view-all/${encodeURIComponent(actor)}`}
                                                            className="iq-view-all text-decoration-none text-light btn btn-primary  view-all-btn "
                                                          >
                                                            {actor}
                                                          </Link>
                                                        </div>
                                                      ))}
                                                  </div>
                                                </Col>
                                              </Row>
                                            </div>
                                          ) : null}
                                        </Tab.Pane>
                                      </Tab.Content>
                                    </Tab.Container>
                                  

                                  ) : (
                                    <Tab.Container
                                      id="left-tabs-example"
                                      defaultActiveKey="ep"
                                    >
                                      <Nav
                                        variant="pills"
                                        className="nav nav-tabs nav-pills mb-3 overflow-x-scroll border-0"
                                      >
                                        <Nav.Item key={"nav1"}>
                                          {seriesType === "show" ? (
                                            <Nav.Link eventKey={"ep"}>
                                              All Episodes
                                            </Nav.Link>
                                          ) : (
                                            <Nav.Link eventKey={"ep"}>
                                              All Videos
                                            </Nav.Link>
                                          )}
                                        </Nav.Item>

                                        <Nav.Item key={"nav2"}>
                                          <Nav.Link eventKey={"related"}>
                                            Related
                                          </Nav.Link>
                                        </Nav.Item>

                                        <Nav.Item key={"nav3"}>
                                          <Nav.Link eventKey={"more"}>
                                            More Info
                                          </Nav.Link>
                                        </Nav.Item>
                                      </Nav>
                                      <Tab.Content className="tab-content trending-content ">
                                        <Tab.Pane eventKey={"ep"} key={"nav1"}>
                                          {videos
                                            ? videos.episode.map(
                                              (item, index) => (
                                                // cookies.set('videoSource', item.videoSource);

                                                <Fragment key={item._id}>
                                                  {" "}
                                                  {/* 🛠️ */}
                                                  <ul
                                                    className="list-inline m-0 p-0 my-2"
                                                    key={item.title + "ep"}
                                                  >
                                                    <li className="d-flex align-items-center mt-2 px-2 py-2 episode-card">
                                                      {/* Index */}
                                                      <div className="episode-index percent-5 d-none-mobile">
                                                        <h3
                                                          className="big-font-3 letter-spacing-1 text-uppercase RightAnimate-two"
                                                          data-animation-in="fadeInLeft"
                                                          data-delay-in="0.6"
                                                        >
                                                          {item.videoEpNumber
                                                            .toString()
                                                            .padStart(2, "0")}
                                                          {/* {(index + 1).toString().padStart(2, '0')} */}
                                                        </h3>
                                                      </div>

                                                      {/* Image */}

                                                      <div className="image-box percent-20 continueWatchCard">
                                                        <div className="block-images position-relative rounded-border">
                                                          <div className="iq-image-box overly-images position-relative hover-wrapper">
                                                            <Link
                                                              // to={
                                                              //   user
                                                              //     ? `/video/v1/3/${item._id}/${seriesid}`
                                                              //     : `/login?redirect=/video/v1/3/${item._id}/${seriesid}`
                                                              // }
                                                              // to={
                                                              //   user
                                                              //     ? packageIds && packageIds.length > 0 && user.subscriptions && typeof user.subscriptions === 'object' && user.subscriptions[packageIds]?.subscription_status !== "active"
                                                              //       ? '#'
                                                              //       : `/video/v1/3/${item._id}/${seriesid}`
                                                              //     : `/login?redirect=/video/v1/3/${item._id}/${seriesid}`
                                                              // }
                                                              to={
                                                                user
                                                                  ? (
                                                                    tvodEnabled
                                                                        ? (
                                                                            packageIds &&
                                                                            packageIds.length > 0 &&
                                                                            user.subscriptions &&
                                                                            typeof user.subscriptions === 'object' &&
                                                                            user.subscriptions[packageIds]?.subscription_status !== "active"
                                                                              ? '#'
                                                                              : `/video/v1/3/${item._id}/${seriesid}`
                                                                          )
                                                                        : `/video/v1/3/${item._id}/${seriesid}`
                                                                    )
                                                                  : `/login?redirect=/video/v1/3/${item._id}/${seriesid}`
                                                              }
                                                              
                                                              // onClick={(e) => {
                                                              //   if (user && packageIds && packageIds.length > 0 && user.subscriptions[packageIds]?.subscription_status !== "active") {
                                                              //     e.preventDefault();
                                                              //     showLockedContentToast();
                                                              //   }
                                                              // }}

                                                              onClick={(e) => {
                                                                if (tvodEnabled) {
                                                                  if (
                                                                    user &&
                                                                    packageIds &&
                                                                    packageIds.length > 0 &&
                                                                    user.subscriptions &&
                                                                    typeof user.subscriptions === 'object' &&
                                                                    user.subscriptions[packageIds]?.subscription_status !== "active"
                                                                  ) {
                                                                    e.preventDefault();
                                                                    navigate(`/Tvod/${seriesid}`);
                                                                  }
                                                                }
                                                              }}
                                                              
                                                              

                                                              className="d-block"
                                                            >
                                                              <img
                                                                src={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePath}`}
                                                                alt="movie-card"
                                                                className="img-fluid object-cover w-100 d-block border-0 episodeImage"
                                                              />
                                                            </Link>

                                                            {/* Play button shown on hover */}
                                                            <div className="btn-on-hover position-absolute top-50 start-50 translate-middle">
                                                              <Link
                                                                to={
                                                                  user
                                                                    ? (
                                                                      tvodEnabled
                                                                          ? (
                                                                              packageIds &&
                                                                              packageIds.length > 0 &&
                                                                              user.subscriptions &&
                                                                              typeof user.subscriptions === 'object' &&
                                                                              user.subscriptions[packageIds]?.subscription_status !== "active"
                                                                                ? '#'
                                                                                : `/video/v1/3/${item._id}/${seriesid}`
                                                                            )
                                                                          : `/video/v1/3/${item._id}/${seriesid}`
                                                                      )
                                                                    : `/login?redirect=/video/v1/3/${item._id}/${seriesid}`
                                                                }
                                                                onClick={(e) => {
                                                                  if (tvodEnabled) {
                                                                    if (
                                                                      user &&
                                                                      packageIds &&
                                                                      packageIds.length > 0 &&
                                                                      user.subscriptions &&
                                                                      typeof user.subscriptions === 'object' &&
                                                                      user.subscriptions[packageIds]?.subscription_status !== "active"
                                                                    ) {
                                                                      e.preventDefault();
                                                                      navigate(`/Tvod/${seriesid}`);
                                                                    }
                                                                  }
                                                                }}
                                                                className="btn text-uppercase position-relative"
                                                              >
                                                                <img
                                                                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/play.svg`}
                                                                  alt="Watch Now"
                                                                />
                                                              </Link>
                                                            </div>

                                                            {/* Progress bar OVER image */}
                                                            {progressMap[
                                                              item._id
                                                            ] != null &&
                                                              item.videoLength >
                                                              0 && (
                                                                <div className="progress-overlay position-absolute w-100 bottom-0 px-2 bg-black-transparent d-flex align-items-center justify-content-between">
                                                                  <span className="font-size-14 fw-500 text-white text-lowercase">
                                                                    {formatTime(
                                                                      progressMap[
                                                                      item._id
                                                                      ],
                                                                    )}
                                                                  </span>
                                                                  <div className="flex-grow-1 mx-3">
                                                                    <ProgressBar
                                                                      now={Math.min(
                                                                        (progressMap[
                                                                          item
                                                                            ._id
                                                                        ] /
                                                                          item.videoLength) *
                                                                        100,
                                                                        100,
                                                                      )}
                                                                      style={{
                                                                        height:
                                                                          "5px",
                                                                      }}
                                                                    />
                                                                  </div>
                                                                  <span className="font-size-14 fw-500 text-white text-lowercase">
                                                                    {formatTime(
                                                                      item.videoLength,
                                                                    )}
                                                                  </span>
                                                                </div>
                                                              )}
                                                          </div>
                                                        </div>
                                                      </div>

                                                      {/* Description */}
                                                      <div className="image-details percent-55 ">
                                                        <Link
                                                          to={
                                                            user
                                                              ? (
                                                                tvodEnabled
                                                                    ? (
                                                                        packageIds &&
                                                                        packageIds.length > 0 &&
                                                                        user.subscriptions &&
                                                                        typeof user.subscriptions === 'object' &&
                                                                        user.subscriptions[packageIds]?.subscription_status !== "active"
                                                                          ? '#'
                                                                          : `/video/v1/3/${item._id}/${seriesid}`
                                                                      )
                                                                    : `/video/v1/3/${item._id}/${seriesid}`
                                                                )
                                                              : `/login?redirect=/video/v1/3/${item._id}/${seriesid}`
                                                          }
                                                          onClick={(e) => {
                                                            if (tvodEnabled) {
                                                              if (
                                                                user &&
                                                                packageIds &&
                                                                packageIds.length > 0 &&
                                                                user.subscriptions &&
                                                                typeof user.subscriptions === 'object' &&
                                                                user.subscriptions[packageIds]?.subscription_status !== "active"
                                                              ) {
                                                                e.preventDefault();
                                                                navigate(`/Tvod/${seriesid}`);
                                                              }
                                                            }
                                                          }}>
                                                          <h6 className="mb-1 font-weight-800 text-capitalize">
                                                            {item.title}
                                                          </h6>
                                                          <small className="line-clamp-2 text-white">
                                                            {/* {description} */}
                                                            {item.description}
                                                          </small>
                                                          <div className="desktop-none mt-1 duration">
                                                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/duration.svg`} />
                                                            <span className="ms-1">
                                                              {Math.round(
                                                                item.videoLength /
                                                                60,
                                                              )}{" "}
                                                              min
                                                            </span>
                                                          </div>
                                                        </Link>
                                                      </div>

                                                      {/* Play Button */}
                                                      <div className="gap-1 percent-5 d-none-mobile">
                                                        <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/duration.svg`} />
                                                        <span className="ms-1 text-white">
                                                          {Math.round(
                                                            item.videoLength /
                                                            60,
                                                          )}{" "}
                                                          min
                                                        </span>
                                                        {/* {item.videoSource && (
                                                        <Link
                                                          to={{
                                                            pathname: `/video/v1/3/${item._id}/${seriesid}`,
                                                            state: { videoSource: item.videoSource },
                                                          }}
                                                          className="btn text-uppercase position-relative"
                                                        >
                                                          <span className="button-text">Play Now</span>
                                                          <i className="fa-solid fa-play"></i>
                                                        </Link>
                                                      )} */}
                                                      </div>
                                                    </li>
                                                  </ul>
                                                </Fragment>
                                              ),
                                            )
                                            : null}
                                          {/* <div className="pagination d-flex align-items-center justify-content-center mt-2 px-2 py-2">
                                          <Button className="mx-2 py-2" onClick={() => handlePageChange(prevPageToken)} disabled={prevPageToken == ''}>Previous</Button>
                                          <span>Page {page} of {totalPages}</span>
                                          <Button className="mx-2 py-2" onClick={() => handlePageChange(nextPageToken)} disabled={nextPageToken == ''}>Next</Button>
                                        </div> */}
                                        </Tab.Pane>

                                        <Tab.Pane
                                          eventKey={"related"}
                                          key={"nav2"}
                                        >
                                          {(seriesType === "show" || seriesType === "programs") ? (
                                            <div className="card-style-grid">
                                              {/* <h4>More like this</h4> */}
                                              <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2 mb-5">
                                                {isloading ? (
                                                  <p>Loading...</p>
                                                ) : (
                                                  MoreLikeThis?.series
                                                    ?.filter(
                                                      (item) =>
                                                        item._id !== seriesId,
                                                    ) // Skip matching seriesId
                                                    .slice(0, 12)
                                                    .map((item, index) => (
                                                      <Col
                                                        key={index}
                                                        className="mb-2 c-padding"
                                                      >
                                                        <CardStyleHover
                                                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                                                          seriesType={
                                                            item.seriesType
                                                          }
                                                          id={item._id}
                                                          title={item.title}
                                                          isFavorite={isFavorite(item._id)}
                                                          name={item.name}
                                                          episodeCount={
                                                            item.episodeCount
                                                          }
                                                          // genres={[
                                                          //   "Romance",
                                                          //   "Drama",
                                                          // ]}
                                                          genres={item?.genresList?.filter(
                                                            (genre) => genre.toLowerCase() !== "telefilms",
                                                          )}
                                                          // genres={item.genreId.filter(
                                                          //   (genre) => genre.toLowerCase() !== "telefilms",
                                                          // )}
                                                          ageRating={
                                                            item.ageRating
                                                          }
                                                          link={
                                                            item.seriesType ===
                                                              "live"
                                                              ? `/live/${item.ost}/${item._id}`
                                                              : item.seriesType ===
                                                                "singleVideo"
                                                                ? `/watch/${item.seriesLayout}/${item._id}`
                                                                : item.seriesType ===
                                                                  "live-event"
                                                                  ? `/live-event/${item.ost}/${item._id}`
                                                                  : `/series/v3/${item._id}`
                                                          }
                                                          trailer={item.trailer}
                                                          duration={formatDuration(item.duration)}
                                                          packageInfo={item.packageIds}
                                                        />
                                                        {/* <CardStyleHover
                                                        image={image}
                                                        seriesType={data.seriesType}
                                                        id={data._id}
                                                        title={data.title}
                                                        watchlistLink="/playlist"
                                                        link={commonLink}
                                                        isFavorite={favorites.some(
                                                          (fav) => fav.seriesId?._id === data._id,
                                                        )}
                                                        name={item.name}
                                                        episodeCount={data.episodeCount}
                                                        // genres={data.genreId}

                                                        genres={data.genreId.filter(
                                                          (genre) => genre.toLowerCase() !== "telefilms",
                                                        )}
                                                        ageRating={data.ageRating}
                                                        trailer={data.trailer}
                                                        duration={formatDuration(data.duration)}
                                                      /> */}
                                                      </Col>
                                                    ))
                                                )}
                                              </Row>
                                            </div>
                                          ) : null}
                                        </Tab.Pane>

                                        <Tab.Pane eventKey={"more"} key={"nav3"}>
                                          {(seriesType === "show" || seriesType === "programs") ? (
                                            <div className="card-style-grid">
                                              <Row className="row row-cols-1 row-cols-md-2 row-cols-xl-2">
                                                <Col className="mb-2">
                                                  <h6>Synopsis</h6>
                                                  <p className="mt-4">
                                                    {description}
                                                  </p>

                                                  <div className="video-wrapper mt-3 mb-2">
                                                    <VideoPlayer
                                                      videoUrl={promo}
                                                      showControls={true} // show controls
                                                      isMuted={false}
                                                    />
                                                  </div>
                                                </Col>
                                                <Col className="mb-2 c-padding p-3">
                                                  <h6>Actors</h6>
                                                  <div className="d-flex flex-wrap gap-2 mt-3">
                                                    {Array.isArray(cast) &&
                                                      cast.map((actor, index) => (
                                                        <div className="cast">
                                                          <Link
                                                            to={`/cast-view-all/${encodeURIComponent(actor)}`}
                                                            className="iq-view-all text-decoration-none text-light btn btn-primary  view-all-btn "
                                                          >
                                                            {actor}
                                                          </Link>
                                                        </div>
                                                      ))}
                                                  </div>
                                                </Col>
                                              </Row>
                                            </div>
                                          ) : null}
                                        </Tab.Pane>
                                      </Tab.Content>
                                    </Tab.Container>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  {/* <Col lg="3" md="3" className="">
                  <MrecInner/>                    
                    <SeriesSidebar cast={cast} poster={poster} genre={genre} type={seriesType}/>
                  </Col> */}
                </Row>
              </div>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
});

export default SeriesCDN;
