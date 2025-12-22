import React, { Fragment, memo, useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Row, Col, Container, Button } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import { Helmet } from "react-helmet";
import { useAuthStore } from "../stores/useAuthStore";
import RadiantLive from "./RadiantLive";
import Loader from "../components/ReactLoader";
import { useEnterExit } from "../utilities/usePage";
import logger from '../services/logger';

import LeaderboardInner from "../Ads/LeaderboardInner";
import MrecInner from "../Ads/MrecInner";
import FollowUs from "../components/blog/sidebar/FollowUs";

import CardStyle from "../components/cards/CardStyle";
import api from "../services/api";

const SingleVideoLiveEvent = memo(() => {
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

  const currentURL = window.location.href;
  const _class = position === "left" ? "flex-lg-row-reverse" : "";

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
      // navigate("/login");
      navigate(`/login?redirect=${location.pathname}`);
    } else {
      const userID = user?.uid;
    }

    // Set page as loaded after everything has been fetched/loaded
    setIsPageLoaded(true);
  }, [channel, navigate, isAuthenticated, user]);

  const { user, isAuthenticated } = useAuthStore();

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

  const [datas, setDatas] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api.get(
      `/api/series/byCatID/LIVE%20STREAMS/PK`
    )
      .then((resp) => {
        setDatas(resp.data);
      })
      .catch((error) => {
        logger.error("Data fetch failed:", error);
      });
  }, [channel]);

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
        console.log(`Attempt ${attempts} to fetch video source for channel:`, channel);

        const response = await api.get(
          `/api/series/${channel}`
        );
        const data = response.data;
        console.log('Series data received:', data);
        console.log('Secret key being used:', data.seiresCDNWebKey);
        console.log('CDN Web Link:', data.seiresCDNWebLink);
        
        if (!data.seiresCDNWebKey || !data.seiresCDNWebLink) {
          console.error('Missing CDN data:', { seiresCDNWebKey: data.seiresCDNWebKey, seiresCDNWebLink: data.seiresCDNWebLink });
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
        setPosterImage(data.imageCoverBig);


        const sharerUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/sharer/livelinks_new?key=${data.seiresCDNWebKey}&path=${data.seiresCDNWebLink}`;
        console.log('Calling sharer API:', sharerUrl);
        
        const liveLinks = await fetch(sharerUrl, {
          headers: {
            'Referer': window.location.origin,
            'User-Agent': navigator.userAgent
          }
        });
        if (!liveLinks.ok) {
          console.error('Sharer API failed:', liveLinks.status, liveLinks.statusText);
          throw new Error("Failed to fetch live links");
        }

        const liveData = await liveLinks.json();
        console.log('Sharer API response:', liveData);
        if (liveData[0]?.signed_url) {
          console.log('Generated signed URL:', liveData[0].signed_url);
          setUrl(liveData[0].signed_url);
          // Test the URL directly
          fetch(liveData[0].signed_url, { method: 'HEAD' })
            .then(r => console.log('URL test result:', r.status))
            .catch(e => console.log('URL test failed:', e));
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
                            <RadiantLive link={item.url} adsManager={adsManager} title={title} version={"v2"} />                          
                          )}
                        </Fragment>
                      ))} */}
                  {url && (
                    <Fragment>
                      <RadiantLive
                        key={url}
                        link={isLive ? url : promo}
                        adsManager={adsManager}
                        title={title}
                        version={"v2"}
                        featureImage={FeatureImage}
                      />
                    </Fragment>
                  )}
                  {/* <h5 className="videoTitle mt-4 text-uppercase">{title} Live Streaming</h5>
                    <p className="my-3 display-5">{description}</p> */}

                  <div className="live_title d-flex align-items-center videoTitle mt-4">
                    {PosterImage ? (
                      <img
                        src={
                          `${import.meta.env.VITE_APP_IMAGE_PATH}` + PosterImage
                        }
                        className="img-fluid livepage"
                        alt={title}
                        loading="lazy"
                      />
                    ) : null}

                    <div>
                      <span className="font-size-18 fw-500 text-uppercase text-white d-block mb-2">
                        {title} Live Streaming
                      </span>
                      <Button className="py-0 px-2 d-flex align-items-center">
                        <span className="blink-dot me-2"></span>
                        LIVE
                      </Button>
                      {/* <Button className="py-0 px-2"><span className="blink-button">.</span> LIVE</Button> */}
                    </div>
                  </div>
                  <p className="mt-2 gray">{description}</p>
                </div>
              </div>
              <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-sm-6 row-cols-2 margin-top-10r">
                {datas?.series
                  ?.filter(
                    (data) =>
                      data.status === "published" && data.title !== title,
                  )
                  ?.map((item, index) => (
                    <Col key={index} className="mb-5">
                      <CardStyle
                        image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                        link={
                          item.seriesType === "live"
                            ? `/live/${item.seriesLayout}/${item._id}`
                            : item.seriesType === "singleVideo"
                              ? `/watch/${item.seriesLayout}/${item._id}`
                              : item.seriesType === "live-event"
                                ? `/live-event/${item.seriesLayout}/${item._id}`
                                : `/series/v2/${item._id}`
                        }
                      />
                    </Col>
                  ))}
              </Row>
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
          {/* <Row className={_class + "mt-5"}>
          <div id="fb-root"></div>
            <div class="fb-commentsdiv mt-5">
              <div class="fb-comments" data-href={currentURL} 
                  data-width="100%" 
                  data-numposts="5" 
                  data-order-by="reverse_time">
              </div>
            </div>


          </Row>          */}

          {/* <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-sm-6 row-cols-2">
      
          {datas?.series?.filter(data => data.status === 'published' && data.title !== title)?.map((item, index) => (
                  <Col key={index} className="mb-5">
                    <CardStyle
                      image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePoster}`}
                      link={
                        item.seriesType === "live"
                          ? `/live/${item.ost}/${item._id}`
                          : item.seriesType === "live-event"
                          ? `/live-event/${item.ost}/${item._id}`
                          : `/series/v2/${item._id}`
                      }
                    />
                  </Col>
                ))}
              </Row> */}
        </Container>
      </div>
    </Fragment>
  );
});

SingleVideoLiveEvent.displayName = "SingleVideoLiveEvent";
export default SingleVideoLiveEvent;
