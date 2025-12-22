import React, { Fragment, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Row, Col, Container, Nav, Tab, Form } from "react-bootstrap";

import { Link } from "react-router-dom";
import ReviewComponent from "../components/ReviewComponent";
import Sources from "../components/Sources";

import { Navigation } from "swiper/modules";
import UpcomingMovies from "../components/sections/UpcomingMovies";
import FsLightBox from "../components/fslight-box";
import RatingStar from "../components/rating-star";
import VideoJS from "../components/plugins/VideoJs";
import { BsArrowLeft } from "react-icons/bs";
// import { useNavigate } from "react-router-dom";
const modules = [Navigation];

import { generateImgPath } from "../StaticData/data";
import { useEnterExit } from "../utilities/usePage";
import { Helmet } from "react-helmet";

// alert(videoid);
const Radaint = (props) => {
  return (
    <>
      {/* <Helmet>
        <script
          src="https://cdn.radiantmediatechs.com/rmp/8.4.3/js/rmp.min.js"
          integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
          crossorigin="anonymous"
          async
        ></script>
      </Helmet> */}
      <div id="rmp"></div>
    </>
  );

  const streamurl = props.link;
  const preroll = props.adurl;
  const src = {
    hls: streamurl,
  };
  const backupSrc = [
    {
      hls: "https://7rgnwbg2npl8-hls-push.5centscdn.com/mp4/encoding/final%20high%20res/ZAP%20HIGH%20RES_Encoding.mp4/playlist.m3u8",
    },
    {
      hls: "https://7rgnwbg2npl8-hls-push.5centscdn.com/mp4/encoding/final%20high%20res/ZAP%20HIGH%20RES_Encoding.mp4/playlist.m3u8",
    },
  ];
  const schedule = {
    // Preroll
    preroll: preroll,
    midrollRepeat: [600, preroll],
  };
  // Then we set our player settings
  const settings = {
    licenseKey: "eHp1dXRtb3Z5cEAxNDkyNDI4",
    src: "https://arynewsm.aryzap.com/v1/0183ea205add0b8ed5941a38bc6f/018ad63928611ea50695040da296/main.m3u8",

    backupSrc: backupSrc,
    preload: "auto",
    skinAccentColor: "rgba(255, 0, 0, 1.00)",
    autoplay: true,
    airplay: true,
    autoHeightMode: true,
    autoHeightModeRatio: 1.7777777778,
    gaTrackingId: "G-TVCEQ5YCP0",
    speed: true,
    googleCast: true,
    googleCastReceiverAppId: "AC5A3368",
    hlsJSProgressive: true,
    //hlsEngine: 'shakaplayer',
    googleCastAndroidReceiverCompatible: true,
    //hlsJSFetchXhrWithCredentials: true,
    hlsJSMaxBufferBehind: 60,
    bitrateDataDisplayed: true,
    ads: true,
    // Pass ad schedule
    adSchedule: schedule,

    // The player will automatically resize itself based on context and those reference width/height values

    // Let us select a skin
    skin: "s1",
    // Let us add a poster frame to our player
    contentMetadata: {
      poster: [""],
    },
  };
  const elementID = "rmp";
  const rmp = new window.RadiantMP(elementID);
  rmp.init(settings);
};

Radaint.displayName = "Radaint";
export default Radaint;
