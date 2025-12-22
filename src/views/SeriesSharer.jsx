import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/ReactLoader';
import BlankSpace from '../components/BlankSpace';

const SeriesSharer = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/sharer/series/${seriesId}`
        );
        
        // Redirect immediately to the series page
        navigate(response.data.shareUrl, { replace: true });
      } catch (error) {
        console.error('Error fetching series data:', error);
        navigate('/', { replace: true });
      }
    };

    if (seriesId) {
      fetchAndRedirect();
    }
  }, [seriesId, navigate]);

  return (
    <>
      <Loader />
      <BlankSpace />
    </>
  );
};

export default SeriesSharer;
