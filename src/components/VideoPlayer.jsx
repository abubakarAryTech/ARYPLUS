import { useEffect, useRef, useState, forwardRef } from "react";
import logger from '../services/logger';

let hlsScriptLoaded = false;
let hlsScriptLoadingPromise = null;

function loadHLSScript() {
  if (hlsScriptLoaded) return Promise.resolve();
  if (hlsScriptLoadingPromise) return hlsScriptLoadingPromise;

  hlsScriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.onload = () => {
      hlsScriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return hlsScriptLoadingPromise;
}

const VideoPlayer = forwardRef(function VideoPlayer(
  {
    videoUrl,
    isMuted = true,
    setIsMuted = () => {},
    autoPlay = false,
    loop = true,
    playsInline = true,
    className = "",
    style = {},
    showControls = false,
    onReady = () => {},
  },
  externalRef,
) {
  const internalRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);

  // Attach external ref to internal video ref
  useEffect(() => {
    if (!externalRef) return;
    if (typeof externalRef === "function") {
      externalRef(internalRef.current);
    } else {
      externalRef.current = internalRef.current;
    }
  }, [externalRef]);

  useEffect(() => {
    const video = internalRef.current;
    if (!video || !videoUrl) return;

    const isHls = videoUrl.endsWith(".m3u8");

    if (isHls) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.onloadedmetadata = () => {
          if (autoPlay) {
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                onReady();
              })
              .catch(() => setIsPlaying(false));
          }
        };
      } else {
        loadHLSScript()
          .then(() => {
            if (window.Hls && window.Hls.isSupported()) {
              const hls = new window.Hls();
              hls.loadSource(videoUrl);
              hls.attachMedia(video);

              hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) {
                  video
                    .play()
                    .then(() => {
                      setIsPlaying(true);
                      onReady();
                    })
                    .catch(() => setIsPlaying(false));
                }
              });

              hls.on(window.Hls.Events.ERROR, (event, data) => {
                logger.error("HLS.js error:", data);
              });

              video.__hls = hls;
            }
          })
          .catch((err) => logger.error("Failed to load HLS script:", err));

        return () => {
          if (video.__hls) {
            video.__hls.destroy();
            delete video.__hls;
          }
        };
      }
    } else {
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        if (autoPlay) {
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              onReady();
            })
            .catch(() => setIsPlaying(false));
        }
      };
    }
  }, [videoUrl]);

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <video
      ref={internalRef}
      muted={isMuted}
      autoPlay={autoPlay}
      loop={loop}
      playsInline={playsInline}
      className={className}
      style={style}
      controls={showControls}
      preload="auto"
      disablePictureInPicture
    />
  );
});

export default VideoPlayer;
