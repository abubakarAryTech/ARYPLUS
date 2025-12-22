import React, { Fragment, memo, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { useAuthStore } from "../stores/useAuthStore";
import FollowUs from "../components/blog/sidebar/FollowUs.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Helmet } from "react-helmet";
import LeaderboardInner from "../Ads/LeaderboardInner.jsx";
import MrecInner from "../Ads/MrecInner.jsx";
import ErrorPage2 from "./ExtraPages/ErrorPage2.jsx";
import RadiantNew from "./RadiantNew.jsx";
import Cookies from "universal-cookie";
import { getConfig } from "../../config.js";
import Loader from "../components/ReactLoader";
import { BsArrowLeft, BsPlay } from "react-icons/bs";
import logger from '../services/logger';

import { ShimmerDiv, ShimmerCategoryItems } from "shimmer-effects-react";
import RadiantVOD from "./RadiantVOD.jsx";
import PlaylistPopup from "../components/PlaylistPopup.jsx";
import api from "../services/api";
import { isTvodEnabled } from "../utilities/tvodHelper.js";

const PLATFORMS = {
  YOUTUBE: "1",
  DAILYMOTION: "2",
  CUSTOM: "3",
};

const VideoPlayer = memo(
  ({
    platformId,
    videoId,
    title,
    prerollAds,
    featureImage,
    link,
    relatedVideos,
    seriesId,
    episodeId,
    togglePlaylistPopup,
    navigate,
    seriesType,
    resumeTime,
    seriesTitle
  }) => {
    // relatedVideos
    //  logger.log("related videos are: "+ JSON.stringify(relatedVideos))
    const config = getConfig();

    const getPlayerComponent = () => {
      switch (platformId) {
        case PLATFORMS.YOUTUBE:
          return (
            <iframe
              className="dailysingle"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          );
        case PLATFORMS.DAILYMOTION:
          return (
            <iframe
              className="dailysingle"
              frameBorder="0"
              allowFullScreen
              allow="autoplay"
              autoPlay
              title="ARY PLUS | A Video Streaming Portal"
              width="100%"
              src={`https://geo.dailymotion.com/player/xahry.html?video=${videoId}`}
            />
          );
        case PLATFORMS.CUSTOM:
          return (
            // <h2>{videoId}</h2>
            // <RadiantNew
            //   key={videoId}
            //   link={videoId}
            //   adsManager={prerollAds || config.default_preRollAd}
            //   title={title}
            //   version="v1"
            //   featureImage={featureImage}
            //   // playlistVideos={relatedVideos}
            // />

            <RadiantVOD
              key={videoId}
              link={videoId}
              adsManager={prerollAds || config.default_preRollAd}
              title={title}
              version="v1"
              featureImage={featureImage}
              playlistVideos={relatedVideos}
              episodeId={episodeId}
              seriesId={seriesId}
              togglePlaylistPopup={togglePlaylistPopup}
              navigate={navigate}
              seriesType={seriesType}
              resumeTime={resumeTime}
              seriesTitle={seriesTitle}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="single-videos">
        {getPlayerComponent()}
        {/* <h5 className="videoTitle mt-4 text-uppercase">{title}</h5> */}
      </div>
    );
  },
);

const RelatedVideosList = memo(
  ({ videos, platformId, currentTitle, isFetching }) => {
    // Removed the "View Full Playlist" button completely,
    // and only list the videos + the load-more sentinel.

    const [shimmerCount, setShimmerCount] = useState(10);
    const [shimmerHeight, setShimmerHeight] = useState(110);
    const [shimmerWidth, setShimmerWidth] = useState("100%");

    useEffect(() => {
      const updateShimmerSettings = () => {
        const width = window.innerWidth;

        if (width < 768) {
          setShimmerHeight(75); // Adjust height for mobile
        } else if (width >= 768 && width < 1024) {
          setShimmerHeight(100); // Adjust height for tablet
        } else {
          setShimmerHeight(110); // Adjust height for desktop
        }
      };

      updateShimmerSettings(); // Run on component mount
      window.addEventListener("resize", updateShimmerSettings); // Update on resize

      return () => {
        window.removeEventListener("resize", updateShimmerSettings); // Cleanup listener
      };
    }, []);

    return (
      <Container>
        <Row>
          <Col lg="12" sm="12" className="widget p-10">
            <ul className="list-inline m-0 p-0">
              {videos
                ?.filter((item) => item.title !== currentTitle)
                .map((item) => {
                  const routeParams = {
                    [PLATFORMS.YOUTUBE]: `/video/1/${item.videoYtId}/${item.seriesId}`,
                    [PLATFORMS.DAILYMOTION]: `/video/2/${item.videoDmId}/${item.seriesId}`,
                    [PLATFORMS.CUSTOM]: `/video/v1/3/${item._id}/${item.seriesId}`,
                  };

                  const imageSource =
                    platformId === PLATFORMS.CUSTOM
                      ? `${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePath}`
                      : item.imagePath;

                  return (
                    <li
                      className="d-flex align-items-center justify-content-between bg-black mt-2 px-2"
                      key={item._id || item.title} // Use unique key if possible
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="image-box single flex-shrink-0">
                          <Link to={routeParams[platformId]}>
                            <img
                              src={imageSource}
                              alt="thumbnail"
                              className="img-fluid rounded"
                            />
                          </Link>
                        </div>
                        <div className="image-details">
                          <Link to={routeParams[platformId]}>
                            <h6 className="mb-1 text-capitalize">
                              {item.title}
                            </h6>
                          </Link>
                        </div>
                      </div>
                      <div className="iq-button singleVideoButon">
                        <Link
                          to={routeParams[platformId]}
                          className="btn text-uppercase position-relative"
                        >
                          <span className="button-text">Play Now</span>
                          <i className="fa-solid fa-play"></i>
                        </Link>
                      </div>
                    </li>
                  );
                })}
            </ul>

            {isFetching && (
              <div className="d-flex flex-column justify-content-between my-2">
                {Array.from({ length: shimmerCount }).map((_, index) => (
                  // <ShimmerDiv
                  //   key={index}
                  //   mode="custom"
                  //   from={"#FF0606"}
                  //   via={"#242323"}
                  //   to={"#FF0606"}
                  //   height={100}
                  //   width={100}
                  //   className="m-1"
                  // />
                  // <ShimmerCategoryItems
                  // mode="custom"
                  // from={"#FF0606"}
                  //   via={"#242323"}
                  //   to={"#FF0606"}
                  //  />
                  <ShimmerDiv
                    mode="custom"
                    height={shimmerHeight}
                    width={shimmerWidth}
                    from={"#000000"}
                    via={"#242323"}
                    to={"#000000"}
                    className="my-1"
                  />
                ))}
              </div>
            )}
            {/* Intersection Observer sentinel */}
            <div id="load-more" style={{ height: "1px" }}></div>
          </Col>
        </Row>
      </Container>
    );
  },
);

const VideoMetaTags = memo(
  ({ title, description, featureImage, currentURL }) => (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentURL} />
      <meta property="og:site_name" content={title} />
      <meta
        property="article:publisher"
        content="https://www.facebook.com/aryzappk"
      />
      <meta property="og:image" content={featureImage} />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="720" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content="@aryzapofficial" />
      <meta name="twitter:site" content="@aryzapofficial" />
    </Helmet>
  ),
);


const SingleVideoNewV1 = memo(({ user, isAuthenticated }) => {
  const config = getConfig();
  const { videoid, platformid, seriesid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  
  const tvodEnabled = isTvodEnabled();

  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);

  const togglePlaylistPopup = () => {
    //logger.log('togglePlaylistPopup called, current state:', showPlaylistPopup); // Debug log
    setShowPlaylistPopup((prev) => !prev);
  };

  const shareUrl = "";

  const observerRef = useRef(null);

  // Video-specific state
  const [videoDetails, setVideoDetails] = useState({
    title: null,
    description: "",
    featureImage: "",
    prerollAds: "",
    videoUrl: null,
  });

  const [seriesTitle, setSeriesTitle] = useState("");

  // Pagination + Related
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(false);



  const [resumeTime, setResumeTime] = useState(0);

  const [packageId, setpackageId] = useState(null);

  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Basic validity check for the platform
  useEffect(() => {
    if (
      ![PLATFORMS.YOUTUBE, PLATFORMS.DAILYMOTION, PLATFORMS.CUSTOM].includes(
        platformid,
      )
    ) {
      setError(true);
    }
  }, [platformid]);

  // check if this content is paid or free or user has access or not 
  useEffect(() => {
    const checkContentAccess = async () => {
      try {
        // Fetch series data first
        const response = await api.get(`/api/series/${seriesid}`);
        const series = response.data;
        setpackageId(series.packageIds);

        // After setting packageId, check user subscription
        if (tvodEnabled && series.packageIds.length > 0 && user?.subscriptions && user.subscriptions[series.packageIds]?.subscription_status !== "active") {
          navigate(`/series/v3/${seriesid}`);
        }
      } catch (error) {
        logger.error("Error fetching series data:", error);
      } finally {
        // setIsLoading(false); // Allow rendering/playback after checks
      }
    };

    checkContentAccess();
  }, [seriesid, setpackageId, navigate]);

  // Fetch main video details
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        if (platformid === PLATFORMS.DAILYMOTION) {
          const [videoRes, playlistRes] = await Promise.all([
            fetch(
              `https://api.dailymotion.com/video/${videoid}?fields=title,thumbnail_180_url,uploaded_time`,
            ),
            fetch(`https://api.dailymotion.com/video/${videoid}/playlists`),
          ]);

          const videoData = await videoRes.json();
          const playlistData = await playlistRes.json();

          if (videoData?.error || !videoData?.title) {
            setError(true);
            return;
          }

          setVideoDetails((prev) => ({
            ...prev,
            title: videoData.title,
            featureImage: videoData.thumbnail_180_url,
            description: videoData.title,
          }));

          if (!playlistData?.list?.length) {
            // Possibly not an error but means no official DM "playlist"
            logger.warn("No Dailymotion playlist found for this video.");
          }
        }

        if (platformid === PLATFORMS.YOUTUBE) {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoid}&key=${config.appYtApiKey}&part=snippet`,
          );
          const data = await res.json();

          if (!data.items || data.items.length === 0) {
            setError(true);
            return;
          }
          const snippet = data.items[0].snippet;
          setVideoDetails((prev) => ({
            ...prev,
            title: snippet.title,
            description: snippet.description,
            featureImage: snippet.thumbnails.high.url,
          }));
        }

        if (platformid === PLATFORMS.CUSTOM) {
          const response = await api.get(`/api/cdn/ep/${videoid}`);
          const data = response.data;
          if (!data?.episode) {
            setError(true);
            return;
          }
          setVideoDetails((prev) => ({
            ...prev,
            videoUrlCDN: data.episode.videoSource,
            featureImage: data.episode.imagePath,
            title: data.episode.title,
            description: data.episode.description,
            prerollAds:
              data.episode?.streamAds?.tag || config.default_preRollAd,
            seriesType: data.episode?.videoType,
          }));
        }
      } catch (err) {
        logger.error("Video details fetch error:", err);
        setError(true);
      }
    };




    fetchVideoDetails();

  }, [videoid, platformid, config]);

  useEffect(() => {
    const fetchSeriesName = async () => {
      if (platformid !== PLATFORMS.CUSTOM) return;

      try {
        const response = await fetch(`${config?.appApiHomeEndpoint}/api/series/${seriesid}`);

        if (!response.ok) {
          logger.error(`Series fetch failed with status: ${response.status}`);
          throw new Error("Failed to fetch series data");
        }

        const data = await response.json();
        setSeriesTitle(data?.title || ""); // Set series title or default to empty string
        // logger.log("Series result:", data);

        // You can add logic here to handle the data, e.g., setState(data)

      } catch (error) {
        logger.error("Video details fetch error:", error.message);
        setError(true);
      }
    };
    fetchSeriesName();
  }, [seriesid]);


  // Check authentication + fetch (paginated) related videos
  useEffect(() => {
    // Avoid running effect if platformid is invalid
    if (
      ![PLATFORMS.YOUTUBE, PLATFORMS.DAILYMOTION, PLATFORMS.CUSTOM].includes(
        platformid,
      )
    ) {
      setError(true);
      return;
    }

    let isMounted = true;

    const initializePage = async () => {
      setLoading(true);
      setError(false);

      try {
        // Check authentication
        if (!isAuthenticated) {
          navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
          return;
        }

        if (!user?.uid) {
          logger.warn("No user ID found after authentication check");
          setError(true);
          return;
        }

        // Fetch watch history and related videos in parallel
        const fetchWatchHistory = async () => {
          try {
            const response = await api.get(
              `/api/v2/watch-history/by-user-episode/${user.uid}/${videoid}`
            );
            const data = response.data;
            if (data.length > 0 && data[0].currentTime) {
              if (isMounted) setResumeTime(data[0].currentTime);
            }
          } catch (error) {
            logger.error("Error fetching watch history:", error);
          }
        };

        const fetchRelatedVideos = async () => {
          try {
            setIsFetching(true);
            let apiUrl = "";
            switch (platformid) {
              case PLATFORMS.YOUTUBE:
                apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/yt/pg/${seriesid}?page=${page}`;
                break;
              case PLATFORMS.DAILYMOTION:
                apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/dm/pg/${seriesid}?page=${page}`;
                break;
              case PLATFORMS.CUSTOM:
                apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/cdn/${seriesid}`;
                break;
              default:
                throw new Error("Invalid platform ID");
            }

            const response = await api.get(apiUrl);
            const data = response.data;
            if (!data?.episode) {
              throw new Error("No episode data found");
            }

            if (isMounted) {
              if (page === 1) {
                setRelatedVideos(data.episode);
              } else {
                setRelatedVideos((prev) => [...prev, ...data.episode]);
              }
              setTotalPages(data.totalPages || 1);

            }

          } catch (err) {
            logger.error("Related videos fetch error:", err);
            if (isMounted) setError(true);
          } finally {

            if (isMounted) setIsFetching(false);
          }
        };

        await Promise.all([fetchWatchHistory(), fetchRelatedVideos()]);
        if (isMounted) setIsPageLoaded(true);
      } catch (err) {
        logger.error("Initialization error:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializePage();

    return () => {
      isMounted = false;
    };
  }, [platformid, seriesid, videoid, page, navigate, location.pathname, isAuthenticated, user]);

  // Intersection Observer to load next page
  useEffect(() => {
    const target = document.querySelector("#load-more");
    if (!target) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // If in view & not already fetching & more pages remain
        if (entries[0].isIntersecting && !isFetching && page < totalPages) {
          logger.log("Pagination triggered, loading next page");
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 },
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [isFetching, page, totalPages]);

  if (error) return <ErrorPage2 />;

  const {
    title,
    description,
    featureImage,
    prerollAds,
    videoUrlCDN,
    seriesType,
  } = videoDetails;
  const currentURL = window.location.href;

  return (
    <Fragment>
      <Helmet>
        <title>{`${seriesTitle} - ${title}`}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={currentURL} />
        <meta property="og:site_name" content={title} />
        <meta
          property="article:publisher"
          content="https://www.facebook.com/aryzappk"
        />
        <meta property="og:image" content={featureImage} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@aryzapofficial" />
        <meta name="twitter:site" content="@aryzapofficial" />
      </Helmet>
      {loading ? (
        <Loader />
      ) : (
        <div className="player">
          {/* <div className="back">
            <BsArrowLeft onClick={() => navigate(-1)} />
          </div> */}
          {/* <div  onClick={togglePlaylistPopup} className="playlist">
            <BsPlay />
          </div> */}
          {showPlaylistPopup && (
            <PlaylistPopup
              videos={relatedVideos}
              seriesid={seriesid}
              episodeId={videoid}
              onClose={() => setShowPlaylistPopup(false)}
            />
          )}
          <div>
            {/* {key && key.map((item, i) => (
              <Fragment key={i}>
                {item.key === secretKey && (
                  <RadiantLive link={item.url} adsManager={adsManager} title={title} version={'v1'} />
                )}
              </Fragment>
            ))} */}
            {videoid ? (
              <Fragment>
                <VideoPlayer
                  videoId={platformid == 3 ? videoUrlCDN : videoid}
                  adsManager={prerollAds}
                  title={title}
                  version={"v1"}
                  platformId={platformid}
                  featureImage={featureImage}
                  relatedVideos={relatedVideos}
                  seriesId={seriesid}
                  episodeId={videoid}
                  togglePlaylistPopup={togglePlaylistPopup}
                  navigate={navigate}
                  seriesType={seriesType}
                  resumeTime={resumeTime}
                  seriesTitle={seriesTitle}
                />
              </Fragment>
            ) : null}
          </div>
        </div>
      )}
    </Fragment>
  );
});

const SingleVideoNewV1WithAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  return <SingleVideoNewV1 user={user} isAuthenticated={isAuthenticated} />;
};

SingleVideoNewV1.displayName = "SingleVideoNewV1";
export default SingleVideoNewV1WithAuth;
