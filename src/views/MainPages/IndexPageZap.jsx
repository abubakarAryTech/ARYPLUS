import React, {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  memo,
  useRef,
} from "react";
import HomeHeroSlider from "../../components/slider/HomeHeroSlider";
import SectionSlider from "../../components/slider/SectionSlider";
import { Helmet } from "react-helmet";
import { formatDuration, useEnterExit } from "../../utilities/usePage";
import { useAuthStore } from "../../stores/useAuthStore";
import Leaderboard from "../../Ads/Leaderboard";
import toast, { Toaster } from "react-hot-toast";
import { getConfig } from "../../../config";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useInitializeWatchlist } from "../../hooks/useInitializeWatchlist";
import { useWatchHistory } from "../../hooks/useWatchHistory";
import TopTenCard from "../../components/cards/TopTenCard";
import ContinueWatchCard from "./../../components/cards/ContinueWatchCard";
import ParallexSection from "../../components/sections/ParallexSectionv2";
import PersonalityCard from "../../components/cards/PersonalityCard";
import CardStyleHover from "../../components/cards/CardStyleHover";
import MainCard from "../../components/cards/MainCard";
import CardStyleOST from "../../components/cards/CardStyleOST";
import Splash from "../../components/animation/Splash";
import CardStyleHoverMobile from "../../components/cards/CardStyleHoverMobile";
import CardShimmer from "../../components/cards/CardShimmer";
import Loader from "../../components/Loader";
import ContinueWatchCardNew from "../../components/cards/ContinueWatchCardNew";
import ServiceDownPage from "../ExtraPages/ServiceDownPage";
import ARYZAPLoader from "../../components/ARYZAPLoader";
import api from "../../services/api";
import axios from "axios";
import { cacheManager } from "../../utilities/cacheManager";
import { fetchLocation as getLocation } from "../../utilities/locationManager";
import logger from '../../services/logger';

const AuthContext = createContext();

