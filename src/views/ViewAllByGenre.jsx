import {
  Fragment,
  memo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Container, Row, Col } from "react-bootstrap";
import CardStyleWithFav from "../components/cards/CardStyleWithFav";
import BreadCrumbWidget from "../components/BreadcrumbWidget";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Loader from "../components/ReactLoader";
import LeaderboardInner from "../Ads/LeaderboardInner";
import { ShimmerDiv } from "shimmer-effects-react";
import { getConfig } from "../../config";
import { fetchLocation } from "../utilities/locationManager";
import CardStyleHover from "../components/cards/CardStyleHover";
import api from "../services/api";
import { useWatchlist } from "../hooks/useWatchlist";
import logger from '../services/logger';
import { useAuthStore } from "../stores/useAuthStore";

const ViewAllByGenre = memo(() => {
  const config = getConfig();
  const { genreId } = useParams();
  const { title } = useParams();

  const [location, setLocation] = useState(null);
  const [datas, setDatas] = useState({ series: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [totalSeries, setTotalSeries] = useState(0); // To track total available series
  const observerRef = useRef();

  // const [title, setTitle] = useState("");

  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState([]);

  const [shimmerCount, setShimmerCount] = useState(6);
  const [shimmerHeight, setShimmerHeight] = useState(320);
  const { isFavorite } = useWatchlist();

  useEffect(() => {
    const updateShimmerSettings = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setShimmerCount(2); // Mobile view
        setShimmerHeight(250); // Adjust height for mobile
      } else if (width >= 768 && width < 1024) {
        setShimmerCount(4); // Tablet view
        setShimmerHeight(280); // Adjust height for tablet
      } else {
        setShimmerCount(5); // Desktop view
        setShimmerHeight(320); // Adjust height for desktop
      }
    };

    updateShimmerSettings(); // Run on component mount
    window.addEventListener("resize", updateShimmerSettings); // Update on resize

    return () => {
      window.removeEventListener("resize", updateShimmerSettings); // Cleanup listener
    };
  }, []);

  const loadLocation = useCallback(async () => {
    const countryCode = await fetchLocation();
    setLocation(countryCode);
  }, []);

  const fetchData = useCallback(async () => {
    if (!location || isFetching) return;

    setIsFetching(true);

    try {
      const response = await api.get(
        `${config.appApiHomeEndpoint}/api/seriesbygenre/${genreId}?page=${page}&limit=12`
      );
      const result = response.data.data;

      if (result.series) {
        setDatas((prev) => ({
          ...prev,
          series: [...prev.series, ...result.series],
        }));
        // setDatas((prev) => [...prev, ...result.series]);
        setTotalSeries(result.totalSeries);
      }
    } catch (error) {
      logger.error("Data fetch failed:", error);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [location, page, title]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadLocation();
    };
    initialize();
  }, [loadLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Intersection Observer
  useEffect(() => {
    const target = document.querySelector("#load-more");

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetching &&
          datas.series.length < totalSeries
        ) {
          logger.log("Pagination triggered, loading next page");
          setPage((prevPage) => prevPage + 1); // Update page
        }
      },
      { threshold: 1.0 },
    );

    if (target) observerRef.current.observe(target);

    return () => observerRef.current.disconnect();
  }, [isFetching, datas.length, totalSeries]);

  return (
    <Fragment>
      {!isLoading && (
        <Helmet>
          <title>{`${title}`}</title>
          <meta property="og:type" content="article" />
          <meta property="og:title" content={title} data-react-helmet="true" />
          <meta
            property="og:site_name"
            content={title}
            data-react-helmet="true"
          />
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
      <BreadCrumbWidget title={title} />
      {isLoading ? (
        <Loader />
      ) : (
        <div className="section-paddingv2">
          <LeaderboardInner />
          <Container fluid>
            <div className="card-style-grid">
              {datas?.series?.filter((data) => data.status === "published")
                .length > 0 ? (
                <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2">
                  {datas.series
                    .filter((data) => data.status === "published")
                    .map((item, index) => (
                      <Col key={index} className="mb-2 c-padding">
                        {/* <CardStyle
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${
                            item.seriesType === "live"
                              ? item.imageCoverBig
                              : item.imagePoster
                          }`}
                          link={
                            item.seriesType === "live"
                              ? `/live/${item.seriesLayout}/${item._id}`
                              : item.seriesType === "singleVideo"
                            ? `/watch/${item.seriesLayout}/${item._id}`
                              : item.seriesType === "live-event"
                              ? `/live-event/${item.seriesLayout}/${item._id}`
                              : item.cdnPlatform === "dm"
                              ? `/series/v2/${item._id}`
                              : item.cdnPlatform === "yt"
                              ? `/series/v1/${item._id}`
                              : `/series/v3/${item._id}`
                          }
                        /> */}
                        <CardStyleHover
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                          link={
                            item.seriesType === "live"
                              ? `/live/${item.seriesLayout}/${item._id}`
                              : item.seriesType === "singleVideo"
                                ? `/watch/${item.seriesLayout}/${item._id}`
                                : item.seriesType === "live-event"
                                  ? `/live-event/${item.seriesLayout}/${item._id}`
                                  : item.cdnPlatform === "dm"
                                    ? `/series/v2/${item._id}`
                                    : item.cdnPlatform === "yt"
                                      ? `/series/v1/${item._id}`
                                      : `/series/v3/${item._id}`
                          }
                          id={item._id}
                          title={item.title}
                          seriesType={item.seriesType}
                          isFavorite={isFavorite(item._id)}
                          packageInfo={item.packageIds}
                        />
                      </Col>
                    ))}
                </Row>
              ) : (
                <div className="text-center">
                  <p>No Content is available for this category yet.</p>
                </div>
              )}
            </div>
            {isFetching && (
              // <div className="shimmer-placeholder">
              //   <p>Loading more content...</p>
              // </div>

              <div className="d-flex justify-content-between">
                {Array.from({ length: shimmerCount }).map((_, index) => (
                  <ShimmerDiv
                    key={index}
                    mode="custom"
                    from={"#131313"}
                    via={"#242323"}
                    to={"#131313"}
                    height={shimmerHeight} // Dynamically set height
                    width={250}
                    className="m-1"
                  />
                ))}
              </div>
            )}
            <div id="load-more" style={{ height: "1px" }}></div>
          </Container>
        </div>
      )}
    </Fragment>
  );
});

ViewAllByGenre.displayName = "ViewAllByGenre";
export default ViewAllByGenre;
