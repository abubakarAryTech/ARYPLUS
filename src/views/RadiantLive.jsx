import React, { Component } from "react";
import { useAuthStore } from "../stores/useAuthStore";

const isMobileDevice = () => {
  return window.matchMedia("(max-width: 768px)").matches;
};

class RadiantLive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
    this.rmpInstance = null; // 🛠️ MODIFIED: Store player instance
  }

  componentDidMount() {
    const { link, title, adsManager, version, navigate, featureImage } =
      this.props;

    const divStyle = {
      position: "absolute",
      maxHeight: "100vh",
      minHeight: "100%",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };

    this.setState({ style: divStyle });

    const { user } = this.props;
    if (user) {
      this.setState({ user: user.uid }, () => {
        this.initializePlayer(link, title, adsManager, navigate, featureImage);
      });
    } else {
      this.initializePlayer(link, title, adsManager, navigate, featureImage);
    }
  }

  componentWillUnmount() {
    // 🛠️ MODIFIED: Cleanup player when component unmounts
    if (this.rmpInstance) {
      this.rmpInstance.stop();
      this.rmpInstance.destroy();
      this.rmpInstance = null;
    }
  }

  initializePlayer(link, title, adsManager, navigate, featureImage) {
    // 🛠️ MODIFIED: Destroy previous instance before reinitialization
    if (this.rmpInstance) {
      this.rmpInstance.stop();
      this.rmpInstance.destroy();
      this.rmpInstance = null;
    }

    const backButton = document.createElement("button");
    backButton.onclick = () => navigate(-1);

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

    backButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    `;
    document.getElementById("rmp").appendChild(backButton);

    const src = { hls: link };
    const schedule = {};

    const settings = {
      licenseKey: "eHp1dXRtb3Z5cEAxNDkyNDI4",
      src: src,
      preload: "auto",
      skin: "s2",
      skinAccentColor: "rgba(255, 0, 0, 1.00)",
      // scaleMode: 'stretch',
      scaleMode: "letterbox",

      autoplay: true,
      fullScreen: true,
      airplay: true,
      autoHeightMode: true,
      autoHeightModeRatio: 1.7777777778,
      gaTrackingId: "G-TVCEQ5YCP0",
      speed: true,
      googleCast: true,
      googleCastReceiverAppId: "AC5A3368",
      hlsJSProgressive: true,
      googleCastAndroidReceiverCompatible: true,
      hlsJSMaxBufferBehind: 60,
      bitrateDataDisplayed: true,
      ads: false,
      adSchedule: schedule,
      id: "radiantPlayer",
      enableGAVideoTracking: true,
      gaEventParameters: {
        video_title: title,
        UserID: this.state.user || "unknown_user",
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
        title: title,
        poster: [`${import.meta.env.VITE_APP_IMAGE_PATH}${featureImage}`],
        animatedPoster: `${import.meta.env.VITE_APP_IMAGE_PATH}${featureImage}`,
        thumbnail: `${import.meta.env.VITE_APP_IMAGE_PATH}${featureImage}`,
      },
      autoplayAnimatedPoster: true,

      // customIconsLoc:"https://cdn.radiantmediatechs.com/rmp/svg/icons.json",
      iconSpinner: "rmp",
    };

    const elementID = "rmp";
    const rmp = new window.RadiantMP(elementID);
    rmp.init(settings);

    // 🛠️ MODIFIED: Save reference for cleanup
    this.rmpInstance = rmp;
  }

  render() {
    return <div id="rmp" style={this.state.style} />;
  }
}

const RadiantLiveWithAuth = (props) => {
  const { user } = useAuthStore();
  return <RadiantLive {...props} user={user} />;
};

export default RadiantLiveWithAuth;
