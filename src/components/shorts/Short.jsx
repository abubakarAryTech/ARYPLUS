import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import styles from "../../views/Shorts/Shorts.module.css";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../services/api";
import { getConfig } from "../../../config";
import { Helmet } from "react-helmet";
import { toTitleCase } from "../../utilities/usePage";
import toast from "react-hot-toast";
import SharePopupPortal from "../SharePopupPortal";
import logger from '../../services/logger';

function Short({ short, shortContainerRef, isMuted, setIsMuted, hasUserInteracted, setHasUserInteracted }) {
  const playPauseRef = useRef();
  const videoRef = useRef();
  const navigate = useNavigate();
  const config = getConfig();

  const [showShareIcons, setShowShareIcons] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(short.isLiked);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [likesCount, setLikesCount] = useState(short.likesCount || 0);
  const [isBuffering, setIsBuffering] = useState(true); // NEW: loader state
  const [isUserPaused, setIsUserPaused] = useState(false); // Track if user manually paused
  const likeDebounceTimer = useRef(null);
  const pendingLikeState = useRef(null);

  const shareLink = `${import.meta.env.VITE_APP_BASE_URL}shorts/${short._id}`;

  /** Copy link with HTTPS fallback */
  const copyLinkToClipboard = (link) => {
    navigator.clipboard
      .writeText(link)
      .then(() => logger.log("Link copied to clipboard:", link))
      .catch((err) => logger.error("Failed to copy:", err));
    toast.success("Copied!");
  };

  // const fetchFavorites = useCallback(async (currentUser) => {
  //   if (currentUser) {
  //     try {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/like-count/like/${currentUser.uid}/${short._id}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             //Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
  //           },
  //         }
  //       );
  //       setIsLiked(response.data.length > 0);
  //     } catch (error) {
  //       logger.error("Error fetching favorites", error);
  //       setIsLiked(false); // fallback
  //     } finally {
  //       setIsLoadingLike(false);
  //     }
  //   }
  // }, [short._id]);

  const handleLikeToggle = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Optimistic UI update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    // Store pending state
    pendingLikeState.current = newLikedState;

    // Clear existing timer
    if (likeDebounceTimer.current) {
      clearTimeout(likeDebounceTimer.current);
    }

    // Debounce API call by 5 seconds
    likeDebounceTimer.current = setTimeout(async () => {
      try {
        await api.post(
          `/api/v2/shorts/${short._id}/like`,
          { userId: user.uid }
        );
      } catch (error) {
        logger.error("Error toggling like", error);
        // Revert on error
        setIsLiked(!pendingLikeState.current);
        setLikesCount(prev => pendingLikeState.current ? Math.max(0, prev - 1) : prev + 1);
        toast.error("Unable to update like status");
      }
    }, 5000);
  };

  /** Video visibility check */
  const isActiveVideo = useCallback(() => {
    if (!videoRef.current) return false;
    const rect = videoRef.current.getBoundingClientRect();
    return rect.top > 0 && rect.top <= 150 && rect.left >= 0 && rect.right <= window.innerWidth;
  }, []);

  const handleVideoVisibility = useCallback(async () => {
    if (!videoRef.current) return;
    if (isActiveVideo()) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
        setIsUserPaused(false); // Reset user pause state when video becomes active
      } catch {
        setIsPlaying(false);
        videoRef.current.pause();
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActiveVideo]);

  const { user } = useAuthStore();

  /** Init user & video */
  useEffect(() => {

    const video = videoRef.current;
    if (!video || !short.videoUrl) return;

    let hls;
    let script;

    // Video event listeners for buffering
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = short.videoUrl;
      // For native HLS support, try to autoplay
      if (isActiveVideo()) {
        video.play().catch(() => setIsPlaying(false));
      }
    } else {
      script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.async = true;
      script.onload = () => {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(short.videoUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            if (isActiveVideo()) {
              video.play().catch(() => setIsPlaying(false));
            }
          });
          hls.on(window.Hls.Events.ERROR, (_, data) => {
            logger.error("HLS.js error:", data);
          });
          video.__hls = hls;
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);

      if (hls) hls.destroy();
      if (video.__hls) {
        video.__hls.destroy();
        delete video.__hls;
      }
      if (script) script.remove();
    };
  }, [short.videoUrl, isActiveVideo]);

  /** Scroll & focus handlers */
  useEffect(() => {
    const container = shortContainerRef?.current;
    if (!container) return;

    const handleScroll = () => handleVideoVisibility();
    container.addEventListener("scroll", handleScroll);

    const handleBlur = () => {
      if (isActiveVideo()) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    const handleFocus = () => {
      if (isActiveVideo() && !isUserPaused) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [shortContainerRef, handleVideoVisibility, isActiveVideo]);

  /** Sync mute state */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  /** Cleanup debounce timer on unmount */
  useEffect(() => {
    return () => {
      if (likeDebounceTimer.current) {
        clearTimeout(likeDebounceTimer.current);
      }
    };
  }, []);

  const toggleSharePopup = () => {
    setShowShareIcons((prev) => !prev);
  };

  return (
    <>
      <Helmet>
        <title>{`${toTitleCase("SNIPS")}`}</title>
      </Helmet>
      <div className={styles.reel}>
        <div className={styles["reel-video"]}>
          <div className={styles.video}>
            {/* Loader overlay */}
            {isBuffering && (
              <div className={styles.loaderOverlay}>
                <div className={styles.spinner}></div>
              </div>
            )}

            <video
              ref={videoRef}
              onClick={() => {
                if (!isPlaying) {
                  videoRef.current.play().catch(() => {});
                  setIsPlaying(true);
                  setIsUserPaused(false);
                  // Enable unmuting after user interaction
                  if (!hasUserInteracted) {
                    setHasUserInteracted(true);
                    setIsMuted(false);
                  }
                } else {
                  videoRef.current.pause();
                  setIsPlaying(false);
                  setIsUserPaused(true);
                }
              }}
              disableRemotePlayback
              disablePictureInPicture
              playsInline
              loop
              muted={isMuted}
            />

            <div
              ref={playPauseRef}
              onClick={() => {
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
                setIsUserPaused(false);
                // Enable unmuting after user interaction
                if (!hasUserInteracted) {
                  setHasUserInteracted(true);
                  setIsMuted(false);
                }
              }}
              className={`${styles["play-pause"]} ${isPlaying ? "" : styles["show-play-pause"]}`}
              style={{ display: isUserPaused ? "flex" : "none" }}
            >
              <ion-icon name="play-outline"></ion-icon>
            </div>

            <div className={styles.foot}>
              <div className={styles["user-info"]}>
                <div>
                  <span>{short.title}</span>
                </div>
              </div>
              {/* <div className={styles.tags}>
                {short.tags
                  ?.map((tag) => `#${tag.toLowerCase().replace(/\s+/g, "")}`)
                  .join(" ")}
              </div> */}
            </div>
          </div>

          <div className={styles.reaction}>
            <div
              onClick={() => {
                handleLikeToggle();
                setHasUserInteracted(true);
              }}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span className={isLiked ? styles.like : styles.unlike}>
                <img
                  src={
                    isLiked
                      ? `${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/liked.svg`
                      : `${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/like-shorts.svg`
                  }
                  alt={isLiked ? "Liked" : "Not Liked"}
                />
              </span>
              <span className={styles.value}>{likesCount}</span>
            </div>

            <div>
              <span onClick={() => {
                setIsMuted((prev) => !prev);
                setHasUserInteracted(true);
              }}>
                <ion-icon
                  name={`volume-${isMuted ? "mute" : "medium"}-outline`}
                ></ion-icon>
              </span>
            </div>

            <div>
              <span onClick={() => {
                toggleSharePopup();
                setHasUserInteracted(true);
              }}>
                <img
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/share-shorts.svg`}
                  alt="Share"
                  style={{ cursor: "pointer", width: "24px", height: "24px" }}
                />
              </span>

              {showShareIcons && (
                <SharePopupPortal
                  url={shareLink}
                  onClose={() => setShowShareIcons(false)}
                  onCopy={() => copyLinkToClipboard(shareLink)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Short;
