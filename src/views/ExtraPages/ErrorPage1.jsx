import React, { Fragment, memo } from "react";

//react bootstrap
import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
// import { generateImgPath } from "../../StaticData/data";

const ErrorPage1 = memo(() => {
  return (
    <Fragment>
      <div className="section-padding vh-100">
        <Container className="">
          <Row className="h-100 align-items-center">
            <Col lg="2"></Col>
            <Col lg="8">
              <img
                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/404.webp`}
                alt="404"
                loading="lazy"
              />
              <div
                className="py-3 text-center mt-5 mb-4"
                style={{
                  background: `url(${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/404-bg-patten.webp)`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                  backgroundSize: "68% auto",
                }}
              >
                <h4 className="fw-semibold mb-0">Oops! something went wrong</h4>
              </div>
              <p className="text-center">
                We’re sorry, it looks like the page you’re looking for isn’t in
                our system
              </p>
              <div className="text-center mt-4 pt-3">
                <div className="iq-button">
                  <Link to="" className="btn text-uppercase position-relative">
                    <span className="button-text">Back to home</span>
                    <i className="fa-solid fa-play"></i>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

export default ErrorPage1;
