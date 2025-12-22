import React, { Fragment, memo, useEffect, useState } from "react";
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
import Radaint from "./Radiant";
import Radiant from "./Radiant";

// alert(videoid);
const SingleVideoTwo = memo(() => {
  useEnterExit();
  const navigate = useNavigate();
  const playerRef = React.useRef(null);
  const { videoid } = useParams();

  // alert(channel);
  // alert(testvalue);
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    className: "dailysingle",
    techOrder: ["html5"],
    sources: [
      {
        // src: "https://arynewsm.aryzap.com/v1/0183ea205add0b8ed5941a38bc6f/018ad63928611ea50695040da296/main.m3u8",
        src: "https://www.youtube.com/embed/" + videoid,
        type: "application/x-mpegURL",
      },
    ],
    //youtube: { iv_load_policy: 1 },
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <Fragment>
      <div className="iq-main-slider site-video">
        <Container fluid>
          <Row>
            <Col lg="12">
              <div className="pt-0">
                <div className="player">
                  <div className="back">
                    <BsArrowLeft onClick={() => navigate(-1)} />
                  </div>
                  {/* <VideoJS options={videoJsOptions} onReady={handlePlayerReady} /> */}
                  <div className="single-videos">
                    {/* <PlyrLive link={item.url} adurl={item.adurl} /> */}
                    {/* <Radiant link="https://www.youtube.com/embed/dwgDKnet0XQ"/> */}
                  </div>
                  <iframe
                    className="dailysingle"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay"
                    autoPlay={true}
                    title="ARY PLUS | A Video Streaming Portal"
                    width="100%"
                    src={"https://www.youtube.com/embed/" + videoid}
                  ></iframe>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

SingleVideoTwo.displayName = "SingleVideoTwo";
export default SingleVideoTwo;
