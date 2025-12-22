import { memo, Fragment, useState, useEffect } from "react";

// react-router
import { Link, useLocation } from "react-router-dom";

// react-bootstrap
import { Container, Row, Col } from "react-bootstrap";

// components

import LogoFooter from "./../logoFooter";

// image
const apple = `${import.meta.env.VITE_APP_IMAGE_PATH}images/footer/StoreButtonApple.png`;
const playstore = `${import.meta.env.VITE_APP_IMAGE_PATH}images/footer/StoreButtonGooglePlay.png`;
const androidTV = `${import.meta.env.VITE_APP_IMAGE_PATH}images/footer/StoreButtonAndroidTV.png`;

import { useAuthStore } from "../../stores/useAuthStore";

const FooterMega = memo(() => {
  const [animationClass, setAnimationClass] = useState("animate__fadeIn");

  const location = useLocation();

  const { user } = useAuthStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (document.documentElement.scrollTop > 250) {
      setAnimationClass("animate__fadeIn");
    } else {
      setAnimationClass("animate__fadeOut");
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);
  return (
    <>
      <Fragment>
        <footer className="footer footer-default position-relative overflow-hidden mt-5">
          {/* Right-Side Blurred Image */}
          {/* <div className="footer-blur-image">
    <img
      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/footer-right-bg.svg`} // make sure to import this image
      alt="blur-background"
      className="blurred-img"
    />
  </div> */}

          <div className="footer-gradient-shadow" />

          <Container fluid>
            <div className="footer-bottom aryplus-footer mb-5">

              {/* First Row */}
              <Row className="align-items-center first-row-footer pb-4">
                {/* LEFT COLUMN */}
                <Col md={6} className="text-start footer-margin">

                  <div className="footer-logo">
                    <LogoFooter />
                  </div>

                </Col>

                {/* RIGHT COLUMN */}
                <Col md={6} className="text-start text-md-end footer-margin">


                  <ul className="menu list-inline p-0 d-flex justify-content-start justify-content-md-end flex-wrap mt-4">
                    <li className="menu-item">
                      <Link to="/"> Home </Link>
                    </li>
                    <li className="menu-item">
                      <Link to="/about-us"> About Us </Link>
                    </li>
                    <li className="menu-item">
                      <Link to="/contact-us"> Contact Us </Link>
                    </li>
                    <li className="menu-item">
                      <Link to={`/my-account?rate=true`}> Rate/Review </Link>
                    </li>
                      {import.meta.env.VITE_HELP_CENTER_URL && (
                      <li className="menu-item">
                        <Link to={import.meta.env.VITE_HELP_CENTER_URL} target="_blank"> Help Center </Link>
                      </li>
                    )}
                    {user && (
                      <li className="menu-item">
                        <Link to="/my-account"> Account </Link>
                      </li>
                    )}
                    {/* <li className="menu-item">
                      <Link to="/terms-of-use"> Terms Of Use </Link>
                    </li>
                    <li className="menu-item">
                      <Link to="/privacyPolicy"> Privacy Policy </Link>
                    </li> */}
                  
                    
                  </ul>

                </Col>
              </Row>
              {/* Second Row */}
              <Row className="align-items-center">
                {/* LEFT COLUMN */}
                <Col md={6} className="text-start footer-margin">

                  <h2 className="footer-title">Hello,</h2>
                  <p className="footer-subtitle">Get the App and Start Streaming!</p>

                </Col>

                {/* RIGHT COLUMN */}
                <Col md={6} className="text-end text-md-end footer-margin">
                  <ul className="menu list-inline p-0 d-flex flex-wrap justify-content-md-end">
                    <li className="menu-item">
                      <Link
                        className="app-image"
                        to="https://play.google.com/store/apps/details?id=com.release.arylive&hl=en&gl=US&pli=1"
                      >
                        <img src={playstore} loading="lazy" alt="play-store" />{" "}
                    
                      </Link>
                    </li>
                    <li className="menu-item">
                      <Link
                        className="app-image"
                        to="https://apps.apple.com/cy/app/ary-zap/id1475260911"
                      >
                        <img src={apple} loading="lazy" alt="app-store" /> 
                      </Link>
                    </li>
                    <li className="menu-item">
                      <Link
                        className="app-image"
                        to="https://play.google.com/store/apps/details?id=com.release.aryzaptv&hl=en&pli=1"
                      >
                        <img src={androidTV} loading="lazy" alt="android-tv" />{" "}
                      </Link>
                    </li>
                  </ul>
                </Col>
              </Row>

              {/* Third Row */}

              <Row className="align-items-center">
                {/* LEFT COLUMN */}
                <Col md={4} className="text-start footer-margin">


                  <p className="font-size-14 mt-4">
                    © Powered by{" "}
                    <a
                      target="__blank"
                      className="text-white"
                      href="https://arytech.com"
                    >
                      ARYtech
                    </a>{" "}
                    |{" "}
                    <span className="currentYear">
                      {new Date().getFullYear()}
                    </span>
                  </p>
                </Col>

                {/* CENTER COLUMN */}
                <Col md={4} className="text-center footer-margin">

                  <ul
                    className="menu list-inline p-0 d-flex flex-wrap"
                    style={{ transform: "translateY(60%)" }}
                  >
                    <li className="menu-item">
                      <Link
                        className="app-image"
                        to="https://www.facebook.com/aryzappk/"
                      >
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/facebook-aryplus.png`}
                          loading="lazy"
                          alt="Facebook"
                        />
                      </Link>
                    </li>
                    <li className="menu-item">
                      <Link
                        className="app-image"
                        to="https://www.instagram.com/officialaryzap"
                      >
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/insta-aryplus.png`}
                          loading="lazy"
                          alt="Instagram"
                        />
                      </Link>
                    </li>
                    <li className="menu-item">
                      <Link
                        className="app-image"
                        to="https://x.com/aryzapofficial"
                      >
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/twitter-aryplus.png`}
                          loading="lazy"
                          alt="Twitter"
                        />
                      </Link>
                    </li>
                    <li className="menu-item">
                      <Link
                        className="app-image"
                        to="https://www.youte.com/arydigitalasia"
                      >
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/youtube-aryplus.png`}
                          loading="lazy"
                          alt="Youtube"
                        />
                      </Link>
                    </li>
                  </ul>
                </Col>
                {/* RIGHT COLUMN */}
                <Col md={4} className="text-start text-md-end footer-margin">

                  <ul className="menu list-inline p-0 d-flex justify-content-start justify-content-md-end flex-wrap mt-4">

                    <li className="menu-item">
                      <Link to="/terms-of-use" className="text-decoration-underline"> Terms Of Use </Link>
                    </li>
                    <li className="menu-item">
                      <Link to="/privacyPolicy" className="text-decoration-underline"> Privacy Policy </Link>
                    </li>

                  </ul>

                </Col>
              </Row>

            </div>
          </Container>
          <div
            id="back-to-top"
            style={{ display: "none" }}
            className={`animate__animated ${animationClass}`}
            onClick={scrollToTop}
          >
            <Link
              className="p-0 btn bg-primary btn-sm position-fixed top border-0 rounded-circle"
              id="top"
              to="#top"
            >
              <i className="fa-solid fa-chevron-up"></i>
            </Link>
          </div>
        </footer>
      </Fragment>
    </>
  );
});
FooterMega.displayName = "FooterMega";
export default FooterMega;
