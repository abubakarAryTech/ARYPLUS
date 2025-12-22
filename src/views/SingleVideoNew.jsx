import React, { Fragment, memo, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { useAuthStore } from "../stores/useAuthStore";
import FollowUs from "../components/blog/sidebar/FollowUs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Helmet } from "react-helmet";
import LeaderboardInner from "../Ads/LeaderboardInner";
import MrecInner from "../Ads/MrecInner";
import ErrorPage2 from "../views/ExtraPages/ErrorPage2";
import RadiantNew from "./RadiantNew";
import Cookies from "universal-cookie";
import { getConfig } from "../../config.js";
import logger from '../services/logger';

import { ShimmerDiv, ShimmerCategoryItems } from "shimmer-effects-react";
import api from "../services/api";

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
    videoUrl,
    seriesId,
  }) => {
    const config = getConfig();
    // alert(videoUrl);
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
          return videoUrl ? (
            <RadiantNew
              key={videoId}
              link={videoUrl}
              adsManager={prerollAds || config.default_preRollAd}
              title={title}
              version="v2"
              episodeId={videoId}
              seriesId={seriesId}
            />
          ) : null;

        default:
          return null;
      }
    };

    return (
      <div className="single-video">
        {getPlayerComponent()}
        <h5 className="videoTitle mt-4 text-uppercase">{title}</h5>
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

const SingleVideoNew = memo(() => {
  const config = getConfig();
  const { videoid, platformid, seriesid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const observerRef = useRef(null);

  // Video-specific state
  const [videoDetails, setVideoDetails] = useState({
    title: null,
    description: "",
    featureImage: "",
    prerollAds: "",
    videoUrl: null,
  });

  // Pagination + Related
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(false);

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

  // Fetch main video details
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        if (platformid === PLATFORMS.DAILYMOTION) {
          const [videoRes, playlistRes] = await Promise.all([
            api.get(`https://api.dailymotion.com/video/${videoid}?fields=title,thumbnail_180_url,uploaded_time`),
            api.get(`https://api.dailymotion.com/video/${videoid}/playlists`),
          ]);

          const videoData = videoRes.data;
          const playlistData = playlistRes.data;

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
          const res = await api.get(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoid}&key=${config.appYtApiKey}&part=snippet`,
          );
          const data = res.data;

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
          const res = await api.get(
            `/api/cdn/ep/${videoid}`,
          );
          const data = res.data;

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
          }));
        }
      } catch (err) {
        logger.error("Video details fetch error:", err);
        setError(true);
      }
    };

    fetchVideoDetails();
  }, [videoid, platformid, config]);

  // Check authentication + fetch (paginated) related videos
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }

    const fetchRelatedVideos = async (pageNumber) => {
      try {
        setIsFetching(true);

        // Construct the correct API based on the platform
        let apiUrl = "";
        switch (platformid) {
          case PLATFORMS.YOUTUBE:
            apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/yt/pg/${seriesid}?page=${pageNumber}`;
            break;
          case PLATFORMS.DAILYMOTION:
            apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/dm/pg/${seriesid}?page=${pageNumber}`;
            break;
          case PLATFORMS.CUSTOM:
            apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/cdn/${seriesid}?page=${pageNumber}`;
            break;
          default:
            return;
        }

        const response = await api.get(apiUrl);
        const data = response.data;

        // data.episode = array of episodes
        // data.totalPages = total # of pages
        if (!data?.episode) {
          setError(true);
          setIsFetching(false);
          return;
        }

        // For first page, replace the array, else concatenate
        if (pageNumber === 1) {
          setRelatedVideos(data.episode);
        } else {
          setRelatedVideos((prev) => [...prev, ...data.episode]);
        }

        setTotalPages(data.totalPages || 1);
      } catch (err) {
        logger.error("Related videos fetch error:", err);
      } finally {
        setIsFetching(false);
        setLoading(false);
      }
    };

    // Fetch for the current page
    fetchRelatedVideos(page);
    // window.scrollTo(0, 0);
  }, [navigate, location, platformid, seriesid, page]);

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

  const { title, description, featureImage, prerollAds, videoUrlCDN } =
    videoDetails;

  return (
    <Fragment>
      {/* Only render SEO tags once we know the title, etc. */}
      {!loading && title && (
        <VideoMetaTags
          title={title}
          description={description}
          featureImage={featureImage}
          currentURL={window.location.href}
        />
      )}

      <div className="section-padding mx-2 mt-3">
        <Container>
          <LeaderboardInner />
          <Row>
            <Col lg="9" sm="12" className="align-items-start mobileMT-30">
              <div className="player">
                <VideoPlayer
                  platformId={platformid}
                  videoId={videoid}
                  videoUrl={platformid == 3 ? videoUrlCDN : videoid}
                  title={title}
                  prerollAds={prerollAds}
                  featureImage={featureImage}
                  seriesId={seriesid}
                />
              </div>
            </Col>

            <Col lg="3" sm="12" className="text-center mobileMT-40 fix-title">
              <MrecInner />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://apps.apple.com/pk/app/ary-zap/id1475260911"
              >
                <img
                  className="mt-4"
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/apps/Apple.png`}
                  alt="App Store"
                />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://play.google.com/store/apps/details?id=com.release.arylive"
              >
                <img
                  className="mt-2 mb-4"
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/apps/Android Button.png`}
                  alt="Play Store"
                />
              </a>
              <FollowUs heading="Share Video On:" seriesId={seriesid} />
            </Col>
          </Row>

          {loading ? (
            <Skeleton count={8} height={30} />
          ) : (
            <RelatedVideosList
              videos={relatedVideos}
              platformId={platformid}
              currentTitle={title}
              isFetching={isFetching}
            />
          )}
        </Container>
      </div>
    </Fragment>
  );
});

SingleVideoNew.displayName = "SingleVideoNew";
export default SingleVideoNew;
