import React, { Fragment, memo, useEffect, useState, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
import {
  useParams,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import logger from '../services/logger';

import { Row, Col, Container, Button } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import { Helmet } from "react-helmet";
import { useAuthStore } from "../stores/useAuthStore";
import RadiantNew from "./RadiantNew";
import Loader from "../components/ReactLoader";
import { useEnterExit } from "../utilities/usePage";

import LeaderboardInner from "../Ads/LeaderboardInner";
import MrecInner from "../Ads/MrecInner";
import FollowUs from "../components/blog/sidebar/FollowUs";
import api from "../services/api";

const SingleVideoLiveEvent = memo(({ user, isAuthenticated }) => {
  useEnterExit();
  const navigate = useNavigate();

  const location = useLocation();

  const playerRef = React.useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");
  const [FeatureImage, setFeatureImage] = useState("");
  const [PosterImage, setPosterImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { channel, position } = useParams();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [key, setKey] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [adsManager, setAdsManager] = useState("");

  const [isLive, setIsLive] = useState(null);
  const [url, setUrl] = useState(null);
  const [promo, setPromo] = useState(null);
  const [CDNWebLink, setCDNWebLink] = useState(null);

  // const currentURL = window.location.href;
  const currentURL = useMemo(() => window.location.href, []); // Use `useMemo` for stability

  const _class = position === "left" ? "flex-lg-row-reverse" : "";

  // useEffect(() => {
  //   if (window.FB) {
  //     window.FB.XFBML.parse(); // Reinitialize the Facebook plugin
  //   }
  // }, [currentURL]); // Trigger when `currentURL` changes

  useEffect(() => {
    // Function to load the Google Analytics script
    const loadAnalyticsScript = () => {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag("js", new Date());
        gtag("config", `${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`);
      };
    };

    // Load Google Analytics script
    loadAnalyticsScript();

    // Fetch video source from API
    fetchVideoSource();

    if (!isAuthenticated) {
      navigate(`/login?redirect=${location.pathname}`);
    }

    // Set page as loaded after everything has been fetched/loaded
    setIsPageLoaded(true);
  }, [channel, navigate, isAuthenticated]);

  useEffect(() => {
    if (isPageLoaded && title && user) {
      // Update title and send analytics event when page is fully loaded
      const pageTitle = title;
      // alert(pageTitle + " " + user.uid);
      if (window.gtag) {
        gtag("set", {
          user_id: user.uid,
          screen_name: pageTitle,
        });
      }
    }
  }, [isPageLoaded, title, user]);

  // const fetchVideoSource = async () => {
  //   try {
  //     // Fetch data from API
  //     const response = await fetch("${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/series/" + channel);
  //     const liveLinks = await fetch(`https://aryzap.com/api/livelinks.php`);

  //     if (!response.ok || !liveLinks.ok) {
  //       throw new Error("Failed to fetch data");
  //     }
  //     const data = await response.json();
  //     const liveData = await liveLinks.json();

  //     setKey(liveData);
  //     setSecretKey(data.seiresCDNWebKey);
  //     setTitle(data.title);
  //     setDescription(data.description);
  //     setFeatureImage(data.imageCoverDesktop);
  //     setPosterImage(data.imagePoster);
  //     setAdsManager(data.trailer);

  //     // Assuming the API response has a 'src' field containing the video source
  //     setVideoSrc(data.seiresCDN);
  //     setIsLoading(false);
  //   } catch (error) {
  //     logger.error("Error fetching video source:", error);
  //   }
  // };

  const fetchVideoSource = async (maxRetries = 3) => {
    let attempts = 0;
    let success = false;

    while (attempts < maxRetries && !success) {
      try {
        attempts++;
        // logger.log(`Attempt ${attempts} to fetch video source`);

        const response = await api.get(
          `/api/series/${channel}`
        );
        const data = response.data;
        if (!data.seiresCDNWebKey || !data.seiresCDNWebLink) {
          throw new Error("Incomplete data received");
        }

        setSecretKey(data.seiresCDNWebKey);
        setCDNWebLink(data.seiresCDNWebLink);
        setTitle(data.title || "Untitled Video");
        setDescription(data.description || "No description available");
        setFeatureImage(data.imageCoverDesktop || "default-image.jpg");
        setAdsManager(data.adsManager.tag || "");
        setVideoSrc(data.seiresCDN || "");
        setPromo(data.trailer || "");
        setIsLive(data.isLive);
        setPosterImage(data.imagePoster);

        const liveLinks = await fetch(
          `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/sharer/livelinks_new?key=${data.seiresCDNWebKey}&path=${data.seiresCDNWebLink}`
        );
        const liveData = await liveLinks.json();
        if (liveData[0]?.signed_url) {
          setUrl(liveData[0].signed_url);
        } else {
          logger.warn("Signed URL missing from live links response");
        }

        setIsLoading(false);
        success = true; // Mark as successful to exit the retry loop
      } catch (error) {
        logger.error(
          `Error fetching video source (Attempt ${attempts}):`,
          error,
        );

        if (attempts >= maxRetries) {
          // logger.error("Max retries reached. Unable to fetch video source.");
          setIsLoading(false);
        } else {
          logger.warn("Retrying fetch video source...");
        }
      }
    }
  };

  return (
    <Fragment>
      {!isLoading && (
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
            content={`${import.meta.env.VITE_APP_IMAGE_PATH}` + FeatureImage}
            data-react-helmet="true"
          />
          <meta property="og:image:width" content="1280" />
          <meta property="og:image:height" content="720" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:creator" content="@aryzapofficial" />
          <meta name="twitter:site" content="@aryzapofficial" />
        </Helmet>
      )}

      {isLoading && <Loader />}

      <div className="section-padding mx-2 mt-3  ">
        <Container>
          <LeaderboardInner />
          <Row className={_class}>
            <Col lg="9" sm="12" className="align-items-start">
              <div className="player mobileMT-30">
                <div className="single-video-live">
                  {/* {key && key.map((item, i) => (
                        <Fragment key={i}>
                          {item.key === secretKey && (
                            <RadiantNew link={item.url} adsManager={adsManager} title={title} version={'v2'} />                          
                          )}
                        </Fragment>
                      ))} */}
                  {url ? (
                    <Fragment>
                      <RadiantNew
                        link={isLive ? url : promo}
                        adsManager={adsManager}
                        title={title}
                        version={"v2"}
                      />
                    </Fragment>
                  ) : null}
                  {/* <h5 className="videoTitle mt-4 text-uppercase">{title}</h5>                    
                    <p className="my-3 display-5">{description}</p> */}

                  <div className="live_title d-flex align-items-center videoTitle mt-4">
                    {PosterImage ? (
                      <img
                        src={
                          `${import.meta.env.VITE_APP_IMAGE_PATH}` + PosterImage
                        }
                        className="img-fluid"
                        alt={title}
                        loading="lazy"
                      />
                    ) : null}

                    <div>
                      <span className="font-size-18 fw-500 text-uppercase text-white d-block mb-2">
                        {title}
                      </span>
                      {isLive ? (
                        <Button className="py-0 px-2 d-flex align-items-center">
                          <span className="blink-dot me-2"></span>
                          LIVE
                        </Button>
                      ) : null}

                      {/* <Button className="py-0 px-2"><span className="blink-button">.</span> LIVE</Button> */}
                      <p className="mt-2 gray">{description}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* {currentURL && (
                <div>
                  <div id="fb-root"></div>
                  <div className="fb-commentsdiv margin-top-5">
                    <div
                      className="fb-comments"
                      data-href={currentURL}
                      data-width="100%"
                      data-numposts="5"
                      data-order-by="reverse_time"
                    ></div>
                  </div>
                </div>
              )} */}
            </Col>
            <Col
              lg="3"
              sm="12"
              className="text-center mobileMT-40 fix-title-live"
            >
              {/* <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/4694255592973182053.png`} alt="Ad"/> */}
              <MrecInner />
              <a
                target="_blank"
                href="https://apps.apple.com/pk/app/ary-zap/id1475260911"
                rel="noreferrer"
              >
                <img
                  className="mt-4"
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/apps/Apple.png`}
                  alt=""
                />
              </a>
              <a
                target="_blank"
                href="https://play.google.com/store/apps/details?id=com.release.arylive&hl=en"
                rel="noreferrer"
              >
                <img
                  className="mt-2 mb-4"
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/apps/Android Button.png`}
                  alt=""
                />
              </a>
              <FollowUs heading="Share Video On:" seriesId={channel} />
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

const SingleVideoLiveEventWithAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  return <SingleVideoLiveEvent user={user} isAuthenticated={isAuthenticated} />;
};

SingleVideoLiveEvent.displayName = "SingleVideoLiveEvent";
export default SingleVideoLiveEventWithAuth;
