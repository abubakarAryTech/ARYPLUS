import { Fragment, memo } from "react";

//react bootstrap
import { Button, Container } from "react-bootstrap";

import { Link } from "react-router-dom";
// import { generateImgPath } from "../../StaticData/data";

const CommingSoonPage = memo(() => {
  return (
    <Fragment>
      <div
        className="section-padding height-auto-100 image-flip-rtl"
        style={{
          backgroundImage: `url(${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/coming-soon.webp)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          position: "relative",
          minHeight: "500px",
        }}
      >
        <Container className="h-100 mt-5">
          <div className="d-flex flex-column justify-content-center h-100">
            <h1 className="text-capitalize fw-500 mb-0 text-center text-md-start">
              we are coming back soon
            </h1>
            <ul className="countdown d-flex align-items-center list-inline count-down my-5 py-3">
              <li className="position-relative d-inline-lock">
                <span className="numberDisplay">20</span>
                <span className="text-center text-capitalize fw-semibold d-block pt-1 letter-spacing-1">
                  days
                </span>
              </li>
              <li className="position-relative d-inline-lock">
                <span className="numberDisplay">03</span>
                <span className="text-center text-capitalize fw-semibold d-block pt-1 letter-spacing-1">
                  hours
                </span>
              </li>
              <li className="position-relative d-inline-lock">
                <span className="numberDisplay">42</span>
                <span className="text-center text-capitalize fw-semibold d-block pt-1 letter-spacing-1">
                  minutes
                </span>
              </li>
              <li className="position-relative d-inline-lock">
                <span className="numberDisplay">06</span>
                <span className="text-center text-capitalize fw-semibold d-block pt-1 letter-spacing-1">
                  seconds
                </span>
              </li>
            </ul>
            <div className="mailchimp">
              <div className="input-group  mail-box-width">
                <input
                  className="form-control mb-0 font-size-14"
                  placeholder="Email"
                  aria-describedby="button-addon2"
                />
                <div className="iq-button">
                  <Button id="button-addon2" className="btn" type="submit">
                    Subscribe
                  </Button>
                </div>
              </div>
              <p className="mt-2 mb-3 text-center text-md-start">
                We are working very hard on the new version
              </p>
              <div className="d-flex align-items-center mt-3 mt-md-5 justify-content-center justify-content-md-start">
                <span className="font-size-14 me-3">Follow Us:</span>
                <ul className="p-0 m-0 list-unstyled widget_social_media">
                  <li className="">
                    <Link
                      to="https://www.facebook.com/"
                      className="position-relative"
                    >
                      <i className="fab fa-facebook"></i>
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="https://twitter.com/"
                      className="position-relative"
                    >
                      <i className="fab fa-twitter"></i>
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="https://github.com/"
                      className="position-relative"
                    >
                      <i className="fab fa-github"></i>
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="https://www.instagram.com/"
                      className="position-relative"
                    >
                      <i className="fab fa-instagram"></i>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

CommingSoonPage.displayName = "CommingSoonPage";
export default CommingSoonPage;
