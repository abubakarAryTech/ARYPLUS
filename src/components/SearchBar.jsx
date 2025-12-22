import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import CardStyleHover from './cards/CardStyleHover';
import CardStyleHoverMobile from './cards/CardStyleHoverMobile';
import CardShimmer from './cards/CardShimmer';
import { formatDuration } from '../utilities/usePage';
import { useWatchlist } from '../hooks/useWatchlist';
import { fetchLocation } from '../utilities/locationManager';
import '../assets/scss/SearchBar.css';

const SearchBar = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularDramas, setPopularDramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(window.innerWidth);
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const { isFavorite } = useWatchlist();

  const fetchPopularDramas = useCallback(async () => {
    try {
      setIsLoading(true);
      const location = await fetchLocation();
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/series/byCatID/status/pg/dramas/${location}?limit=12&page=1`
      );
      const data = await response.json();
      setPopularDramas(data.series || []);
    } catch (error) {
      console.error('Error fetching popular dramas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      fetchPopularDramas();
    }
  }, [isOpen, fetchPopularDramas]);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      onClose();
    }
  };

  const handleCancel = () => {
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-container" ref={searchContainerRef} onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-wrapper">
              <img 
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/search.svg`}
                alt="Search"
                className="search-icon-left"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any dramas, film and shows"
                className="search-input"
              />
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="clear-button"
              >
                <img 
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/cross.svg`}
                  alt="Clear"
                />
              </button>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel
            </button>
          </form>
        </div>
        
        <div className="search-content">
          <Container>
            <h3 className="popular-title">Most Popular In Your Region</h3>
            {isLoading ? (
              <Row className="row-cols-xl-4 row-cols-md-4 row-cols-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Col key={index} className="mb-2 c-padding">
                    <CardShimmer height={width > 768 ? 160 : 250} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Row className="row-cols-xl-4 row-cols-md-4 row-cols-2">
                {popularDramas.map((drama) => {
                  const getLink = () => {
                    if (drama.seriesType === "live") return `/live/${drama.seriesLayout}/${drama._id}`;
                    if (drama.seriesType === "live-event") return `/live-event/${drama.seriesLayout}/${drama._id}`;
                    if (drama.seriesType === "singleVideo") return `/watch/${drama.seriesLayout}/${drama._id}`;
                    if (drama.cdnPlatform === "dm") return `/series/v2/${drama._id}`;
                    if (drama.cdnPlatform === "yt") return `/series/v1/${drama._id}`;
                    return `/series/v3/${drama._id}`;
                  };
                  
                  return (
                    <Col key={drama._id} className="mb-2 c-padding">
                      {width > 768 ? (
                        <CardStyleHover
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${drama.imageCoverBig}`}
                          link={getLink()}
                          id={drama._id}
                          title={drama.title}
                          seriesType={drama.seriesType}
                          isFavorite={isFavorite(drama._id)}
                          episodeCount={drama.episodeCount}
                          duration={formatDuration(drama.duration)}
                          genres={drama.genreId?.filter(
                            (genre) => genre.toLowerCase() !== "telefilms",
                          ) || []}
                          ageRating={drama.ageRating}
                          trailer={drama.trailer}
                          packageInfo={drama.packageIds || []}
                        />
                      ) : (
                        <CardStyleHoverMobile
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${drama.imageCoverBig}`}
                          link={getLink()}
                          id={drama._id}
                          title={drama.title}
                          seriesType={drama.seriesType}
                          isFavorite={isFavorite(drama._id)}
                          episodeCount={drama.episodeCount}
                          duration={drama.duration}
                          genres={drama.genreId || []}
                          ageRating={drama.ageRating}
                          trailer={drama.trailer}
                          packageInfo={drama.packageIds || []}
                        />
                      )}
                    </Col>
                  );
                })}
              </Row>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;