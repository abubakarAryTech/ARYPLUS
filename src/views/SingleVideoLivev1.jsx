import React, { Fragment, memo, useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
import {
  useParams,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import logger from '../services/logger';

import { useAuthStore } from "../stores/useAuthStore";
import { BsArrowLeft } from "react-icons/bs";
import { Helmet } from "react-helmet";
import Loader from "../components/ReactLoader";
import RadiantLive from "./RadiantLive";
import api from "../services/api";

const SingleVideoTwo = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  const [videoSrc, setVideoSrc] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featureImage, setFeatureImage] = useState("");

  const [adsManager, setAdsManager] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { channel } = useParams();
  const [key, setKey] = useState(null);

  const [PosterImage, setPosterImage] = useState("");

  const [isLive, setIsLive] = useState(null);
  const [url, setUrl] = useState(null);
  const [promo, setPromo] = useState(null);
  const [CDNWebLink, setCDNWebLink] = useState(null);

  const [secretKey, setSecretKey] = useState(null);
  const currentURL = window.location.href;

  useEffect(() => {
    const loadAnalyticsScript = () => {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
        gtag("js", new Date());
        gtag("config", `${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`);
      };
    };

    loadAnalyticsScript();
    fetchVideoSource();

    if (!isAuthenticated) {
      // navigate("/login");
      navigate(`/login?redirect=${location.pathname}`);
    }

    // Cleanup script
    return () => {
      const existingScript = document.querySelector(
        `script[src="https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}"]`,
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [channel, navigate, isAuthenticated]);

  useEffect(() => {
    if (title && user && window.gtag) {
      gtag("set", {
        user_id: user.uid,
        screen_name: title,
      });
    }
  }, [title, user]);

  // const fetchVideoSource = async () => {
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/series/${channel}`);
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
  //     setVideoSrc(data.seiresCDN);
  //     setAdsManager(data.trailer);
  //     setIsLoading(false);
  //   } catch (error) {
  //     logger.error("Error fetching video source:", error);
  //     setIsLoading(false);
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
        if (!liveLinks.ok) throw new Error("Failed to fetch live links");
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
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={currentURL} />
          <meta
            property="og:image"
            content={`${import.meta.env.VITE_APP_IMAGE_PATH}${featureImage}`}
          />
          <meta name="twitter:card" content="summary" />
        </Helmet>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <div className="player">
          {/* <div className="back">
            <BsArrowLeft onClick={() => navigate(-1)} />
          </div> */}
          <div>
            {/* {key && key.map((item, i) => (
              <Fragment key={i}>
                {item.key === secretKey && (
                  <RadiantLive link={item.url} adsManager={adsManager} title={title} version={'v1'} />
                )}
              </Fragment>
            ))} */}
            {url ? (
              <Fragment>
                <RadiantLive
                  link={isLive ? url : promo}
                  adsManager={adsManager}
                  title={title}
                  version={"v1"}
                  navigate={navigate}
                  featureImage={featureImage}
                />
              </Fragment>
            ) : null}
          </div>
        </div>
      )}
    </Fragment>
  );
});

SingleVideoTwo.displayName = "SingleVideoTwo";
export default SingleVideoTwo;
