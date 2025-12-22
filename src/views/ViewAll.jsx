import {
  Fragment,
  memo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";
import BreadCrumbWidget from "../components/BreadcrumbWidget";
import LeaderboardInner from "../Ads/LeaderboardInner";
import CardStyleHover from "../components/cards/CardStyleHover";
import CardStyleHoverMobile from "../components/cards/CardStyleHoverMobile";
import MainCard from '../components/cards/MainCard';
import CardShimmer from "../components/cards/CardShimmer";
import { getConfig } from "../../config";
import { fetchLocation } from "../utilities/locationManager";
import api from "../services/api";
import { formatDuration, toTitleCase } from "../utilities/usePage";
import { useWatchlist } from "../hooks/useWatchlist";
import logger from '../services/logger';

const ViewAll = memo(() => {
  const { title } = useParams();
  const [location, setLocation] = useState(null);
  const [datas, setDatas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalSeries, setTotalSeries] = useState(0);
  const [shimmerCount, setShimmerCount] = useState(8);
  const [shimmerHeight, setShimmerHeight] = useState(280);
  const [width, setWidth] = useState(window.innerWidth);
  const observerRef = useRef();
  const hasFetchedLocation = useRef(false);
  const { isFavorite } = useWatchlist();

  const fetchData = useCallback(async () => {
    if (!location || isFetching) return;
    setIsFetching(true);
    try {
      const response = await api.get(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/series/byCatID/status/pg/${title}/${location}?limit=12&page=${page}`,
      );
      const result = response.data;
      if (result.series) {
        const seriesWithPackages = await Promise.all(
          result.series.map(async (item) => {
            if (item.packageIds && item.packageIds.length > 0) {
              try {
                const pkgResponse = await api.get(`/api/packages/${item.packageIds[0]}`);
                return { ...item, packageData: pkgResponse.data };
              } catch (error) {
                logger.error(`Failed to fetch package for ${item._id}:`, error);
                return { ...item, packageData: null };
              }
            }
            return { ...item, packageData: null };
          })
        );
        setDatas((prev) => [...prev, ...seriesWithPackages]);
        setTotalSeries(result.pagination.totalSeries);
      }
    } catch (error) {
      logger.error("Data fetch failed:", error);
      toast.error("Failed to load content");
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [location, page, title, isFetching]);

  useEffect(() => {
    if (!hasFetchedLocation.current) {
      hasFetchedLocation.current = true;
      fetchLocation().then(setLocation);
    }
  }, []);

  useEffect(() => {
    if (location) fetchData();
  }, [location, page, title]);

  useEffect(() => {
    let timeout;
    const updateShimmerSettings = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const width = window.innerWidth;
        setWidth(width);
        if (width < 768) {
          setShimmerCount(2);
          setShimmerHeight(280);
        } else if (width >= 768 && width < 1024) {
          setShimmerCount(12);
          setShimmerHeight(280);
        } else if (width >= 1024 && width < 1920) {
          setShimmerCount(12);
          setShimmerHeight(280);
        } else {
          setShimmerCount(12);
          setShimmerHeight(280);
        }
      }, 200);
    };

    updateShimmerSettings();
    window.addEventListener("resize", updateShimmerSettings);
    return () => {
      window.removeEventListener("resize", updateShimmerSettings);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const target = document.querySelector("#load-more");
    if (!target) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && datas.length < totalSeries) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.5, rootMargin: "200px" },
    );
    
    observer.observe(target);
    return () => observer.disconnect();
  }, [isFetching, datas.length, totalSeries]);

  const getLink = useCallback((item) => {
    if (item.seriesType === "live") return `/live/${item.seriesLayout}/${item._id}`;
    if (item.seriesType === "live-event") return `/live-event/${item.seriesLayout}/${item._id}`;
    if (item.seriesType === "singleVideo") return `/watch/${item.seriesLayout}/${item._id}`;
    if (item.cdnPlatform === "dm") return `/series/v2/${item._id}`;
    if (item.cdnPlatform === "yt") return `/series/v1/${item._id}`;
    return `/series/v3/${item._id}`;
  }, []);

  const renderShimmer = useCallback(() => (
    <Row className="row-cols-xl-6 row-cols-md-6 row-cols-2">
      {Array.from({ length: shimmerCount }).map((_, index) => (
        <Col key={index} className="mb-2 c-padding">
          <CardShimmer height={shimmerHeight} />
        </Col>
      ))}
    </Row>
  ), [shimmerCount, shimmerHeight]);

  return (
    <Fragment>
      {!isLoading && (
        <Helmet>
          <title>{toTitleCase(title)}</title>
          <meta property="og:type" content="article" />
          <meta property="og:title" content={title} />
          <meta property="og:site_name" content={title} />
          <meta
            property="article:publisher"
            content="https://www.facebook.com/aryzappk"
          />
          <meta
            property="article:published_time"
            content={new Date().toLocaleString()}
          />
          <meta
            property="article:modified_time"
            content={new Date().toLocaleString()}
          />
          <meta property="og:image:width" content="1280" />
          <meta property="og:image:height" content="720" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:creator" content="@aryzapofficial" />
          <meta name="twitter:site" content="@aryzapofficial" />
        </Helmet>
      )}
      {/* <Toaster /> */}
      <BreadCrumbWidget title={title} />
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


      {isLoading ? (
        <div className="section-paddingv2">
          <LeaderboardInner />
          <Container fluid>
            <div className="card-style-grid">{renderShimmer()}</div>
          </Container>
        </div>
      ) : (

        
        <div className="section-paddingv2">
          <LeaderboardInner />
          <Container fluid>
            <div className="card-style-grid">
              {datas.length > 0 ? (
                <Row
                  className={`row row-cols-xl-${title === "Live Streaming" ? 5 : 6} row-cols-md-${title === "Live Streaming" ? 5 : 6} row-cols-2`}
                >
                  {datas.map((item) => (
                    <Col key={item._id} className="mb-2 c-padding">
                      {width > 768 ? (
                        // <CardStyleHover
                        //   image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                        //   link={getLink(item)}
                        //   id={item._id}
                        //   title={item.title}
                        //   seriesType={item.seriesType}
                        //   isFavorite={isFavorite(item._id)}
                        //   episodeCount={item.episodeCount}
                        //   duration={formatDuration(item.duration)}
                        //   genres={item.genreId.filter(
                        //     (genre) => genre.toLowerCase() !== "telefilms",
                        //   )}
                        //   ageRating={item.ageRating}
                        //   trailer={item.trailer}
                        //   packageInfo={item.packageIds}
                        // />
                        <MainCard
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePoster}`}
                          link={getLink(item)}
                          id={item._id}
                          title={item.title}
                          seriesType={item.seriesType}
                          isFavorite={isFavorite(item._id)}
                          episodeCount={item.episodeCount}
                          duration={formatDuration(item.duration)}
                          genres={item.genreId.filter(
                            (genre) => genre.toLowerCase() !== "telefilms",
                          )}
                          ageRating={item.ageRating}
                          trailer={item.trailer}
                          packageInfo={item.packageIds}
                          packageData={item.packageData}
                          location={location}
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
                          genres={item.genreId}
                          ageRating={item.ageRating}
                          trailer={item.trailer}
                          packageInfo={item.packageIds}
                        />
                      )}
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5">
                  <p>No Content is available for this category yet.</p>
                </div>
              )}
              {isFetching && renderShimmer()}
              <div id="load-more" style={{ height: "1px" }}></div>
            </div>
          </Container>
        </div>
      )}
    </Fragment>
  );
});

ViewAll.displayName = "ViewAll";
export default ViewAll;
