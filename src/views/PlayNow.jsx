import React, { memo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import logger from '../services/logger';
import { useAuthStore } from "../stores/useAuthStore";
import { isTvodEnabled } from "../utilities/tvodHelper";

const PlayNow = memo(() => {
  const { seriesId } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUserSubscriptionData = useAuthStore((state) => state.updateUserSubscriptionData);
  const checkSubscription = useAuthStore((state) => state.checkSubscription);
  const tvodEnabled = isTvodEnabled();

  useEffect(() => {
    if (!seriesId) {
      setLoading(false);
      logger.warn("Navigation error: series ID parameter missing from route");
      return;
    }

    const fetchEpisode = async () => {
      try {
        // Refresh user subscriptions first if user is authenticated
        if (user) {
          await updateUserSubscriptionData();
        }
        
        const response = await api.get(
          `/api/cdn/${seriesId}`
        );
        const data = response.data;
        
        // Get series details to check package requirements
        const seriesResponse = await api.get(`/api/series/${seriesId}`);
        const seriesData = seriesResponse.data;
        const packageIds = seriesData.packageIds;

        if (data?.episode?.length > 0) {
          const firstEpisode = data.episode[0];
          const ep1Id = firstEpisode._id;
          
          // Check if user needs subscription for this content
          if (tvodEnabled && user && packageIds && packageIds.length > 0) {
            const hasSubscription = packageIds.some(packageId => checkSubscription(packageId));
            
            if (!hasSubscription) {
              // Redirect to TVOD page if no valid subscription
              navigate(`/Tvod/${seriesId}`);
              return;
            }
          }
          
          // User has access, proceed to video
          navigate(`/video/v1/3/${ep1Id}/${seriesId}`);
        } else {
          logger.error("Content error: no episodes available for this series");
        }
      } catch (error) {
        logger.error("Failed to fetch episodes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [seriesId]);

  return <div>{loading && <p>Loading...</p>}</div>;
});

PlayNow.displayName = "PlayNow";
export default PlayNow;
