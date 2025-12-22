import React, { useRef, useState, useEffect, useCallback } from "react";
import Short from "./Short";
import styles from "../../views/Shorts/Shorts.module.css";
import { ThreeDot } from "react-loading-indicators";
import { useNavigate } from "react-router-dom";
import logger from '../../services/logger';

// Memoize Short to prevent unnecessary re-renders
const MemoizedShort = React.memo(Short);

function ShortContainer({ data, loading, hasMore, loadMore, liked , single=false}) {
  // logger.log('shortsData: ', data);
  const shortContainerRef = useRef();
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track user interaction
  const navigate = useNavigate();

  // Throttle scroll handler to reduce event frequency
  const handleScroll = useCallback(() => {
    if (!shortContainerRef.current || loading || !hasMore || data.length === 1)
      return;

    const scrollTop = shortContainerRef.current.scrollTop;
    const scrollHeight = shortContainerRef.current.scrollHeight;
    const clientHeight = shortContainerRef.current.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  }, [loading, hasMore, loadMore, data.length]);

  // Scroll event listener setup
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    document.documentElement.style.overflowY = "hidden";

    const container = shortContainerRef.current;
    let scrollTimeout;

    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 200); // 200ms throttle
    };

    container.addEventListener("scroll", throttledScroll);

    return () => {
      document.body.style.overflowY = "auto";
      document.documentElement.style.overflowY = "auto";
      container.removeEventListener("scroll", throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll]);

  return (
    <>
      <section ref={shortContainerRef} className={styles["short-container"]}>
        {data.length === 0 && loading ? (
          <div className="text-center">
            <ThreeDot color="#A7CA11" size="medium" text="" textColor="" />
            <p>Loading shorts...</p>
          </div>
        ) : (
          data.map((item, index) => {
            const shortData = item?.short || item;
            return (
              <MemoizedShort
                key={item?._id || item?.short?._id}
                shortContainerRef={shortContainerRef}
                short={shortData}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                hasUserInteracted={hasUserInteracted}
                setHasUserInteracted={setHasUserInteracted}
                isFirst={index === 0}
              />
            );
          })
        )}
        {loading && hasMore && data.length > 0 && (
          <div className="text-center">
            <ThreeDot color="#A7CA11" size="medium" text="" textColor="" />
          </div>
        )}
        { ! single && !hasMore && (
          <div className="text-center">
            {liked ? (
              <>
                <h5>You haven't liked any snips yet!</h5>
                <p>
                  Browse and like your favorite snips to save them here for
                  later!
                </p>
              </>
            ) : (
              <>
                <h5>You've reached the end!</h5>
                <p>That's all for now. Come back soon for more fun shorts.</p>
              </>
            )}
          </div>
        )}
      </section>
      {single && (
        <div className={styles.exploreMoreFixed}>
          <a
            // className={styles.exploreMoreBtn}
            // className="font-size-14 btn newbtn fw-500 text-white d-md-none"
            onClick={() => navigate('/shorts')}
          >
            Explore More
          </a>
        </div>
      )}
      {data.length > 1 && (
        <div className={styles["navigation-container"]}>
          <div
            onClick={() => {
              shortContainerRef.current.scrollTo(
                0,
                shortContainerRef.current.scrollTop - window.innerHeight,
              );
            }}
            className={styles["nav-up"]}
          >
            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/nav-up.svg`} alt="Nav up" />
          </div>
          <div
            onClick={() => {
              shortContainerRef.current.scrollTo(
                0,
                shortContainerRef.current.scrollTop + window.innerHeight,
              );
            }}
            className={styles["nav-down"]}
          >
            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/nav-down.svg`} alt="Nav down" />
          </div>
        </div>
      )}
      
    </>
  );
}

export default ShortContainer;
