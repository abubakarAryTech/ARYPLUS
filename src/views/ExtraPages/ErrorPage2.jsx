import React, { Fragment, memo } from "react";

//react bootstrap
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
// import { generateImgPath } from "../../StaticData/data";

import { AnimatePresence, motion } from "framer-motion";

const ErrorPage2 = memo(() => {
  return (
    // <Fragment>
    //   <div
    //     className="section-padding vh-100 image-flip-rtl"
    //     style={{
    //       backgroundImage: `url(${generateImgPath(
    //         "/assets/images/pages/404-two.webp"
    //       )})`,
    //       backgroundSize: "cover",
    //       backgroundRepeat: "no-repeat",
    //       position: "relative",
    //       minHeight: "500px",
    //     }}
    //   >
    //     <Container className="h-100">
    //       <Row className="h-100 align-items-center">
    //         <Col lg="6"></Col>
    //         <Col lg="5">
    //           <img
    //             src="/assets/images/pages/404-text.webp"
    //             alt="404"
    //             loading="lazy"
    //             className="mb-5"
    //           />
    //           <h4 className="fw-bold text-center">
    //             ohhh no..! you lost in imagination.
    //           </h4>
    //           <p className="text-center">
    //             we are sorry, but the page you are looking for doesn’t exist.
    //           </p>
    //           <div className="text-center mt-4 pt-3">
    //             <div className="iq-button">
    //               <Link to="/" className="btn text-uppercase position-relative">
    //                 <span className="button-text">Back to home</span>
    //                 <i className="fa-solid fa-play"></i>
    //               </Link>
    //             </div>
    //           </div>
    //         </Col>
    //         <Col lg="1"></Col>
    //       </Row>
    //     </Container>
    //   </div>
    // </Fragment>
    <Fragment>
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
              <Container className="mt-5">
                {/* Main Signup Content */}
                <Row className="h-100 align-items-center text-center mt-5">
                  <Col
                    lg="12"
                    md="12"
                    sm="12"
                    xs="12"
                    className="d-flex flex-column justify-content-center align-items-center gap-4 text-left text-md-center"
                  >
                    {/* <img
                      src="/assets/images/pages/404-text.webp"
                      alt="404"
                      loading="lazy"
                      className="mb-5 w-25"
                    /> */}
                    {/* <h4 className="fw-bold text-center">
                      ohhh no..! you lost in imagination.
                    </h4> */}
                    {/* <p className="text-center">
                      we are sorry, but the page you are looking for doesn’t exist.
                    </p> */}
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
                    <div className="my-4">
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
                    <div className="text-center mt-4 pt-3">
                      <div className="">
                        <div className="iq-button ">
                          <Link
                            to="/"
                            className="btn newbtn text-uppercase position-relative"
                          >
                            <span className="button-text">Back to home</span>
                            <i className="fa-solid fa-play"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Container>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </Fragment>
  );
});

export default ErrorPage2;
