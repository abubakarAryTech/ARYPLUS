import { Fragment, memo, useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Nav, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuthStore } from "../stores";
import { useWatchlist } from "../hooks/useWatchlist";
import { useInitializeWatchlist } from "../hooks/useInitializeWatchlist";
import { useWatchHistory } from "../hooks/useWatchHistory";
import BreadCrumbWidget from "../components/BreadcrumbWidget";
import CardStyleHover from "../components/cards/CardStyleHover";
import CardShimmer from "../components/cards/CardShimmer";
import { formatDuration, toTitleCase } from "../utilities/usePage";
import api from "../services/api";
import logger from '../services/logger';
import MainCard from "../components/cards/MainCard";

const SHIMMER_COUNT = 8;
const IMAGE_PATH = import.meta.env.VITE_APP_IMAGE_PATH;

const getSeriesLink = (series) => {
  const { seriesType, ost, _id, seriesLayout } = series;
  
  if (seriesType === "live") return `/live/${ost}/${_id}`;
  if (seriesType === "live-event") return `/live-event/${ost}/${_id}`;
  if (seriesType === "singleVideo") return `/watch/${seriesLayout}/${_id}`;
  return `/series/v3/${_id}`;
};

const MyList = memo(() => {
  const navigate = useNavigate();
  const [favoritesMap, setFavoritesMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [rentedContent, setRentedContent] = useState([]);
  
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { favoriteIds, isFavorite } = useWatchlist();
  const { continueWatching } = useWatchHistory();
  
  useInitializeWatchlist();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fetch rented content
  useEffect(() => {
    let isMounted = true;

    const fetchRentedContent = async () => {
      if (!user?.uid || !user?.subscriptions) {
        setRentalsLoading(false);
        return;
      }

      try {
        setRentalsLoading(true);
        
        const activePackageIds = Object.entries(user.subscriptions)
          .filter(([_, sub]) => sub.subscription_status === "active")
          .map(([packageId]) => packageId);

        if (activePackageIds.length === 0) {
          setRentedContent([]);
          setRentalsLoading(false);
          return;
        }

        const response = await api.get('/api/v2/series/by-packages', {
          params: { packageIds: activePackageIds.join(',') }
        });
        
        if (!isMounted) return;
        setRentedContent(response.data || []);
      } catch (err) {
        if (!isMounted) return;
        logger.error('Error fetching rented content:', err);
      } finally {
        if (isMounted) setRentalsLoading(false);
      }
    };

    fetchRentedContent();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.subscriptions]);

  // Fetch full data once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchAllFavorites = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get(`/api/v2/fav/user/${user.uid}`);
        
        if (!isMounted) return;

        const map = new Map();
        (response.data || []).forEach(item => {
          if (item.seriesId) {
            map.set(item.seriesId._id, item);
          }
        });

        setFavoritesMap(map);
      } catch (err) {
        if (!isMounted) return;
        logger.error('Error fetching favorites:', err);
        setError('Failed to load your list');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllFavorites();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const filteredFavorites = useMemo(() => 
    favoriteIds
      .map(id => favoritesMap.get(id))
      .filter(item => item?.seriesId)
      .sort((a, b) => {
        if (a.seriesId.seriesType === "programs") return 1;
        if (b.seriesId.seriesType === "programs") return -1;
        return 0;
      })
  , [favoriteIds, favoritesMap]);

  const renderShimmers = () => (
    <Row className="row-cols-xl-4 row-cols-md-4 row-cols-2 mb-4">
      {Array.from({ length: SHIMMER_COUNT }).map((_, index) => (
        <Col key={index} className="mb-2 c-padding">
          <CardShimmer />
        </Col>
      ))}
    </Row>
  );

  const renderEmptyState = () => (
    <p className="text-center w-100">
      You haven’t added anything yet — explore and save titles you like.
    </p>
  );

  const renderFavorites = () => (
    <Row className="row-cols-xl-6 row-cols-md-6 row-cols-2 mb-4">
      {filteredFavorites.map((item) => {
        const series = item.seriesId;
        return (
          <Col key={series._id} className="mb-2 c-padding">
            <MainCard
              image={`${IMAGE_PATH}${series.imagePoster}`}
              link={getSeriesLink(series)}
              id={series._id}
              title={series.title}
              seriesType={series.seriesType}
              isFavorite={isFavorite(series._id)}
              episodeCount={series.episodeCount}
              duration={formatDuration(series.duration)}
              genres={series.genresList?.filter(g => g.toLowerCase() !== "telefilms") || []}
              ageRating={series.ageRating}
              trailer={series.trailer}
              packageInfo={series.packageIds}
            />
          </Col>
        );
      })}
    </Row>
  );

  const renderRentals = () => (
    <Row className="row-cols-xl-6 row-cols-md-6 row-cols-2 mb-4">
      {rentedContent.map((series) => (
        <Col key={series._id} className="mb-2 c-padding">
          <MainCard
            image={`${IMAGE_PATH}${series.imagePoster}`}
            link={getSeriesLink(series)}
            id={series._id}
            title={series.title}
            seriesType={series.seriesType}
            isFavorite={isFavorite(series._id)}
            episodeCount={series.episodeCount}
            duration={formatDuration(series.duration)}
            genres={series.genresList?.filter(g => g.toLowerCase() !== "telefilms") || []}
            ageRating={series.ageRating}
            trailer={series.trailer}
            packageInfo={series.packageIds}
          />
        </Col>
      ))}
    </Row>
  );

  const renderWatchHistory = () => (
    <Row className="row-cols-xl-6 row-cols-md-6 row-cols-2 mb-4">
      {continueWatching.map((item) => {
        const series = item.series;
        if (!series) return null;
        return (
          <Col key={series._id} className="mb-2 c-padding">
            <MainCard
              image={`${IMAGE_PATH}${series.imagePoster}`}
              link={getSeriesLink(series)}
              id={series._id}
              title={series.title}
              seriesType={series.seriesType}
              isFavorite={isFavorite(series._id)}
              episodeCount={series.episodeCount}
              duration={series.duration ? formatDuration(series.duration) : null}
              genres={series.genresList?.filter(g => g.toLowerCase() !== "telefilms") || series.genreId || []}
              ageRating={series.ageRating}
              trailer={series.trailer}
              packageInfo={series.packageIds}
            />
          </Col>
        );
      })}
    </Row>
  );

  return (
    <Fragment>
      <Helmet>
        <title>{toTitleCase("My Library")}</title>
      </Helmet>
      
      <BreadCrumbWidget title="My Library" />
      
      <div
                className="position-fixed"
                style={{
                  top: -150,
                  left: -350,
                  width: "700px",
                  height: "700px",
                  background:
                    "radial-gradient(circle, rgba(209, 253, 21, 0.12) 0%, transparent 50%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              ></div>
              <div
                className="position-fixed"
                style={{
                  top: "70%",
                  right: -350,
                  transform: "translateY(-50%)",
                  width: "700px",
                  height: "700px",
                  background:
                    "radial-gradient(circle, rgba(209, 253, 21, 0.12) 0%, transparent 50%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              ></div>
              
      <div className="section-paddingv2">
        <Container fluid>
          <div className="iq-custom-tab-style-two tab-bottom-bordered myLibrary-tabs">
            <Tab.Container id="my-library-tabs" defaultActiveKey="rentals">
              <Nav variant="pills" className="nav nav-tabs nav-pills mb-3 overflow-x-scroll border-0">
                <Nav.Item>
                  <Nav.Link eventKey="rentals">My Rental ({rentedContent.length})</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">My Watchlist ({continueWatching.length})</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="mylist">My Favourite ({filteredFavorites.length})</Nav.Link>
                </Nav.Item>
              </Nav>
              
              <Tab.Content className="tab-content trending-content p-4">
                {/* My Rentals Tab */}
                <Tab.Pane eventKey="rentals">
                  <div className="card-style-grid">
                    {rentalsLoading && renderShimmers()}
                    {!rentalsLoading && rentedContent.length === 0 && <p className="text-center w-100">No rentals yet</p>}
                    {!rentalsLoading && rentedContent.length > 0 && renderRentals()}
                  </div>
                </Tab.Pane>
                
                {/* My List Tab */}
                <Tab.Pane eventKey="mylist">
                  <div className="card-style-grid">
                    {isLoading && renderShimmers()}
                    {!isLoading && error && <p className="text-center text-danger">{error}</p>}
                    {!isLoading && !error && filteredFavorites.length === 0 && renderEmptyState()}
                    {!isLoading && !error && filteredFavorites.length > 0 && renderFavorites()}
                  </div>
                </Tab.Pane>
                
                {/* Watch History Tab */}
                <Tab.Pane eventKey="history">
                  <div className="card-style-grid">
                    {continueWatching.length === 0 && <p className="text-center w-100">You haven't watched anything yet.</p>}
                    {continueWatching.length > 0 && renderWatchHistory()}
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

MyList.displayName = "MyList";
export default MyList;
