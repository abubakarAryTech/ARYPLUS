import { Fragment, memo, useState } from "react";
import { Helmet } from "react-helmet";

//react bootstrap
import { Col, Container, Row } from "react-bootstrap";

// components
import BreadcrumbWidget from "../../components/BreadcrumbWidget";

const PrivacyPolicy = memo(() => {
  const [title, setTitle] = useState("ARY PLUS - About Us");
  return (
    <Fragment>
      <Helmet>
        <title>{`${title}`}</title>
      </Helmet>
      <BreadcrumbWidget title="Privacy Policy" />
      <div className="section-padding paddingLeftRight">
        <Container>
          <Row>
            <Col md="12" className="mt-4 mb-4">
              <div className="iq-privacy-policy mt-4">
                <div className="mb-3 mt-4">
                  <h4 className="mb-3 mt-4">
                    1. What Personal Information About Users Does streamit
                    Collect?
                  </h4>
                  <p className="my-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                    quis nisl dignissim, placerat diam ac, egestas ante. Morbi
                    varius quis orci feugiat hendrerit. Morbi ullamcorper
                    consequat justo, in posuere nisi efficitur sed. Vestibulum
                    semper dolor id arcu finibus volutpat. Integer condimentum
                    ex tellus, ac finibus metus sodales in. Proin blandit congue
                    ipsum ac dapibus. Integer blandit eros elit, vel luctus
                    tellus finibus in. Aliquam non urna ut leo vestibulum mattis
                    ac nec dolor. Nulla libero mauris, dapibus non aliquet
                    viverra, elementum eget lorem
                  </p>
                  <br />
                </div>
                <div className="mb-3">
                  <h4 className="mb-3">2. Cookies and Web Beacons</h4>
                  <p className="mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                    quis nisl dignissim, placerat diam ac, egestas ante. Morbi
                    varius quis orci feugiat hendrerit. Morbi ullamcorper
                    consequat justo, in posuere nisi efficitur sed.
                  </p>
                  <p className="mb-0">
                    Vestibulum semper dolor id arcu finibus volutpat. Integer
                    condimentum ex tellus, ac finibus metus sodales in. Proin
                    blandit congue ipsum ac dapibus. Integer blandit eros elit,
                    vel luctus tellus finibus in. Aliquam non urna ut leo
                    vestibulum mattis ac nec dolor. Nulla libero mauris, dapibus
                    non aliquet viverra, elementum eget lorem
                  </p>
                  <br />
                </div>
                <div className="mb-3">
                  <h4 className="mb-3">
                    3. Third Party Payment Gateway – Financial Information
                  </h4>
                  <p className="">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                    quis nisl dignissim, placerat diam ac, egestas ante. Morbi
                    varius quis orci feugiat hendrerit. Morbi ullamcorper
                    consequat justo, in posuere nisi efficitur sed. Vestibulum
                    semper dolor id arcu finibus volutpat. Integer condimentum
                    ex tellus, ac finibus metus sodales in. Proin blandit congue
                    ipsum ac dapibus. Integer blandit eros elit, vel luctus
                    tellus finibus in. Aliquam non urna ut leo vestibulum mattis
                    ac nec dolor. Nulla libero mauris, dapibus non aliquet
                    viverra, elementum eget lorem
                  </p>
                  <br />
                </div>
                <div className="mb-3">
                  <h4 className="mb-3">4. Disclosure Children’s Privacy</h4>
                  <p className="">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                    quis nisl dignissim, placerat diam ac, egestas ante. Morbi
                    varius quis orci feugiat hendrerit. Morbi ullamcorper
                    consequat justo, in posuere nisi efficitur sed. Vestibulum
                    semper dolor id arcu finibus volutpat. Integer condimentum
                    ex tellus, ac finibus metus sodales in. Proin blandit congue
                    ipsum ac dapibus. Integer blandit eros elit, vel luctus
                    tellus finibus in. Aliquam non urna ut leo vestibulum mattis
                    ac nec dolor. Nulla libero mauris, dapibus non aliquet
                    viverra, elementum eget lorem
                  </p>
                  <br />
                </div>
                <div className="mb-0">
                  <h4 className="mb-3">
                    5. Data transfer, storage &amp; processing globally
                  </h4>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                    quis nisl dignissim, placerat diam ac, egestas ante. Morbi
                    varius quis orci feugiat hendrerit. Morbi ullamcorper
                    consequat justo, in posuere nisi efficitur sed. Vestibulum
                    semper dolor id arcu finibus volutpat. Integer condimentum
                    ex tellus, ac finibus metus sodales in. Proin blandit congue
                    ipsum ac dapibus. Integer blandit eros elit, vel luctus
                    tellus finibus in. Aliquam non urna ut leo vestibulum mattis
                    ac nec dolor. Nulla libero mauris, dapibus non aliquet
                    viverra, elementum eget lorem
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

PrivacyPolicy.displayName = "PrivacyPolicy";
export default PrivacyPolicy;
