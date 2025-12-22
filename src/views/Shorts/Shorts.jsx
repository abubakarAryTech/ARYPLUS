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

  // Memoize fetchShorts to prevent unnecessary re-creations
  const fetchShorts = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        let response;
        if (user) {
          response = await api.get(
            `/api/shorts/user-feed/${user.uid}?page=${pageNum}`,
          );
        } else {
          response = await api.get(
            `/api/shorts?page=${pageNum}`,
          );
        }
        const newShorts = response.data?.data || [];

        // Reset shortsData for page 1 to avoid duplicates
        setShortsData((prev) =>
          pageNum === 1 ? newShorts : [...prev, ...newShorts],
        );
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

  // Debounce loadMore to prevent rapid API calls
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setTimeout(() => {
        setPage((prev) => prev + 1);
      }, 300); // 300ms debounce
    }
  }, [loading, hasMore]);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <main className={styles.main}>
        {user ? <ShortsSidebar user={user} /> : <ShortsSidebar />}
        <ShortContainer
          data={shortsData}
          loading={loading}
          hasMore={hasMore}
          loadMore={loadMore}
          liked={false}
        />
      </main>
    </div>
  );
};

export default ShortCard;
