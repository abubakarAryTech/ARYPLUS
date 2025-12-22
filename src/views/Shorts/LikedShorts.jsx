import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import ShortContainer from "../../components/shorts/ShortContainer";
import styles from "./Shorts.module.css";
import { useAuthStore } from "../../stores/useAuthStore";
import ShortsSidebar from "../../components/shorts/ShortsSidebar";
import { getConfig } from "../../../config";
import logger from '../../services/logger';

const ShortCard = () => {
  const [shortsData, setShortsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthStore();
  const config = getConfig();

  const fetchShorts = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        let response;

        if (user) {
          response = await api.get(
            `/api/v2/shorts/likes/${user.uid}/?page=${pageNum}`,
          );
        } else {
          // Fallback if user is not authenticated but this page is accessed
          response = await api.get(
            `/api/v2/shorts?page=${pageNum}`,
          );
        }
        const newShorts = response.data?.data || [];

        // setShortsData(prev => [...prev, ...newShorts]);
        setShortsData((prev) => {
          // If only one item and it already exists, skip adding
          if (
            newShorts.length === 1 &&
            prev.some((item) => {
              const newId = newShorts[0]?._id || newShorts[0]?.short?._id;
              const prevId = item?._id || item?.short?._id;
              return prevId === newId;
            })
          ) {
            return prev;
          }

          return [...prev, ...newShorts];
        });
        setHasMore(newShorts.length > 0);
      } catch (err) {
        logger.error("Failed to fetch shorts data:", err);
        setError("Something went wrong while fetching shorts.");
      } finally {
        setLoading(false);
      }
    },
    [user],
  ); // Dependencies for useCallback

  // Initial fetch and page change handling
  useEffect(() => {
    fetchShorts(page);
  }, [page, fetchShorts]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div>
      {/* <nav className={styles.navbar}>Add commentMore actions
        <div className={styles.nav}>
          <div className={styles["logo-container"]}>
            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`} className={styles.logo} alt="Aryzap Logo" />
          </div>

          <div className={styles["search-container"]}>
            <input
              type="text"
              className={styles.search}
              placeholder="Search accounts and videos"
            />
            <button>
              <ion-icon name="search-outline"></ion-icon>
            </button>
          </div>

          <ul>
            <li>
              <ion-icon name="notifications-outline"></ion-icon>
            </li>
            <li>

              {user && user.photoURL ? (
                                        <img className="avatar-img img-fluid" src={user.photoURL} alt="User Avatar" />
                                      ) : (
                                        <img src={user_img} className="img-fluid" alt="Default Avatar" loading="lazy" />
                                      )}

                                      <span className={`font-size-14 fw-500 ${name && name.includes('@') ? '' : 'text-capitalize'} text-white`}>
                            {user ? <span>{name}</span> : "Guest User"}
                          </span>
              <img
                src="https://images.unsplash.com/photo-1507438222021-237ff73669b5?auto=format&fit=crop&w=200&q=80"
                alt="User Profile"
              />
            </li>
          </ul>
        </div>
      </nav> */}

      <main className={styles.main}>
        {user ? <ShortsSidebar user={user} /> : <ShortsSidebar />}
        <ShortContainer
          data={shortsData}
          loading={loading}
          hasMore={hasMore}
          loadMore={loadMore}
          liked={true}
        />
      </main>
    </div>
  );
};

export default ShortCard;
