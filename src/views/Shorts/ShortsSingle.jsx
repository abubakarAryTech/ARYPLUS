import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import ShortContainer from "../../components/shorts/ShortContainer";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import styles from "./Shorts.module.css";
import ShortsSidebar from "../../components/shorts/ShortsSidebar";
import { getConfig } from "../../../config";
import logger from '../../services/logger';

const ShortSingle = () => {
  const { id } = useParams(); // This should be the _id from the API
  const [shortsData, setShortsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const config = getConfig();

  const fetchShorts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${config.appApiHomeEndpoint}/api/shorts/${id}`,
      );
      setShortsData(response.data?.data || []);
    } catch (err) {
      logger.error("Failed to fetch shorts data:", err);
      setError("Something went wrong while fetching shorts.");
    } finally {
      setLoading(false);
    }
  }, [id, config.appApiHomeEndpoint]);

  useEffect(() => {
    const fetchSingleShort = async () => {
      try {
        // User is now available from useAuthStore

        let allShorts = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await api.get(
            `${config.appApiHomeEndpoint}/api/shorts?page=${page}`,
          );

          const shorts = response.data?.data || [];
          allShorts = [...allShorts, ...shorts];
          hasMore = shorts.length > 0;
          page++;
        }

        if (id) {
          const matchedShort = allShorts.find((short) => short._id === id);

          if (matchedShort) {
            // alert(`Matched ID: ${matchedShort._id}\nTitle: ${matchedShort.title || "(No Title)"}`);

            // Show matched short first + full list (with duplicate)
            setShortsData([matchedShort, ...allShorts]);
          } else {
            setShortsData(allShorts);
          }
        } else {
          setError("Short not found");
        }
      } catch (err) {
        logger.error("Failed to fetch short data:", err);
        setError("Something went wrong while fetching the short.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleShort();
  }, [id]);

  if (loading) return <p>Loading short...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <main className={styles.main}>
        {user ? <ShortsSidebar user={user} /> : <ShortsSidebar />}

        <ShortContainer
          data={shortsData}
          loading={loading}
          hasMore={false}
          single={true}
          loadMore={() => {}}
        />
      </main>
    </div>
  );
};

export default ShortSingle;
