import React, { Component } from "react";
import logger from '../services/logger';

import axios from 'axios';
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import Series from "./Series_old";

import api from "../services/api";
import { useWatchHistoryStore } from "../stores/useWatchHistoryStore";

const isMobileDevice = () => {
  return window.matchMedia("(max-width: 768px)").matches;
};

class RadiantVOD extends Component {
  togglePlaylist = () => {
    const playlistContainer = document.querySelector(".rmp-playlist-side-menu");

    if (playlistContainer) {
      playlistContainer.style.display =
        playlistContainer.style.display === "none" ? "flex" : "none";
    }
  };
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     user: null
  //   };
  // }

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      currentTime: 0,
    };
    this.rmpInstance = null;

    this.lastLoggedSecond = null;
  }

  componentDidMount() {
    const {
      link,
      title,
      adsManager,
      version,
      featureImage,
      playlistVideos,
      togglePlaylistPopup,
      navigate,
      seriesId,
      seriesType,
      resumeTime,
      seriesTitle,
    } = this.props;

    // const TitleName = seriesTitle;
    const TitleName = seriesType === "singleVideo"
      ? title
      : `${seriesTitle} - ${title}`;


    // alert(seriesType);

    //  logger.log(adsManager);
    const divStyle = {
      position: "absolute",
      maxHeight: "100vh",
      minHeight: "100%",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
    const mobStyle = {
      marginTop: version === "v2" ? "10%" : "40%",
    };

    // Update the style based on device type
    this.setState({
      // style: isMobileDevice() ? mobStyle : divStyle
      style: divStyle,
    });

    // Get the current user from props
    const { user } = this.props;
    if (user) {
      // Set user state
      this.setState({ user: user.uid }, () => {
        this.initializePlayer(
          link,
          title,
          adsManager,
          version,
          featureImage,
          playlistVideos,
          togglePlaylistPopup,
          navigate,
          seriesId,
          seriesType,
          resumeTime,
          seriesTitle,
          TitleName
        );
      });
    } else {
      // Initialize the player without user_id
      this.initializePlayer(
        link,
        title,
        adsManager,
        version,
        featureImage,
        playlistVideos,
        togglePlaylistPopup,
        navigate,
        seriesId,
        seriesType,
        seriesTitle,
        TitleName
      );
    }
    window.addEventListener("beforeunload", this.handleUnload);
  }

  componentWillUnmount() {
    this.handleUnload(); // ensure call on React route change
    window.removeEventListener("beforeunload", this.handleUnload);

    // Clean up the player when component unmounts
    if (this.rmpInstance) {
      this.rmpInstance.stop(); // Stop playback
      this.rmpInstance.destroy(); // Destroy instance
      this.rmpInstance = null; // Remove reference
    }
  }

handleUnload = () => {
  const { episodeId, seriesId } = this.props;
  const { user, currentTime } = this.state;

  if (!user || !seriesId || currentTime === 0) return;

  // Update watch history via Zustand store
  useWatchHistoryStore.getState().updateProgress(
    user,
    seriesId,
    episodeId,
    Math.floor(currentTime)
  );

  // Get the current hour
  const currentHour = new Date().getHours();

  // Send a request to the webhook using axios
  axios.post(
    `${import.meta.env.VITE_RC_API_URL}`,
    {
      userId: user,
      seriesId: seriesId,
      hour: currentHour
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
    .then((res) => logger.log("Webhook interaction logged:", res.data))
    .catch((err) => logger.error("Error logging interaction:", err));
};



initializePlayer(
  link,
  title,
  adsManager,
  version,
  featureImage,
  playlistVideos,
  togglePlaylistPopup,
  navigate,
  seriesId,
  seriesType,
  resumeTime,
  seriesTitle,
  TitleName
) {
  logger.log("Featured image URL:", featureImage);
  // Stop and destroy previous instance before re-initializing
  if (this.rmpInstance) {
    this.rmpInstance.stop();
    this.rmpInstance.destroy();
    this.rmpInstance = null;
  }

  // Add back button to top-left of the player

  const backButton = document.createElement("button");
  backButton.onclick = () => {
    if (seriesType === "singleVideo") {
      // navigate(-1);

      navigate(-1, { replace: true });
    } else {
      navigate(`/series/v3/${seriesId}`);
    }
  };

  Object.assign(backButton.style, {
    position: "absolute",
    top: "5px",
    left: "12px",
    zIndex: 9999,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
    padding: "0px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  // Inline SVG
  backButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
`;

  document.getElementById("rmp").appendChild(backButton);

  const playlistData = Array.isArray(playlistVideos)
    ? playlistVideos.map((video, index) => ({
      src: {
        hls: video.videoSource,
      },
      contentMetadata: {
        // title: video.title || `Episode ${index + 1}`,
        title: `${TitleName}`,

        description: video.description || "",
        id: video._id,
        thumbnail: `${import.meta.env.VITE_APP_IMAGE_PATH}${video.imagePath}`,
        poster: [
          `${import.meta.env.VITE_APP_IMAGE_PATH}${video.imagePath}`,
        ],
      },
    }))
    : [];

  //     const playlistData = [{
  //   src: {
  //     hls: "https://vod.aryzap.com/cd6a659fvodtransjkt1313565080/53442c031397757909694658555/adp.10.m3u8"
  //   },
  //   "contentMetadata": {
  //     "title": "Playlist Item 1",
  //     "description": "Description for playlist item 1",
  //     "id": "1111111111",
  //     "thumbnail": "https://www.radiantmediaplayer.com/media/playlist/poster/item-1-thumbnail.jpg",
  //     "poster": [
  //       "https://www.radiantmediaplayer.com/media/playlist/poster/item-1.jpg"
  //     ]
  //   }
  // }, {
  //   src: {
  //     hls: "https://vod.aryzap.com/cd6a659fvodtransjkt1313565080/53442c031397757909694658555/adp.10.m3u8"
  //   },
  //   "contentMetadata": {
  //     "title": "Playlist Item 2",
  //     "description": "Description for playlist item 2",
  //     "id": "2222222222",
  //     "thumbnail": "https://www.radiantmediaplayer.com/media/playlist/poster/item-2-thumbnail.jpg",
  //     "poster": [
  //       "https://www.radiantmediaplayer.com/media/playlist/poster/item-2.jpg"
  //     ]
  //   }
  // }];

  const src = {
    hls: link,
  };
  const schedule = {
    //   preroll: adsManager,
  };

  // alert(title);

  // rgba(255, 0, 0, 1.00) red
  // #000000 black
  // #FFFFFF white
  const settings = {
    iconsSize: 1.25, // Adjust size as needed
    licenseKey: "eHp1dXRtb3Z5cEAxNDkyNDI4",
    src: src,
    preload: "auto",
    skin: "s2",
    // skin: version === 'v1' ? 's2' : 's2',
    // playlist: true,
    // playlistUpNextAutoplay: true,
    // playlistEndedLoop: false,

    pip: true,
    skinAccentColor: "rgba(255, 0, 0, 1.00)",
    skinBackgroundColor: "000000",
    skinButtonColor: "FFFFFF",
    scaleMode: "letterbox",
    posterScaleMode: "letterbox",
    autoplay: true,
    fullScreen: true,
    airplay: true,
    autoHeightMode: true,
    autoHeightModeRatio: 1.7777777778,
    gaTrackingId: "G-TVCEQ5YCP0",
    speed: true,
    googleCast: true,
    automaticFullscreenOnLandscape: true,
    longFormContent: true,
    googleCastReceiverAppId: "AC5A3368",
    hlsJSProgressive: true,
    googleCastAndroidReceiverCompatible: true,
    hlsJSMaxBufferBehind: 60,
    bitrateDataDisplayed: true,
    ads: true,
    adSchedule: schedule,
    id: "radiantPlayer",
    enableGAVideoTracking: true,
    displayRemainingTimeInPlaceOfDuration: false,
    allowLocalStorage: true,
    rememberCurrentTime: false,
    quickRewind: 10,
    quickForward: 10,
    backgroundColor: "rgba(255, 0, 0, 1.00)",

    gaEventParameters: {
      video_title: `${TitleName}`,
      UserID: this.state.user || "unknown_user", // Fallback if user is null
      video_provider: "CDN",
    },
    gaEvents: [
      "ready",
      "playerstart",
      "bufferstalled",
      "ended",
      "error",
      "adimpression",
      "adplayerror",
      "adloaderror",
      "enterfullscreen",
      "exitfullscreen",
      "seeking",
      "fullminutewatched",
      "pause",
      "adclick",
    ],
    contentMetadata: {
      title: `${TitleName}`,
      poster: [`${import.meta.env.VITE_APP_IMAGE_PATH}${featureImage}`],
      animatedPoster: `${import.meta.env.VITE_APP_IMAGE_PATH}${featureImage}`,
      thumbnail: `${import.meta.env.VITE_APP_IMAGE_PATH}${featureImage}`,
    },
    autoplayAnimatedPoster: true,

    customModule: [
      {
        hint: "Playlist",
        svg: `${import.meta.env.VITE_APP_IMAGE_PATH}images/playlist-svgrepo-com.svg`,
        svgHover: `${import.meta.env.VITE_APP_IMAGE_PATH}images/playlist-svgrepo-com-hover.svg`,
        callback: togglePlaylistPopup,
      },
    ],
    // customIconsLoc:"https://cdn.radiantmediatechs.com/rmp/svg/icons.json",
    iconSpinner: "rmp",
    //   playlistData
  };

  const elementID = "rmp";
  const rmp = new window.RadiantMP(elementID);
  rmp.init(settings);
  // rmp.setPoster('${import.meta.env.VITE_APP_IMAGE_PATH}desktop/1920-x-1080_1744035775657.webp');
  // rmp.setAnimatedPoster('${import.meta.env.VITE_APP_IMAGE_PATH}desktop/1920-x-1080_1744035775657.webp');

  // Save reference
  this.rmpInstance = rmp;

  // Use 'ready' event to safely hide playlist after initialization
  //   const observer = new MutationObserver(() => {
  //     const playlistContainer = document.querySelector('.rmp-playlist-side-menu');
  //     if (playlistContainer) {
  //       playlistContainer.style.display = 'none';
  //       observer.disconnect(); // stop observing once done
  //     }
  //   });

  //   observer.observe(document.getElementById('rmp'), {
  //     childList: true,
  //     subtree: true
  //   });

  // In your timeupdate listener:
  // rmp.on('loadedmetadata', () => {
  //   const rawTime = rmp.currentTime;
  //   const seconds = Math.floor(rawTime / 1000); // Convert ms to seconds

  //   if (this.lastLoggedSecond !== seconds) {
  //     this.lastLoggedSecond = seconds;
  //     this.setState({ currentTime: seconds });
  //     logger.debug("Video playback time:", seconds); // Only logs once per second
  //   }
  // });

  // Fallback to ensure video starts at 10 minutes
  rmp.on("ready", () => {
    const resumeTimeMs =
      Number.isFinite(resumeTime) && resumeTime > 0 ? resumeTime * 1000 : 0;
    logger.log("Video resume time:", resumeTime);
    logger.log("Video resume time (ms):", resumeTimeMs);
    rmp.seekTo(resumeTimeMs);
    logger.log(`Player ready, sought to ${resumeTimeMs / 1000} seconds`);
  });

  rmp.on("timeupdate", () => {
    const seconds = Math.floor(rmp.currentTime) / 1000;
    if (this.lastLoggedSecond !== seconds) {
      this.lastLoggedSecond = seconds;
      this.setState({ currentTime: seconds });
      logger.debug("Video playback time:", seconds);
    }
  });
}

render() {
  return (
    <>
      {/* <button
        onClick={this.togglePlaylist}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: '8px 12px',
          backgroundColor: '#f00',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Toggle Playlist
      </button> */}
      {/* <div id="rmp" style={this.state.style} /> */}
      <div className="rmp-playlist-container">
        <div className="rmp-playlist-player-wrapper">
          <div
            id="rmp"
            style={{ maxHeight: "100vh", minHeight: "100%" }}
          ></div>
        </div>
      </div>
    </>
  );
}
}

const RadiantVODWithAuth = (props) => {
  const { user } = useAuthStore();
  return <RadiantVOD {...props} user={user} />;
};

export default RadiantVODWithAuth;
