import React, { Fragment, memo } from "react";

// react-bootstrap
import { Container, Row, Col } from "react-bootstrap";

// react-router
import { Link } from "react-router-dom";

// components
import TagsCard from "../components/cards/TagsCard";
import BreadcrumbWidget from "../components/BreadcrumbWidget";

// data
import { movieTags, tvShowsTags, videoTags } from "../StaticData/data";

const TagsPage = memo(() => {
  return (
    <Fragment>
      <BreadcrumbWidget title="Tags" />
      <section className="section-padding">
        <Container fluid>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="main-title text-capitalize mb-0">Movie Tag</h4>
          </div>
          <Row as="ul" className="mb-0 list-inline">
            {movieTags.map((item, index) => (
              <Col as="li" xl="2" lg="3" md="4" sm="6" key={index}>
                <TagsCard
                  slug={item.slug}
                  title={item.title}
                  type={item.type}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <div className="iq-button">
              <Link to="#" className="btn text-uppercase position-relative">
                <span className="button-text">load more</span>
                <i className="fa-solid fa-play"></i>
              </Link>
            </div>
          </div>
        </Container>
      </section>
      <section className="section-padding-bottom">
        <Container fluid>
          <div className="iq-main-header d-flex align-items-center justify-content-between mt-5 mt-lg-0">
            <h4 className="main-title">Tv-Show Tag</h4>
          </div>
          <Row as="ul" className="row mb-0 list-inline">
            {tvShowsTags.map((item, index) => (
              <Col as="li" xl="2" lg="3" md="4" sm="6" key={index}>
                <TagsCard
                  slug={item.slug}
                  title={item.title}
                  type={item.type}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <div className="iq-button">
              <Link to="#" className="btn text-uppercase position-relative">
                <span className="button-text">load more</span>
                <i className="fa-solid fa-play"></i>
              </Link>
            </div>
          </div>
        </Container>
      </section>
      <section className="section-padding-bottom">
        <Container fluid>
          <div className="iq-main-header d-flex align-items-center justify-content-between mt-5 mt-lg-0">
            <h4 className="main-title">Video Tag</h4>
          </div>
          <Row as="ul" className="mb-0 list-inline">
            {videoTags.map((item, index) => (
              <Col as="li" xl="2" lg="3" md="4" sm="6" key={index}>
                <TagsCard
                  slug={item.slug}
                  title={item.title}
                  type={item.type}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <div className="iq-button">
              <Link to="#" className="btn text-uppercase position-relative">
                <span className="button-text">load more</span>
                <i className="fa-solid fa-play"></i>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </Fragment>
  );
});

TagsPage.displayName = "TagsPage";
export default TagsPage;
