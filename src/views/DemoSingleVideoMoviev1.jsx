import React, { Fragment, memo, useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import { Helmet } from "react-helmet";
// Demo version - no authentication required
import logger from '../services/logger';

import Loader from "../components/ReactLoader";
import { useEnterExit } from "../utilities/usePage";
import RadiantVOD from "./RadiantVOD.jsx";
import api from "../services/api";
import { useAuthStore } from "../stores/useAuthStore";

const DemoSingleVideoMoviev1 = memo(() => {
  useEnterExit();
  const location = useLocation();

  const navigate = useNavigate();
  const playerRef = React.useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [title, setTitle] = useState("");
  const { user } = useAuthStore();
  const [description, setDescription] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [posterImage, setPosterImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { channel } = useParams();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [key, setKey] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [adsManager, setAdsManager] = useState("");

  const [seriesType, setSeriesType] = useState("");

  const currentURL = window.location.href;

  const [isLive, setIsLive] = useState(null);
  // const [url, setUrl] = useState(null);
  const [promo, setPromo] = useState(null);
  const [CDNWebLink, setCDNWebLink] = useState(null);

  const [resumeTime, setResumeTime] = useState(0);

  useEffect(() => {
    const loadAnalyticsScript = () => {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag("js", new Date());
        gtag("config", `${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`);
      };
    };

    const fetchWatchHistory = async (userId, seriesId) => {
      try {
        const response = await api.get(
          `/api/v2/watch-history/by-user-series/${userId}/${seriesId}`
        );
        const data = response.data;
        if (data.length > 0 && data[0].currentTime) {
          setResumeTime(data[0]?.currentTime); // Set resume time from API
        }
      } catch (error) {
        logger.error("Error fetching watch history time:", error);
      }
    };

    const init = async () => {
      loadAnalyticsScript();
      // Demo version - no authentication required
      const seriesID = channel;

      // Wait for watch history to be fetched before proceeding
      // await fetchWatchHistory(userID, seriesID); // Ensure resumeTime is set
      await fetchVideoSource(); // Fetch video source after watch history
      setIsPageLoaded(true); // Set page loaded after both fetches complete
    };

    init();
  }, [channel, navigate]);

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
        // if (!data.seiresCDNWebLink) {
        //   throw new Error("Incomplete data received");
        // }

        setSecretKey(data.seiresCDNWebKey);

        setSeriesType(data.seriesType);
        setCDNWebLink(data.seiresCDNWebLink);
        setTitle(data.title || "Untitled Video");
        setDescription(data.description || "No description available");
        setFeatureImage(data.imageCoverDesktop || data.imageCoverBig);
        setAdsManager(data.adsManager.tag || "");

        // if condition is for osts and else condition is for singleVideo
        if (data.seriesType === "show") {
          setVideoSrc(data.ost || "");
        } else {
          setVideoSrc(data.seiresCDNWebLink || "");
        }

        setPromo(data.trailer || "");
        setIsLive(data.isLive);
        setPosterImage(data.imagePoster);

        // const liveLinks = await fetch(
        //   `/sharer/livelinks_new.php?key=${data.seiresCDNWebKey}&path=${data.seiresCDNWebLink}`
        // );
        // if (!liveLinks.ok) throw new Error("Failed to fetch live links");

        // const liveData = await liveLinks.json();
        // if (liveData[0]?.signed_url) {
        //   setUrl(liveData[0].signed_url);
        // } else {
        //   logger.warn("Signed URL missing from live links response");
        // }

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
            content={`${import.meta.env.VITE_APP_IMAGE_PATH}` + featureImage}
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
      {/* Render RadiantVOD only when resumeTime is set and page is loaded */}
      {!isLoading && isPageLoaded && resumeTime !== null && (
        <div className="player">
          {/* <div className="back">
                    <BsArrowLeft onClick={() => navigate(-1)} />
                  </div> */}
          <div className="">
            {/* {key && key.map((item, i) => (
                      <Fragment key={i}>
                        {item.key === secretKey && (
                          <RadiantNew link={item.url} adsManager={adsManager} title={title} version={'v1'} />                          
                        )}
                      </Fragment>
                    ))} */}

            {videoSrc ? (
              <Fragment>
                {/* <RadiantNew link={videoSrc} adsManager={adsManager} title={title} version={'v1'} /> */}
                <RadiantVOD
                  link={videoSrc}
                  adsManager={adsManager || config.default_preRollAd}
                  title={title}
                  version="v1"
                  seriesId={channel}
                  // playlistVideos={relatedVideos}
                  featureImage={featureImage}
                  navigate={navigate}
                  seriesType={seriesType}
                />
              </Fragment>
            ) : null}
          </div>
        </div>
      )}
    </Fragment>
  );
});

DemoSingleVideoMoviev1.displayName = "DemoSingleVideoMoviev1";
export default DemoSingleVideoMoviev1;
