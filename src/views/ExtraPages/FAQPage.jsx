import { Fragment, memo, useState } from "react";

//react bootstrap
import { Col, Container, Row } from "react-bootstrap";
import BreadcrumbWidget from "../../components/BreadcrumbWidget";

const FAQPage = memo(() => {
  const [faq, setfaq] = useState("1");
  return (
    <Fragment>
      <BreadcrumbWidget title="Frequently Asked Questions" />
      <div className="section-padding">
        <Container>
          <Row>
            <Col lg="12" sm="12">
              <div className="iq-accordian iq-accordian-square">
                <div
                  className={`iq-accordian-block ${
                    faq === "1" ? "iq-active" : ""
                  }`}
                  onClick={() => {
                    setfaq("1");
                  }}
                >
                  <div className="iq-accordian-title">
                    <div className="iq-icon-right">
                      <i aria-hidden="true" className="fa fa-minus active"></i>
                      <i aria-hidden="true" className="fa fa-plus inactive"></i>
                    </div>
                    <h4 className="mb-0 accordian-title iq-heading-title">
                      What is ARY ZAP?
                    </h4>
                  </div>
                  <div
                    className={`iq-accordian-details ${
                      faq === "1" ? "d-block" : "d-none"
                    }`}
                  >
                    <p className="iq-content-text">
                      {" "}
                      ARY ZAP is an OTT platform where you can stream live TV,
                      dramas, shows, movies, and more from ARY Networks. Our app
                      brings entertainment to your fingertips with content
                      across multiple genres and languages.{" "}
                    </p>
                  </div>
                </div>

                <div
                  className={`iq-accordian-block 2  ${
                    faq === "2" ? "iq-active" : ""
                  }`}
                  onClick={() => {
                    setfaq("2");
                  }}
                >
                  <div className="iq-accordian-title">
                    <div className="iq-icon-right">
                      <i aria-hidden="true" className="fa fa-minus active"></i>
                      <i aria-hidden="true" className="fa fa-plus inactive"></i>
                    </div>
                    <h4 className="mb-0 accordian-title iq-heading-title">
                      How do I sign up for ARY ZAP?
                    </h4>
                  </div>
                  <div
                    className={`iq-accordian-details ${
                      faq === "2" ? "d-block" : "d-none"
                    }`}
                  >
                    <p className="iq-content-text">
                      {" "}
                      You can sign up for ARY ZAP by downloading the app from
                      the App Store or Google Play, or by visiting our website.
                      Once you create an account, you’ll have access to our wide
                      range of content.{" "}
                    </p>
                  </div>
                </div>

                <div
                  className={`iq-accordian-block 3  ${
                    faq === "3" ? "iq-active" : ""
                  }`}
                  onClick={() => {
                    setfaq("3");
                  }}
                >
                  <div className="iq-accordian-title">
                    <div className="iq-icon-right">
                      <i aria-hidden="true" className="fa fa-minus active"></i>
                      <i aria-hidden="true" className="fa fa-plus inactive"></i>
                    </div>
                    <h4 className="mb-0 accordian-title iq-heading-title">
                      Is ARY ZAP free to use?
                    </h4>
                  </div>
                  <div
                    className={`iq-accordian-details ${
                      faq === "3" ? "d-block" : "d-none"
                    }`}
                  >
                    <p className="iq-content-text">
                      {" "}
                      Yes, ARY ZAP offers free streaming of select content.
                      However, some premium content may require a subscription
                      or a pay-per-view fee.{" "}
                    </p>
                  </div>
                </div>

                <div
                  className={`iq-accordian-block 4 ${
                    faq === "4" ? "iq-active" : ""
                  }`}
                  onClick={() => {
                    setfaq("4");
                  }}
                >
                  <div className="iq-accordian-title">
                    <div className="iq-icon-right">
                      <i aria-hidden="true" className="fa fa-minus active"></i>
                      <i aria-hidden="true" className="fa fa-plus inactive"></i>
                    </div>
                    <h4 className="mb-0 accordian-title iq-heading-title">
                      Which devices are compatible with ARY ZAP?
                    </h4>
                  </div>
                  <div
                    className={`iq-accordian-details ${
                      faq === "4" ? "d-block" : "d-none"
                    }`}
                  >
                    <p className="iq-content-text">
                      {" "}
                      ARY ZAP is compatible with most smartphones, tablets,
                      smart TVs, and web browsers. Download our app on Android
                      or iOS, or stream directly from our website.{" "}
                    </p>
                  </div>
                </div>

                <div
                  className={`iq-accordian-block 5 ${
                    faq === "5" ? "iq-active" : ""
                  }`}
                  onClick={() => {
                    setfaq("5");
                  }}
                >
                  <div className="iq-accordian-title">
                    <div className="iq-icon-right">
                      <i aria-hidden="true" className="fa fa-minus active"></i>
                      <i aria-hidden="true" className="fa fa-plus inactive"></i>
                    </div>
                    <h4 className="mb-0 accordian-title iq-heading-title">
                      What type of content is available on ARY ZAP?
                    </h4>
                  </div>
                  <div
                    className={`iq-accordian-details ${
                      faq === "5" ? "d-block" : "d-none"
                    }`}
                  >
                    <p className="iq-content-text">
                      {" "}
                      ARY ZAP offers a wide variety of content, including live
                      TV channels, dramas, movies, reality shows, and exclusive
                      digital content from ARY Networks.{" "}
                    </p>
                  </div>
                </div>

                <div
                  className={`iq-accordian-block 6 ${
                    faq === "6" ? "iq-active" : ""
                  }`}
                  onClick={() => {
                    setfaq("6");
                  }}
                >
                  <div className="iq-accordian-title">
                    <div className="iq-icon-right">
                      <i aria-hidden="true" className="fa fa-minus active"></i>
                      <i aria-hidden="true" className="fa fa-plus inactive"></i>
                    </div>
                    <h4 className="mb-0 accordian-title iq-heading-title">
                      Can I watch ARY ZAP content internationally?
                    </h4>
                  </div>
                  <div
                    className={`iq-accordian-details ${
                      faq === "6" ? "d-block" : "d-none"
                    }`}
                  >
                    <p className="iq-content-text">
                      {" "}
                      Yes, ARY ZAP is available in many countries. However, the
                      availability of certain content may vary depending on
                      regional licensing.{" "}
                    </p>
                  </div>
                </div>

                <div
                  className={`iq-accordian-block 7 ${
                    faq === "7" ? "iq-active" : ""
                  }`}
                  onClick={() => {
                    setfaq("7");
                  }}
                >
                  <div className="iq-accordian-title">
                    <div className="iq-icon-right">
                      <i aria-hidden="true" className="fa fa-minus active"></i>
                      <i aria-hidden="true" className="fa fa-plus inactive"></i>
                    </div>
                    <h4 className="mb-0 accordian-title iq-heading-title">
                      How do I manage my account settings?
                    </h4>
                  </div>
                  <div
                    className={`iq-accordian-details ${
                      faq === "7" ? "d-block" : "d-none"
                    }`}
                  >
                    <p className="iq-content-text">
                      {" "}
                      You can manage your account settings by going to the
                      “Account” section in the ARY ZAP app or website. Here, you
                      can update your profile, change your password, and manage
                      your subscription.{" "}
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

FAQPage.displayName = "FAQPage";
export default FAQPage;
