import React, { Component } from "react";
import { useAuthStore } from "../stores/useAuthStore";

const isMobileDevice = () => {
  return window.matchMedia("(max-width: 768px)").matches;
};

class RadiantNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    const { link, title, adsManager, version } = this.props;
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
      style: isMobileDevice() ? mobStyle : divStyle,
    });

    // Display an alert with the title prop

    // Get the current user from props
    const { user } = this.props;
    if (user) {
      // Set user state
      this.setState({ user: user.uid }, () => {
        this.initializePlayer(link, title, adsManager);
      });
    } else {
      // Initialize the player without user_id
      this.initializePlayer(link, title, adsManager);
    }
  }

  initializePlayer(link, title, adsManager) {
    const isMP4 = link?.endsWith(".mp4");
    // alert(link);

    const src = isMP4
      ? {
          mp4: {
            url: "https://vod.aryzap.com/0a59cdf8vodsgp1313565080/6e7fd1931397757911384642638/1uAnsJklR1QA.mp4",
            type: "video/mp4",
          },
        }
      : {
          hls: link,
        };

    const schedule = {
      preroll: adsManager,
    };

    // alert(title);

    const settings = {
      licenseKey: "eHp1dXRtb3Z5cEAxNDkyNDI4",
      src: src,
      preload: "auto",
      skin: "s2",
      skinAccentColor: "rgba(255, 0, 0, 1.00)",
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
      ads: true,
      adSchedule: schedule,
      id: "radiantPlayer",
      enableGAVideoTracking: true,
      gaEventParameters: {
        video_title: title,
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
    };

    const elementID = "rmp";
    const rmp = new window.RadiantMP(elementID);
    rmp.init(settings);
  }

  render() {
    return (
      <>
        {/* <p>testing..</p> */}
        <div id="rmp" style={this.state.style} />
      </>
    );
  }
}

const RadiantNewWithAuth = (props) => {
  const { user } = useAuthStore();
  return <RadiantNew {...props} user={user} />;
};

export default RadiantNewWithAuth;
