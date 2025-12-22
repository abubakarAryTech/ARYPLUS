import { Fragment, memo, useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Tab, Nav, Button } from "react-bootstrap";
import CardStyleWithFav from "../components/cards/CardStyleWithFav";
import BreadCrumbWidget from "../components/BreadcrumbWidget";
import { useParams, Link, Form } from "react-router-dom";
import { Helmet } from "react-helmet";
import Loader from "../components/ReactLoader";
import LeaderboardInner from "../Ads/LeaderboardInner";
import { useAuthStore } from "../stores/useAuthStore";
import { getConfig } from "../../config";
import api from "../services/api";
import CardStyleHover from "../components/cards/CardStyleHover";
import { useWatchlist } from "../hooks/useWatchlist";
import PersonalityCard from "../components/cards/PersonalityCard";
import { IoIosArrowBack } from "react-icons/io";
import logger from '../services/logger';

import "../authpages.scss";
import CardShimmer from "../components/cards/CardShimmer";
import { formatDuration } from "../utilities/usePage";

const SearchPagev2 = memo(() => {
  const { query } = useParams();

  const [datas, setDatas] = useState(null);
  const [EpisodeDatas, setEpisode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const config = getConfig();
  const { user } = useAuthStore();
  const { isFavorite } = useWatchlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Build request payload with query
        const payload = { query };

        // Add uid if user exists
        if (user?.uid) {
          payload.uid = user.uid;
        }

        const response = await api.post("/api/v2/search", payload);
        const result = response.data;

        // Update result with seriesLayout = "v3"
        const updatedResult = {
          ...result,
          series: result.series.map((item) => ({
            ...item,
            seriesLayout: "v3",
          })),
        };

        setDatas(updatedResult);
        console.log('✅ Search results from: Semantic Engine Service');
      } catch (error) {
        logger.error("Semantic search failed, falling back to basic search:", error);
        const errorCode = error.response?.status || 'unknown';
        
        // Fallback to basic search
        try {
          const fallbackResponse = await api.get(`/api/search/${query}`);
          const fallbackResult = fallbackResponse.data;
          
          const updatedFallbackResult = {
            ...fallbackResult,
            series: fallbackResult.series?.map((item) => ({
              ...item,
              seriesLayout: "v3",
            })) || [],
          };
          
          setDatas(updatedFallbackResult);
          console.log('⚠️ Search results from: Basic Search Fallback (Semantic service error:', errorCode, ')');
        } catch (fallbackError) {
          logger.error("Basic search also failed:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchData();
    }
  }, [query, user]);





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

    // const filteredItems = datas.series.filter(item => item.seriesType === type);

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
    //  Debugging: Log filteredItems to confirm
    // logger.log("Search results filtered:", filteredItems);

    if (filteredItems.length === 0)
      return <p>We couldn’t find anything here related to your search</p>;

    return (
      <div key={type}>
        <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2">
          {filteredItems.map((item, index) => (
              <Col key={index} className="mb-2 c-padding">
                <CardStyleHover
                  image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
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
              </Col>
            ))}
        </Row>
      </div>
    );
  };

  const renderEpisode = (title) => {
    if (!datas || !datas.episodes) return null;

    const filteredItemsEpisodes = datas.episodes;

    if (filteredItemsEpisodes.length === 0) return null;

    return (
      <div>
        <div className="d-flex align-items-end justify-content-between mb-2 mt-4">
          <h5 className="main-title text-capitalize mb-0 fw-bolder">{title}</h5>

          <Link
            to={"link ? link : `/view-all/${type}/${title}`"}
            className="iq-view-all text-decoration-none text-light btn btn-primary  view-all-btn "
            //   onClick={handleViewAllClick}
          >
            View All
          </Link>
        </div>

        <Row className="row row-cols-xl-5 row-cols-md-4 row-cols-2">
          {filteredItemsEpisodes.slice(0, 15).map((items, index) => (
            <Col key={index} className="mb-5">
              <CardStyleWithFav
                image={`${items.imagePath}`}
                // link={items.videoYtId }
                link={"/video/1/" + items.videoYtId + "/" + items.seriesId}
              />
              <div className="card-description pb-0 mt-2">
                <h5 className="text-capitalize fw-500">
                  <a
                    href={"/video/1/" + items.videoYtId + "/" + items.seriesId}
                  >
                    {items.title}
                  </a>
                </h5>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  const renderCast = (title) => {
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
      {isLoading === false && (
        <Helmet>
          <title>{`Search Results for '${query}'`}</title>
          <meta name="description" content={`Search Results for '${query}'`} />
        </Helmet>
      )}
      {datas?.series?.length > 0 && (
        <BreadCrumbWidget title={` Search Results — ${query}`} />
      )}

      <div className={datas?.series?.length > 0 ? "section-paddingv2" : ""}>
        <LeaderboardInner />

        <div className="">
          {/* Desktop Shadow Overlay Layer */}
          <div
            className="position-absolute"
            // style={{
            //   top: -50,
            //   left: -250,
            //   width: "500px",
            //   height: "500px",
            //   background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, transparent 50%)",
            //   zIndex: 0,
            //   pointerEvents: "none"
            // }}
          ></div>
          {/* <Container fluid> */}
          <div className="card-style-grid">
            {isLoading ? (
              <>
                <BreadCrumbWidget title={` Search Results — ${query}`} />
                <div className="section-paddingv2">
                  <Container fluid>
                    <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <Col key={index} className="mb-2 c-padding">
                          <CardShimmer />
                        </Col>
                      ))}
                    </Row>
                  </Container>
                </div>
              </>
            ) : datas?.series?.length < 1 ? (
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container className="mt-5">
                  <Row className="h-100 align-items-center text-center mt-5">
                    <Col
                      lg="12"
                      md="12"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center align-items-center gap-4 text-left text-md-center"
                    >
                      <svg
                        width="109"
                        height="109"
                        viewBox="0 0 109 109"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_272_5583)">
                          <path
                            d="M109 64.875H103.789V85.6191H109V64.875Z"
                            fill="white"
                          />
                          <path
                            d="M103.788 85.6172H98.6108V90.8288H103.788V85.6172Z"
                            fill="white"
                          />
                          <path
                            d="M93.4336 54.4867V59.6983H98.6111V64.8758H103.789V44.0977H98.6111V54.4867H93.4336Z"
                            fill="white"
                          />
                          <path
                            d="M98.6111 90.8281H93.4336V96.0056H98.6111V90.8281Z"
                            fill="white"
                          />
                          <path
                            d="M98.6111 28.5273H93.4336V44.0939H98.6111V28.5273Z"
                            fill="white"
                          />
                          <path
                            d="M93.4337 59.6953H72.6555V64.8728H88.2221V70.0503H83.0446V75.2619H77.833V80.4394H72.6555V64.8728H67.478V85.6169H72.6555V90.8284H93.4337V85.6169H98.6112V64.8728H93.4337V59.6953Z"
                            fill="white"
                          />
                          <path
                            d="M93.4332 12.9609H88.2217V28.5275H93.4332V12.9609Z"
                            fill="white"
                          />
                          <path
                            d="M93.4334 96.0078H72.6553V101.219H93.4334V96.0078Z"
                            fill="white"
                          />
                          <path
                            d="M93.4334 49.3086H72.6553V54.4861H93.4334V49.3086Z"
                            fill="white"
                          />
                          <path
                            d="M72.6555 90.8281H67.478V96.0056H72.6555V90.8281Z"
                            fill="white"
                          />
                          <path
                            d="M72.6555 54.4844H67.478V59.6959H72.6555V54.4844Z"
                            fill="white"
                          />
                          <path
                            d="M88.2217 7.78516H62.2661V12.9627H88.2217V7.78516Z"
                            fill="white"
                          />
                          <path
                            d="M67.4777 85.6172H62.2661V90.8288H67.4777V85.6172Z"
                            fill="white"
                          />
                          <path
                            d="M62.2664 64.8728H67.4779V59.6953H57.0889V85.6169H62.2664V64.8728Z"
                            fill="white"
                          />
                          <path
                            d="M67.4776 38.9197H62.266V33.7422H46.6995V38.9197H41.522V44.0972H46.6995V49.3088H62.266V44.0972H67.4776V38.9197Z"
                            fill="white"
                          />
                          <path
                            d="M57.0886 54.4844H51.9111V59.6959H57.0886V54.4844Z"
                            fill="white"
                          />
                          <path
                            d="M46.6997 28.5275H62.2663V12.9609H57.0888V23.35H51.9113V12.9609H46.6997V28.5275Z"
                            fill="white"
                          />
                          <path
                            d="M46.6995 85.6172H41.522V90.8288H46.6995V85.6172Z"
                            fill="white"
                          />
                          <path
                            d="M41.522 64.8728H46.6995V85.6169H51.911V59.6953H41.522V64.8728Z"
                            fill="white"
                          />
                          <path
                            d="M41.5221 90.8281H36.3105V96.0056H41.5221V90.8281Z"
                            fill="white"
                          />
                          <path
                            d="M41.5221 54.4844H36.3105V59.6959H41.5221V54.4844Z"
                            fill="white"
                          />
                          <path
                            d="M36.3107 59.6953H15.5667V64.8728H31.1332V70.0503H25.9557V75.2619H20.7442V80.4394H15.5667V64.8728H10.3892V85.6169H15.5667V90.8284H36.3107V85.6169H41.5223V64.8728H36.3107V59.6953Z"
                            fill="white"
                          />
                          <path
                            d="M36.3105 96.0078H15.5664V101.219H36.3105V96.0078Z"
                            fill="white"
                          />
                          <path
                            d="M46.6998 7.78516H20.7441V12.9627H46.6998V7.78516Z"
                            fill="white"
                          />
                          <path
                            d="M36.3105 49.3086H15.5664V54.4861H36.3105V49.3086Z"
                            fill="white"
                          />
                          <path
                            d="M20.7439 12.9609H15.5664V28.5275H20.7439V12.9609Z"
                            fill="white"
                          />
                          <path
                            d="M15.5667 90.8281H10.3892V96.0056H15.5667V90.8281Z"
                            fill="white"
                          />
                          <path
                            d="M15.5667 28.5273H10.3892V44.0939H15.5667V28.5273Z"
                            fill="white"
                          />
                          <path
                            d="M10.3893 85.6172H5.17773V90.8288H10.3893V85.6172Z"
                            fill="white"
                          />
                          <path
                            d="M10.3893 59.6983H15.5668V54.4867H10.3893V44.0977H5.17773V64.8758H10.3893V59.6983Z"
                            fill="white"
                          />
                          <path
                            d="M5.1775 64.875H0V85.6191H5.1775V64.875Z"
                            fill="white"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_272_5583">
                            <rect width="109" height="109" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <div>
                        <h5
                          style={{
                            fontFamily: "Poppins",
                            fontWeight: 600,
                            fontSize: "20px",
                            lineHeight: "100%",
                            textAlign: "center",
                            letterSpacing: "0.16px",
                          }}
                        >
                          We couldn't find anything related to your search
                        </h5>
                        <p
                          className="mt-2"
                          style={{
                            fontFamily: "Poppins",
                            fontWeight: 300,
                            fontSize: "20px",
                            lineHeight: "100%",
                            letterSpacing: "0.16px",
                            textAlign: "center",
                          }}
                        >
                          Please try a different search term and try again
                        </p>
                      </div>
                      {/* <div>
                      <Form>
                      <Button variant="danger" type="submit">
                        <IoIosArrowBack size={'1.2rem'} /> Back
                      </Button>
                      </Form>
                    </div> */}
                    </Col>
                  </Row>
                </Container>
              </div>
            ) : (
              // <div className="tab-block bg-transparent">
              <div
                className={`bg-transparent ${datas?.series?.length > 0 ? "tab-block" : ""}`}
              >
                <div className="tab-bottom-bordered border-0 trending-custom-tab search-nav">
                  <Tab.Container id="left-tabs-example" defaultActiveKey="all">
                    {datas?.series?.length > 0 && (
                      <Nav
                        variant="pills"
                        className="nav nav-tabs nav-pills mb-3 overflow-x-scroll border-0 "
                      >
                        <Nav.Item key={"nav1"}>
                          <Nav.Link eventKey={"all"}>All</Nav.Link>
                        </Nav.Item>

                        <Nav.Item key={"nav2"}>
                          <Nav.Link eventKey={"dramas"}>Dramas</Nav.Link>
                        </Nav.Item>

                        <Nav.Item key={"nav3"}>
                          <Nav.Link eventKey={"tv-shows"}>TV Shows</Nav.Link>
                        </Nav.Item>
                        <Nav.Item key={"nav6"}>
                          <Nav.Link eventKey={"ost"}>OST</Nav.Link>
                        </Nav.Item>

                        <Nav.Item key={"nav7"}>
                          <Nav.Link eventKey={"podcast"}>Podcast</Nav.Link>
                        </Nav.Item>

                        <Nav.Item key={"nav8"}>
                          <Nav.Link eventKey={"telefilms"}>TeleFilms</Nav.Link>
                        </Nav.Item>

                        <Nav.Item key={"nav4"}>
                          <Nav.Link eventKey={"live"}>Live</Nav.Link>
                        </Nav.Item>

                        <Nav.Item key={"nav5"}>
                          <Nav.Link eventKey={"cast"}>Cast</Nav.Link>
                        </Nav.Item>
                      </Nav>
                    )}
                    <div className="">
                      <Tab.Content className="tab-content trending-content">
                        <Tab.Pane eventKey={"all"} key={"nav1"}>
                          {renderSection("all", "ALL")}
                          {renderCast("Cast")}
                        </Tab.Pane>

                        <Tab.Pane eventKey={"dramas"} key={"nav2"}>
                          {renderSection("show", "PROGRAMS")}
                        </Tab.Pane>

                        <Tab.Pane eventKey={"tv-shows"} key={"nav3"}>
                          {renderSection("programs", "SHOWS")}
                        </Tab.Pane>
                        <Tab.Pane eventKey={"live"} key={"nav4"}>
                          {renderSection("live", "PROGRAMS AND SHOWS")}
                        </Tab.Pane>
                        <Tab.Pane eventKey={"cast"} key={"nav5"}>
                          {renderCast("Cast")}
                        </Tab.Pane>

                        <Tab.Pane eventKey={"ost"} key={"nav6"}>
                          {renderSection("singleVideo", "OST", "ost")}
                        </Tab.Pane>
                        <Tab.Pane eventKey={"podcast"} key={"nav7"}>
                          {renderSection("singleVideo", "Podcasts", "podcasts")}
                        </Tab.Pane>
                        <Tab.Pane eventKey={"telefilms"} key={"nav8"}>
                          {renderSection(
                            "singleVideo",
                            "Telefilms",
                            "telefilms",
                          )}
                        </Tab.Pane>
                      </Tab.Content>
                    </div>
                  </Tab.Container>
                </div>
              </div>
            )}
          </div>
          {/* </Container> */}
        </div>
      </div>
    </Fragment>
  );
});

SearchPagev2.displayName = "SearchPagev2";
export default SearchPagev2;
