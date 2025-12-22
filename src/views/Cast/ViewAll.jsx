import { Fragment, memo, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CardStyleWithFav from "../../components/cards/CardStyleWithFav";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Loader from "../../components/ReactLoader";
import CardStyleHover from "../../components/cards/CardStyleHover";
import api from "../../services/api";
import { getConfig } from "../../../config";
import { formatDuration } from "../../utilities/usePage";
import { useWatchlist } from "../../hooks/useWatchlist";
import logger from '../../services/logger';

// import { ShimmerButton, ShimmerTitle } from "react-shimmer-effects";

// component
// import VerticalShimmer from "../components/card/shimmer/vertical-card-shimmer";

// import { Image, Shimmer } from 'react-shimmer'

const ViewAll = memo(() => {
  const { name } = useParams();

  const [datas, setDatas] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const config = getConfig();
  const { isFavorite } = useWatchlist();

  useEffect(() => {
    if (!datas) {
      setIsLoading(true);
      api.get(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/search/cast/${name}`,
      )
        .then((resp) => {
          setDatas(resp.data);
          setIsLoading(false);
        })
        .catch((error) => {
          logger.error("Data fetch failed:", error);
          setIsLoading(false);
        });
    }
  }, [datas]);



  const renderSection = (type, title) => {
    if (!datas || !datas.series) return null;

    // const filteredItems = datas.series.filter(item => item.seriesType === type);

    const filteredItems = datas.series.filter((item) => {
      if (type === "show") {
          return item.seriesType === "show" || item.seriesType === "programs";
      }
      return item.seriesType === type;
    });

    if (filteredItems.length === 0) return null;

    // logger.log(datas);

    return (
      <div key={type}>
        {/* <div className="d-flex align-items-end justify-content-between mb-2 mt-4">
              <h5 className="main-title text-capitalize mb-0 fw-bolder">{title}</h5>
            </div> */}

        <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2">
          {filteredItems.map((item, index) => (
              <Col key={index} className="mb-5">
                {/* <CardStyleWithFav
                image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePoster}`}
                link={
                  item.seriesType === "live"
                    ? `/live/${item.ost}/${item._id}`
                    : item.seriesType === "live-event"
                    ? `/live-event/${item.ost}/${item._id}`
                    : `/series/v2/${item._id}`
                }
              /> */}
                {/* <CardStyleHover
                  image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                  link={
                    item.seriesType === "live"
                      ? `/live/${item.ost}/${item._id}`
                      : item.seriesType === "live-event"
                        ? `/live-event/${item.ost}/${item._id}`
                        : `/series/v3/${item._id}`
                  }
                  id={item._id}
                  title={item.title}
                  seriesType={item.seriesType}
                  name={item.name}
                  isFavorite={favorites?.some(
                    (fav) => fav.seriesId?._id === item._id,
                  )}
                  packageInfo={item.packageIds}
                /> */}
                <CardStyleHover
                  image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imageCoverBig}`}
                  link={
                    item.seriesType === "live"
                      ? `/live/${item.ost}/${item._id}`
                      : item.seriesType === "live-event"
                        ? `/live-event/${item.ost}/${item._id}`
                        : `/series/v3/${item._id}`
                  }
                  id={item._id}
                  title={item.title}
                  seriesType={item.seriesType}
                  name={item.name}
                  isFavorite={isFavorite(item._id)}
                  episodeCount={item.episodeCount}
                  // genres={item.genreId}
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

  return (
    <Fragment>
      {isLoading == false ? (
        <Helmet>
          <title>{`${name}`}</title>
          <meta property="og:type" content="article" />
          <meta property="og:title" content={name} data-react-helmet="true" />
          <meta
            property="og:site_name"
            content={name}
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
      ) : null}
      <BreadCrumbWidget title={name} cast={true} />
      <div className="section-paddingv2">
        <Container fluid>
          <div className="card-style-grid">
            {isLoading ? (
              <Loader />
            ) : (
              datas && (
                <>
                  {renderSection("show", "PROGRAMS AND SHOWS")}
                  {/* {renderSection('programs', 'PROGRAMS')} */}
                  {renderSection("live", "LIVE SHOWS")}
                  {renderSection("live-event", "LIVE EVENTS")}
                </>
              )
            )}
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

ViewAll.displayName = "ViewAll";
export default ViewAll;
