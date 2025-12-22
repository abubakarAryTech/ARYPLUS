import { memo, Fragment } from "react";

// react-bootstrap
import { Container, Row, Col, Image } from "react-bootstrap";

import { Link } from "react-router-dom";

// img
// const img1 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/map.webp`;
const img1 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/karachi.webp`;

const ContactUs = memo(() => {
  return (
    <Fragment>
      <section
        className="section-padding"
        style={{ backgroundColor: "var(--bs-gray-900)" }}
      >
        <Container>
          <Row className="about-us-row text-center align-items-center">
            <Col md="6">
              <div className="text-center">
                <Image
                  width="497"
                  height="477"
                  src={img1}
                  className="attachment-large size-large"
                  alt=""
                  loading="lazy"
                />
              </div>
            </Col>
            <Col md="6">
              <div className="text-left iq-title-box iq-title-default">
                <h2 className="iq-title">Contact Us Here</h2>
                <p className="iq-title-desc">
                  ARY PLUS is located in Karachi and you can contact us at{" "}
                  <Link to="#">support@aryzap.com</Link> for any tech-related
                  support and assistance. We love to hear from our Zap users.
                </p>
                <Row className="mt-2 iq-rtl-direction">
                  <Col md="4">
                    <div className="counter">
                      <span className="counter-number">2</span>
                    </div>
                    <div className="counter-title">Branch</div>
                  </Col>
                  <Col md="4">
                    <div className="iq-contact-list">
                      <div className="counter">
                        <span className="counter-number"> 500+ </span>
                      </div>
                      <div className="counter-title">Employee</div>
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="iq-contact-list">
                      <div className="counter">
                        <span className="counter-number"> 10,000+ </span>
                      </div>
                      <div className="counter-title">Clients</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Fragment>
  );
});

ContactUs.displayName = "ContactUs";
export default ContactUs;
