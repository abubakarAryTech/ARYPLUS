import { memo, Fragment } from "react";

import { Row, Col } from "react-bootstrap";

// data
import { geners, tvShowGenres, videoGenres } from "../StaticData/data";

import { Link } from "react-router-dom";

// components
import GenersCard from "../components/cards/GanresCard";
import BreadcrumbWidget from "../components/BreadcrumbWidget";

const GenresPage = memo(() => {
  return (
    <Fragment>
      <BreadcrumbWidget title="Genres" />
      <section className="section-padding">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="main-title text-capitalize mb-0">Movie Genres</h4>
          </div>
          <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {geners.map((item, index) => (
              <Col key={index} className="mb-4">
                <GenersCard
                  slug={item.slug}
                  title={item.title}
                  image={item.thumbnail}
                  type={item.type}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <div className="iq-button">
              <Link
                to="javascript:void(0)"
                className="btn text-uppercase position-relative"
              >
                <span className="button-text">load more</span>
                <i className="fa-solid fa-play"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="iq-genres-section">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="main-title text-capitalize mb-0">Tv-Show Genres</h4>
          </div>
          <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {tvShowGenres.map((item, index) => (
              <Col key={index} className="mb-4">
                <GenersCard
                  slug={item.slug}
                  title={item.title}
                  image={item.thumbnail}
                  type={item.type}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <div className="iq-button">
              <Link
                to="javascript:void(0)"
                className="btn text-uppercase position-relative"
              >
                <span className="button-text">load more</span>
                <i className="fa-solid fa-play"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="iq-genres-section">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="main-title text-capitalize mb-0">Video Genres</h4>
          </div>
          <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {videoGenres.map((item, index) => (
              <Col key={index} className="mb-4">
                <GenersCard
                  slug={item.slug}
                  title={item.title}
                  image={item.thumbnail}
                  type={item.type}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <div className="iq-button">
              <Link
                to="javascript:void(0)"
                className="btn text-uppercase position-relative"
              >
                <span className="button-text">load more</span>
                <i className="fa-solid fa-play"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
});

GenresPage.displayName = "GenresPage";
export default GenresPage;
