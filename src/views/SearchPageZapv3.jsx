import { Fragment, memo, useEffect, useState, useCallback, useRef } from 'react';
import { Container, Row, Col, Tab, Nav } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import BreadCrumbWidget from '../components/BreadcrumbWidget';
import LeaderboardInner from '../Ads/LeaderboardInner';
import CardStyleHover from '../components/cards/CardStyleHover';
import CardStyleHoverMobile from '../components/cards/CardStyleHoverMobile';
import CardShimmer from '../components/cards/CardShimmer';
import { formatDuration } from '../utilities/usePage';
import { useWatchlist } from '../hooks/useWatchlist';
import { fetchLocation } from '../utilities/locationManager';
import { useAuthStore } from '../stores/useAuthStore';
import api from '../services/api';
import logger from '../services/logger';
import '../assets/scss/SearchBar.css';
import MainCard from '../components/cards/MainCard';

const SearchPagev3 = memo(() => {
  const { query } = useParams();
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [datas, setDatas] = useState(null);
  const [popularDramas, setPopularDramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(window.innerWidth);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isFavorite } = useWatchlist();
  const { user } = useAuthStore();

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

  const fetchSearchResults = useCallback(async () => {
    if (!query) return;
    
    try {
      setIsLoading(true);
      const payload = { query };
      if (user?.uid) {
        payload.uid = user.uid;
      }

      const response = await api.post('/api/v2/search', payload);
      const result = response.data;

      const updatedResult = {
        ...result,
        series: result.series.map((item) => ({
          ...item,
          seriesLayout: 'v3',
        })),
      };

      setDatas(updatedResult);
      console.log('✅ Search results from: Semantic Engine Service');
    } catch (error) {
      logger.error('Semantic search failed, falling back to basic search:', error);
      
      try {
        const fallbackResponse = await api.get(`/api/search/${query}`);
        const fallbackResult = fallbackResponse.data;
        
        const updatedFallbackResult = {
          ...fallbackResult,
          series: fallbackResult.series?.map((item) => ({
            ...item,
            seriesLayout: 'v3',
          })) || [],
        };
        
        setDatas(updatedFallbackResult);
        console.log('⚠️ Search results from: Basic Search Fallback');
      } catch (fallbackError) {
        logger.error('Basic search also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, user]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    if (query) {
      fetchSearchResults();
    } else {
      fetchPopularDramas();
    }
  }, [query, fetchSearchResults, fetchPopularDramas]);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const getLink = (item) => {
    if (item.seriesType === "live") return `/live/v1/${item._id}`;
    if (item.seriesType === "live-event") return `/live-event/v1/${item._id}`;
    if (item.seriesType === "singleVideo") return `/watch/v1/${item._id}`;
    if (item.cdnPlatform === "dm") return `/series/v2/${item._id}`;
    if (item.cdnPlatform === "yt") return `/series/v1/${item._id}`;
    return `/series/v3/${item._id}`;
  };

  const renderSection = (type, title, sub_type) => {
    const categoryMap = {
      ost: "6830697d9a994b82609a46ce",
      podcasts: "681dd6e17b05b7960e8b7fe6",
      telefilms: "681dc512678646bca02cbc2b",
    };
    
    if (!datas || !datas.series) return null;

    const filteredItems = datas.series.filter((item) => {
      switch (type) {
        case "show":
          return item.seriesType === "show";
        case "live":
          return item.seriesType === "live" || item.seriesType === "live-event";
        case "programs":
          return item.seriesType === "programs";
        case "singleVideo":
          return (
            item.seriesType === "singleVideo" &&
            item.categoryId?.[0] === categoryMap[sub_type]
          );
        case "all":
          return [
            "show",
            "live",
            "live-event",
            "programs",
            "singleVideo",
          ].includes(item.seriesType);
        default:
          return item.seriesType === type;
      }
    });

    if (filteredItems.length === 0)
      return <p style={{ color: '#fff' }}>We couldn't find anything here related to your search</p>;

    return (
      <Row className="row-cols-xl-6 row-cols-md-6 row-cols-2">
        {filteredItems.map((item, index) => (
          <Col key={index} className="mb-2 c-padding">
            {width > 768 ? (
              <MainCard
                image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePoster}`}
                link={getLink(item)}
                id={item._id}
                title={item.title}
                seriesType={item.seriesType}
                name={item.name}
                isFavorite={isFavorite(item._id)}
                episodeCount={item.episodeCount}
                genres={item?.genresList?.filter(
                  (genre) => genre.toLowerCase() !== "telefilms",
                )}
                ageRating={item.ageRating}
                trailer={item.trailer}
                duration={formatDuration(item.duration)}
                packageInfo={item.packageIds}
              />
            ) : (
              <CardStyleHoverMobile
                image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                link={getLink(item)}
                id={item._id}
                title={item.title}
                seriesType={item.seriesType}
                isFavorite={isFavorite(item._id)}
                episodeCount={item.episodeCount}
                duration={item.duration}
                genres={item?.genresList || []}
                ageRating={item.ageRating}
                trailer={item.trailer}
                packageInfo={item.packageIds || []}
              />
            )}
          </Col>
        ))}
      </Row>
    );
  };

   const renderCast = () => {
      if (!datas || !datas.cast) return null;
  
      const filteredItemsCast = datas.cast;
  
      if (filteredItemsCast.length === 0) return null;
  
      return (
        <div>
          <div
            className="d-flex align-items-end justify-content-between mb-2 mt-4"
            style={{ zIndex: 10 }}
          >
            {/* <h5 className="main-title text-capitalize mb-0 fw-bolder">{title}</h5> */}
  
            {/* <Link
                  to={'link ? link : `/view-all/${type}/${title}`'}
                  className="iq-view-all text-decoration-none text-light btn btn-primary  view-all-btn "
                >
                  View All
                </Link> */}
          </div>
  
          <Row className="row row-cols-xl-6 row-cols-md-6 row-cols-2">
            {filteredItemsCast.slice(0, 15).map(
              (items, index) =>
                items !== "null" && (
                  <Col key={index} className="mb-3">
                    <div className="cast">
                      {/* <Link
                      to={`/cast-view-all/${items}/`}
                      className="iq-view-all text-decoration-none text-light btn btn-primary  view-all-btn "
                    > */}
  
                      <Link
                        to={`/cast-view-all/${items}/`}
                        className="cast-btn btn btn-primary view-all-btn text-decoration-none"
                      >
                        {items}
                      </Link>
                      {/* <PersonalityCard
                      image={`/assets/images/cast/${items}.png`}
                      title={items}
                      categoryLink="#"
                      link={`/cast-view-all/${items}`}
                      name={items}
                    /> */}
                    </div>
                  </Col>
                ),
            )}
          </Row>
        </div>
      );
    };

  return (
    <Fragment>
      <Helmet>
        <title>{query ? `Search: ${query}` : 'Search'}</title>
      </Helmet>
      <div
                className="position-absolute"
                style={{
                  top: -250,
                  left: -250,
                  width: "700px",
                  height: "700px",
                  background:
                    "radial-gradient(circle, rgba(209, 253, 21, 0.12) 0%, transparent 50%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              ></div>
      <motion.div 
        className="search-modal-container"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
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
              onClick={handleBack}
              className="search-cancel-button"
            >
              Cancel
            </button>
          </form>
        </div>
        
        <div className="search-content">
          <Container>
            {/* {query && datas?.series?.length > 0 && (
              <BreadCrumbWidget title={`Search Results — ${query}`} />
            )}
             */}
            {isLoading ? (
              <>
                <h3 className="popular-title">
                  {query ? `Searching for "${query}"...` : 'Loading Popular Dramas...'}
                </h3>
                <Row className="row-cols-xl-4 row-cols-md-4 row-cols-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Col key={index} className="mb-2 c-padding">
                      <CardShimmer height={width > 768 ? 160 : 250} />
                    </Col>
                  ))}
                </Row>
              </>
            ) : query && datas && datas.series?.length === 0 ? (
              <div className="text-center py-5">
                <h3 className="popular-title">No Results Found</h3>
                <p style={{ color: '#fff' }}>We couldn't find anything related to your search for "{query}"</p>
                <p style={{ color: '#fff' }}>Please try a different search term and try again</p>
              </div>
            ) : query && datas && datas.series?.length > 0 ? (
              <div className="tab-block bg-transparent">
                <div className="tab-bottom-bordered border-0 trending-custom-tab search-nav">
                  <Tab.Container id="search-tabs" defaultActiveKey="all">
                    <Nav variant="pills" className="nav nav-tabs nav-pills mb-3 overflow-x-scroll border-0">
                      <Nav.Item><Nav.Link eventKey="all">All</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="dramas">Dramas</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="tv-shows">TV Shows</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="ost">OST</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="podcast">Podcast</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="telefilms">TeleFilms</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="live">Live</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="cast">Cast</Nav.Link></Nav.Item>
                    </Nav>
                    
                    <Tab.Content className="tab-content trending-content">
                      <Tab.Pane eventKey="all">
                        {renderSection("all", "ALL")}
                        {renderCast()}
                      </Tab.Pane>
                      <Tab.Pane eventKey="dramas">{renderSection("show", "PROGRAMS")}</Tab.Pane>
                      <Tab.Pane eventKey="tv-shows">{renderSection("programs", "SHOWS")}</Tab.Pane>
                      <Tab.Pane eventKey="live">{renderSection("live", "PROGRAMS AND SHOWS")}</Tab.Pane>
                      <Tab.Pane eventKey="cast">{renderCast()}</Tab.Pane>
                      <Tab.Pane eventKey="ost">{renderSection("singleVideo", "OST", "ost")}</Tab.Pane>
                      <Tab.Pane eventKey="podcast">{renderSection("singleVideo", "Podcasts", "podcasts")}</Tab.Pane>
                      <Tab.Pane eventKey="telefilms">{renderSection("singleVideo", "Telefilms", "telefilms")}</Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
              </div>
            ) : (
              <>
                <h3 className="popular-title">Popular</h3>
                <Row className="row-cols-xl-6 row-cols-md-6 row-cols-2">
                  {popularDramas.map((item) => (
                    <Col key={item._id} className="mb-2 c-padding">
                      {width > 768 ? (
                        <MainCard
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePoster}`}
                          link={getLink(item)}
                          id={item._id}
                          title={item.title}
                          seriesType={item.seriesType}
                          isFavorite={isFavorite(item._id)}
                          episodeCount={item.episodeCount}
                          duration={formatDuration(item.duration)}
                          genres={item.genreId?.filter(
                            (genre) => genre.toLowerCase() !== "telefilms",
                          ) || []}
                          ageRating={item.ageRating}
                          trailer={item.trailer}
                          packageInfo={item.packageIds || []}
                        />
                      ) : (
                        <CardStyleHoverMobile
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                          link={getLink(item)}
                          id={item._id}
                          title={item.title}
                          seriesType={item.seriesType}
                          isFavorite={isFavorite(item._id)}
                          episodeCount={item.episodeCount}
                          duration={item.duration}
                          genres={item.genreId || []}
                          ageRating={item.ageRating}
                          trailer={item.trailer}
                          packageInfo={item.packageIds || []}
                        />
                      )}
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Container>
        </div>
      </motion.div>
    </Fragment>
  );
});


SearchPagev3.displayName = "SearchPagev3";
export default SearchPagev3;