const HomePage = memo(({ children }) => {
  const config = getConfig();
  const user = useAuthStore(state => state.user);
  
  // Initialize with cache if available (without location dependency)
  const getInitialData = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('v1_home_data_'));
    if (keys.length > 0) {
      const cached = cacheManager.get(keys[0].replace('v1_', ''));
      return cached ? cached.data : null;
    }
    return null;
  };
  
  const [homeData, setHomeData] = useState(getInitialData);
  const [isLoading, setIsLoading] = useState(!getInitialData());
  const [location, setLocation] = useState(null);
  const { isFavorite } = useWatchlist();
  const { continueWatching: continueWatchingData } = useWatchHistory();
  useInitializeWatchlist();
  const [recommendedForYouData, setRecommendedForYouData] = useState([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [hasRecommendedLoaded, setHasRecommendedLoaded] = useState(false);
  const recommendedCallRef = useRef(false);
  const [showSplash, setShowSplash] = useState(!getInitialData());
  const [width, setWidth] = useState(window.innerWidth);
  const [apiError, setApiError] = useState(false);
  const apiCallsRef = useRef({ favorites: false, watchHistory: false, homeData: false });
  const pageLoadStartTime = useRef(performance.now());

  useEnterExit();

  const title = "ARY PLUS - A Video Streaming Portal";
  const description = "ARYZAP.com is a video streaming platform...";





  const fetchRecommendedForYou = useCallback(async () => {
    if (!user?.uid || recommendedCallRef.current) return;

    recommendedCallRef.current = true;
    try {      
      const currentHour = new Date().getHours();
      const response = await axios.get(
        `${import.meta.env.VITE_RC_API_URL}/rc/vdb/recommend/${user.uid}?hour=${currentHour}`,
        {
          headers: {
            'x-api-key': import.meta.env.VITE_RC_X_API_KEY,
          },
        }
      );
  
      const { recommendations } = response.data;
  
      const formatted = recommendations.map((rec) => ({
        series: rec.series_data,
        seriesId: rec.series_data._id,
        title: rec.title,
        description: rec.description,
        similarity_score: rec.similarity_score,
        updatedAt: rec.series_data.publishedAt,
        episodeWatchHistory: [
          {
            currentTime: 0,
            metadata: { episode: { videoLength: 0, videoEpNumber: null } },
          },
        ],
      }));
  
      setRecommendedForYouData(formatted);
      setHasRecommendedLoaded(true);
      logger.log('✅ Recommendations API call completed');
    } catch (error) {
      logger.error("Error fetching recommendations", error);
      recommendedCallRef.current = false;
    } finally {
      setIsRecommendedLoading(false);
    }
  }, [user?.uid]);



  const fetchLocation = useCallback(async () => {
    const countryCode = await getLocation();
    setLocation(countryCode);
    return countryCode;
  }, []);

  const fetchData = useCallback(async (loc, forceRefresh = false) => {
    const cacheKey = `home_data_${loc}`;
    
    // Check cache first
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      
      if (cached) {
        // Fresh cache - use immediately, no API call
        if (cached.isFresh) {
          setHomeData(cached.data);
          setIsLoading(false);
          logger.log('✅ Using fresh cache (no API call)');
          return;
        }
        
        // Stale cache - show immediately, fetch in background
        if (cached.isStale) {
          setHomeData(cached.data);
          setIsLoading(false);
          logger.log('⚡ Using stale cache, refreshing in background...');
          // Continue to fetch fresh data below
        }
        
        // Expired cache - fetch fresh
        if (cached.isExpired) {
          logger.log('🔄 Cache expired, fetching fresh data...');
        }
      }
    }

    // Fetch fresh data (with request deduplication)
    try {
      const result = await cacheManager.deduplicateRequest(
        cacheKey,
        async () => {
          const resp = await api.get(
            `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/homev2/v2/${import.meta.env.VITE_BUILDER_ID}/${loc}`
          );
          return resp.data.home;
        }
      );

      setHomeData(result);
      cacheManager.set(cacheKey, result);
      setApiError(false);
      logger.log('✅ Fresh data fetched and cached');
      
    } catch (error) {
      logger.error("Error fetching home data:", error);
      
      // Fallback to any cached data (even expired)
      const cached = cacheManager.get(cacheKey);
      if (cached && !homeData) {
        setHomeData(cached.data);
        logger.log('⚠️ Using expired cache due to API error');
      } else {
        setApiError(true);
      }
      apiCallsRef.current.homeData = false;
    } finally {
      setIsLoading(false);
    }
  }, [homeData]);

  const { remove: removeFromHistory } = useWatchHistory();
  const handleRemoveFromHistory = useCallback((seriesId) => {
    removeFromHistory(seriesId);
  }, [removeFromHistory]);

  const handleRemoveFromRecommended = useCallback((seriesId) => {
    setRecommendedForYouData((prev) =>
      prev.filter((item) => item.series?._id !== seriesId),
    );
  }, []);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    const initialize = async () => {
      const finalLoc = location || (await fetchLocation());
      if (finalLoc) await fetchData(finalLoc);
    };
    
    initialize();
  }, [location, fetchLocation, fetchData]);

  // Listen for cache updates from other tabs
  useEffect(() => {
    const unsubscribe = cacheManager.onUpdate((key) => {
      if (key.startsWith('home_data_') && location) {
        const cached = cacheManager.get(`home_data_${location}`);
        if (cached) {
          setHomeData(cached.data);
          logger.log('🔄 Cache updated from another tab');
        }
      }
    });

    return unsubscribe;
  }, [location]);

  // Cleanup old cache on mount
  useEffect(() => {
    cacheManager.cleanup();
  }, []);

  let parallaxRendered = false;

  // Memoize `homeData` mapping
  const renderHomeData = useMemo(
    () =>
      homeData?.homeData?.map((item, i) => (
        <Fragment key={i}>
          {item.type === "ImageSlider" && (
            <>
              <HomeHeroSlider
                list={item.data.slider.sliderData}
                width={width}
                // favorites={favorites}
                user={user}
              />
              <Leaderboard />
            </>
          )}

          {item.type === "cta" && item.data.isLogin === true && user ? (
            <ParallexSection
              title={item.data.title}
              image={item.data.image}
              icon={item.data.icon}
              buttonName={item.data.buttonName}
              buttonAction={item.data.buttonAction}
              isLogin={item.data.isLogin}
            />
          ) : null}

          {item.type === "cta" && item.data.isLogin === false && !user ? (
            <ParallexSection
              title={item.data.title}
              image={item.data.image}
              icon={item.data.icon}
              buttonName={item.data.buttonName}
              buttonAction={item.data.buttonAction}
              isLogin={item.data.isLogin}
            />
          ) : null}

          {item.type === "Category" && item.data.series?.length > 0 && (
            <SectionSlider
              ViewAll={false}
              title={item.name}
              index={i}
              list={
                item.name === "TOP 10 PICKS"
                  ? item.data.series.map((data, index) => ({
                      ...data,
                      countValue: index + 1,
                    }))
                  : item.data.series
              }
              type={item.type}
              className="upcomimg-block streamit-block main-sections recommended-block"
              slidesPerView={
                item.name === "SHOWS"
                  ? "7"
                  : item.name === "LIVE STREAMING"
                    ? "7"
                    : item.name === "TELEFILMS"
                      ? "7"
                      : item.name === "CASTS"
                        ? "7"
                        : item.name === "OST"
                          ? "5"
                          : item.name === "TOP 10 PICKS"
                            ? "5"
                            : "7"
              }
            >
              {(data) => {
                const isTopTen = item.name === "TOP 10 PICKS";
                const isLatest = item.name === "Dramas";
                const isPopular = item.name === "MOST POPULAR IN YOUR REGION";
                const isTelefilms = item.name === "TELEFILMS";
                const commonLink =
                  data.seriesType === "live"
                    ? `/live/${data.seriesLayout}/${data._id}`
                    : data.seriesType === "live-event"
                      ? `/live-event/${data.seriesLayout}/${data._id}`
                      : data.seriesType === "singleVideo"
                        ? `/watch/${data.seriesLayout}/${data._id}`
                        : data.cdnPlatform === "dm"
                          ? `/series/v2/${data._id}`
                          : data.cdnPlatform === "yt"
                            ? `/series/v1/${data._id}`
                            : `/series/v3/${data._id}`;

                const imageBase = `${import.meta.env.VITE_APP_IMAGE_PATH}`;

                if (isTopTen) {
                  return isLoading ? (
                    <CardShimmer />
                  ) : (
                    <TopTenCard
                      imagePath={`${imageBase}${data.imagePoster}`}
                      countValue={data.countValue}
                      link={commonLink}
                    />
                  );
                }

                const isShowOrLive =
                  item.name === "SHOWS" || item.name === "Live Streaming";
                const isOST = item.name === "OST";
                const image = `${imageBase}${isOST ? (data.imageCoverExtra || data.imageCoverBig) : data.imageCoverBig}`;

                // const image = `${imageBase}${isShowOrLive ? data.imageCoverBig : data.imageCoverBig}`;
                // const hoverImage = `${imageBase}${data.imageCoverBig}`;

                const hoverImage = `${imageBase}${isOST ? data.imageCoverMobile : data.imageCoverBig}`;

                if (isPopular) {
                  if (width > 768) {
                    return isLoading ? (
                      <CardShimmer />
                    ) : (
                      <MainCard
                        image={`${imageBase}${data.imagePoster}`}
                        seriesType={data.seriesType}
                        id={data._id}
                        title={data.title}
                        isFavorite={isFavorite(data._id)}
                        episodeCount={data.episodeCount}
                        genres={data.genreId.filter(
                          (genre) => genre.toLowerCase() !== "telefilms",
                        )}
                        ageRating={data.ageRating}
                        trailer={data.trailer}
                        duration={formatDuration(data.duration)}
                        packageInfo={data.packageIds || []}
                      />
                    );
                  } else {
                    return (
                      <CardStyleHoverMobile
                        image={image}
                        seriesType={data.seriesType}
                        id={data._id}
                        title={data.title}
                        link={commonLink}
                        isFavorite={isFavorite(data._id)}
                        name={data.name}
                        episodeCount={data.episodeCount}
                        duration={formatDuration(data.duration)}
                        genres={data.genreId}
                        ageRating={data.ageRating}
                        trailer={data.trailer}
                        packageInfo={data.packageIds || []}
                      />
                    );
                  }
                }

                if (isTelefilms) {
                  if (width > 768) {
                    return isLoading ? (
                      <CardShimmer />
                    ) : (
                      <MainCard
                        image={`${imageBase}${data.imagePoster}`}
                        seriesType={data.seriesType}
                        id={data._id}
                        title={data.title}
                        isFavorite={isFavorite(data._id)}
                        episodeCount={data.episodeCount}
                        genres={data.genreId.filter(
                          (genre) => genre.toLowerCase() !== "telefilms",
                        )}
                        ageRating={data.ageRating}
                        trailer={data.trailer}
                        duration={formatDuration(data.duration)}
                        packageInfo={data.packageIds || []}
                      />
                    );
                  } else {
                    return (
                      <CardStyleHoverMobile
                        image={image}
                        seriesType={data.seriesType}
                        id={data._id}
                        title={data.title}
                        link={commonLink}
                        isFavorite={isFavorite(data._id)}
                        name={data.name}
                        genres={data.genreId}
                        ageRating={data.ageRating}
                        trailer={data.trailer}
                        episodeCount={data.episodeCount}
                        duration={formatDuration(data.duration)}
                        packageInfo={data.packageIds}
                      />
                    );
                  }
                }

                if (isOST) {
                  if (width > 768) {
                    return isLoading ? (
                      <CardShimmer />
                    ) : (
                      <CardStyleOST
                        image={image}
                        seriesType={data.seriesType}
                        id={data._id}
                        title={data.title}
                        link={commonLink}
                        isFavorite={isFavorite(data._id)}
                        name={item.name}
                        episodeCount={data.episodeCount}
                        cast={data.cast}
                        duration={formatDuration(data.duration)}
                      />
                    );
                  } else {
                    return (
                      <CardStyleHoverMobile
                        image={image}
                        seriesType={data.seriesType}
                        id={data._id}
                        title={data.title}
                        link={commonLink}
                        isFavorite={isFavorite(data._id)}
                        name={data.name}
                        genres={data.cast}
                        ageRating={data.ageRating}
                        trailer={data.trailer}
                        episodeCount={data.episodeCount}
                        duration={formatDuration(data.duration)}
                        packageInfo={data.packageIds}
                      />
                    );
                  }
                }

                if (width > 768) {
                  return isLoading ? (
                    <CardShimmer />
                  ) : (
                    <MainCard
                      image={`${imageBase}${data.imagePoster}`}
                      seriesType={data.seriesType}
                      id={data._id}
                      title={data.title}
                      isFavorite={isFavorite(data._id)}
                      episodeCount={data.episodeCount}
                      ageRating={data.ageRating}
                      genres={!isOST ? data.genreId : data.cast}
                      trailer={data.trailer}
                      duration={formatDuration(data.duration)}
                      packageInfo={data.packageIds || []}
                    />
                  );
                } else {
                  return (
                    <CardStyleHoverMobile
                      image={image}
                      seriesType={data.seriesType}
                      id={data._id}
                      title={data.title}
                      link={commonLink}
                      isFavorite={isFavorite(data._id)}
                      name={data.name}
                      genres={data.genreId}
                      ageRating={data.ageRating}
                      trailer={data.trailer}
                      episodeCount={data.episodeCount}
                      duration={formatDuration(data.duration)}
                      packageInfo={data.packageIds || []}
                    />
                  );
                }
              }}
            </SectionSlider>
          )}

          {/*  */}
          {/*  */}
          {item.type === "continueWatching" && (
            continueWatchingData.length > 0 ? (
              <SectionSlider
                title={`Continue Watching`}
                list={continueWatchingData
                  // .filter((data) => data.series?.status === "published")
                  .sort(
                    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
                  )} // Sort by updatedAt
                type={item.type}
                slidesPerView="5"
                className="upcomimg-block streamit-block main-sections"
              >
                {(data) => {
                  if (!data?.series) return null;

                  return isLoading ? (
                    <CardShimmer />
                  ) : (
                    <ContinueWatchCardNew
                      imagePath={`${import.meta.env.VITE_APP_IMAGE_PATH}${data.series.imageCoverBig}`}
                      link={
                        data.series.seriesType === "show"|| data.series.seriesType === "programs"
                          ? `/video/v1/3/${data.episodeWatchHistory[0]?.episodeId}/${data.series._id}`
                          : `/watch/v1/${data.series._id}`
                      }
                      seriesLink={
                        data.series.seriesType === "live"
                          ? `/live/${data.series.seriesLayout}/${data.series._id}`
                          : data.series.seriesType === "live-event"
                            ? `/live-event/${data.seriesLayout}/${data.series._id}`
                            : data.series.seriesType === "singleVideo"
                              ? `/watch/${data.series.seriesLayout}/${data.series._id}`
                              : data.series.cdnPlatform === "dm"
                                ? `/series/v2/${data._id}`
                                : data.series.cdnPlatform === "yt"
                                  ? `/series/v1/${data.series._id}`
                                  : `/series/v3/${data.series._id}`
                      }
                      // watchedTime={data.currentTime}
                      watchedTime={data.episodeWatchHistory?.[0]?.currentTime || 0}
                      // totalTime={data.videoLength || 0}
                      totalTime={
                        data.episodeWatchHistory?.[0]?.metadata?.episode?.videoLength || 
                        data.videoLength || 0
                      }
                      title={data.series.title}
                      // videoEpNumber={data.videoEpNumber ?? null}
                      videoEpNumber={
                        data.episodeWatchHistory?.[0]?.metadata?.episode?.videoEpNumber ?? null
                      }
                      onRemoveFromHistory={handleRemoveFromHistory}
                      id={data.seriesId}
                      genres={data.series.genreId}
                      seriesType={data.series.seriesType}
                      isFavorite={isFavorite(data.series._id)}
                    />
                  );
                }}
              </SectionSlider>
            ) : null
          )}

          {item.type === "RecommendedForYou" && (
            <div
              ref={(el) => {
                if (el && !hasRecommendedLoaded && !isRecommendedLoading) {
                  const observer = new IntersectionObserver(
                    ([entry]) => {
                      if (entry.isIntersecting) {
                        fetchRecommendedForYou();
                        observer.disconnect();
                      }
                    },
                    { threshold: 0.1 }
                  );
                  observer.observe(el);
                }
              }}
            >
              {isRecommendedLoading ? (
                <SectionSlider
                  title="Recommended For You"
                  list={Array(5).fill({})}
                  type={item.type}
                  slidesPerView="5"
                  className="upcomimg-block streamit-block main-sections"
                >
                  {() => <CardShimmer />}
                </SectionSlider>
              ) : recommendedForYouData.length > 0 ? (
                <SectionSlider
                  title="Recommended For You"
                  list={recommendedForYouData.sort(
                    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                  )}
                  type={item.type}
                  slidesPerView="5"
                  className="upcomimg-block streamit-block main-sections"
                >
                  {(data) => (
                    <MainCard
                      image={`${import.meta.env.VITE_APP_IMAGE_PATH}${data.series.imagePoster}`}
                      title={data.series.title}
                      id={data.seriesId}
                      genres={data.series.genreId}
                      seriesType={data.series.seriesType}
                      isFavorite={isFavorite(data.seriesId)}
                      episodeCount={data.series.episodeCount}
                      duration={formatDuration(data.series.duration)}
                      ageRating={data.series.ageRating}
                      trailer={data.series.trailer}
                      packageInfo={data.series.packages || []}
                    />
                  )}
                </SectionSlider>
              ) : null}
            </div>
          )}


          {item.type === "castHome" && item.list.length > 0 && (
            <SectionSlider
              title={item.name}
              list={item.list}
              type={item.type}
              className="upcomimg-block streamit-block main-sections"
              slidesPerView={6}
            >
              {(castName) => {
                const image = `${import.meta.env.VITE_APP_IMAGE_PATH}cast/${castName}.png?time=now`;
                const commonLink = `/cast-view-all/${castName}`;
                return isLoading ? (
                  <CardShimmer />
                ) : (
                  <PersonalityCard
                    image={image}
                    title={castName}
                    categoryLink="#"
                    link={commonLink}
                    name={castName}
                  />
                );
              }}
            </SectionSlider>
          )}

          {/* {item.type === "SeriesByGenres" && (
            <SectionSlider
              title={item.name}
              list={item.items}
              className="upcomimg-block streamit-block"
              slidesPerView={"4"}
              link={`/view-all-by-genre/${item.items}/${item.name}`}
              type={item.type}
            >
              {(data) => (
                <CardStyleHover
                  // image={
                  //   item.name === "SHOWS" || item.name === "Live Streaming"
                  //     ? "${import.meta.env.VITE_APP_IMAGE_PATH}" +
                  //     data.imageCoverBig
                  //     : "${import.meta.env.VITE_APP_IMAGE_PATH}" +
                  //     data.imagePoster
                  // }
                  image ={"${import.meta.env.VITE_APP_IMAGE_PATH}" +
                      data.imageCoverBig}
                  seriesType={data.seriesType}
                  id={data?._id}
                  title={data.title}
                  watchlistLink="/playlist"
                  link={
                    data.seriesType === "live"
                      ? `/live/${data.seriesLayout}/${data._id}`
                      : data.seriesType === "live-event"
                        ? `/live-event/${data.seriesLayout}/${data._id}`
                        : data.seriesType === "singleVideo"
                          ? `/watch/${data.seriesLayout}/${data._id}`
                          : data.cdnPlatform === "dm"
                            ? `/series/v2/${data._id}`
                            : data.cdnPlatform === "yt"
                              ? `/series/v1/${data._id}`
                              : `/series/v3/${data._id}`
                  }
                  isFavorite={isFavorite(data._id)}
                  name={data.name}
                />
              )}
            </SectionSlider>
          )} */}
        </Fragment>
      )),
    [homeData, isFavorite, continueWatchingData, recommendedForYouData],
  );

  return (
    <>
      {!isLoading && (
        <Helmet>
          <title>{title}</title>

          <meta name="description" content={description} />
        </Helmet>
      )}
      <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
        {children}
      </AuthContext.Provider>
      <Toaster />

      {showSplash ? (
        // <Splash />
        <Loader />
      ) : apiError ? (
        <ServiceDownPage />
      ) : isLoading ? (
        <ARYZAPLoader />
      ) : (
        <div className="mainContentSection">{renderHomeData}</div>
      )}
    </>
  );
});

HomePage.displayName = "HomePage";
export default HomePage;



