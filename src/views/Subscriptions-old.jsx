import { Fragment, memo, useState, useEffect } from "react";
import logger from '../services/logger';

import toast, { Toaster } from "react-hot-toast";

// react-bootstrap
import { Col, Container, Row } from "react-bootstrap";

// react-router
import { Link } from "react-router-dom";

// components
import BreadcrumbWidget from "../components/BreadcrumbWidget";
import Loader from "../components/ReactLoader";

import { useEnterExit } from "../utilities/usePage";

import Cookies from "universal-cookie";

import { useAuthStore } from "../stores/useAuthStore";

const cookies = new Cookies();

const PricingPage = memo(() => {
  const { user, getUserPlan } = useAuthStore();
  const [userPlan, setUserPlan] = useState("false");

  const fetchAndDisplayUserPlan = async () => {
    const result = await getUserPlan();
    if (result.success) {
      setUserPlan(result.plan);
    } else {
      logger.warn("No user plan found.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchAndDisplayUserPlan();
    }
  }, [user]);

  const [packageData, setPackageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkClick = () => {
    setIsLoading(true);
  };

  const loginRequired = () =>
    toast("Login to Continue!", {
      icon: "👤",
    });

  useEnterExit();
  useEffect(() => {
    if (packageData === null) {
      setIsLoading(true);
      // fetch('https://zapi.aryzap.com/api/packages')
      fetch("https://cdn.aryzap.com/api/zapi_packages.php")
        .then((resp) => resp.json())
        .then((result) => {
          setPackageData(result);
          setIsLoading(false);
        })

        .catch((error) => {
          logger.error("Data fetch failed:", error);
          setIsLoading(false);
        });
    }
  }, [packageData]);

  return (
    <Fragment>
      <BreadcrumbWidget title="Our Plans" />
      {isLoading && <Loader />}
      <div className="section-padding">
        <Container>
          <Row>
            {isLoading ? (
              <></>
            ) : (
              <Col lg="4" md="6" className="mb-3 mb-lg-0  my-3">
                <div className="pricing-plan-wrapper">
                  {!user && (
                    <div className="pricing-plan-discount bg-primary p-2 text-center">
                      <span className="text-white">Active </span>
                    </div>
                  )}

                  {userPlan === "free" && (
                    <div className="pricing-plan-discount bg-primary p-2 text-center">
                      <span className="text-white">Active</span>
                    </div>
                  )}

                  <div className="pricing-plan-header">
                    <h4 className="plan-name text-capitalize text-body">
                      Free Plan
                    </h4>
                    {/* <span className="sale-price text-decoration-line-through">$49</span> */}
                    <span className="main-price text-primary">Rs 0</span>
                    <span className="font-size-18">/ Month</span>
                  </div>
                  <div className="pricing-details">
                    <div className="pricing-plan-description">
                      <ul className="list-inline p-0">
                        <li>
                          <i className="fas fa-check text-primary"></i>
                          <span className="font-size-18 fw-500">
                            Ads free movies and shows
                          </span>
                        </li>
                        <li>
                          <i className="fas fa-times"></i>
                          <span className="font-size-18 fw-500">
                            Watch on TV or Laptop
                          </span>
                        </li>
                        <li>
                          <i className="fas fa-times"></i>
                          <span className="font-size-18 fw-500">
                            Max video quality
                          </span>
                        </li>
                        <li>
                          <i className="fas fa-check text-primary"></i>
                          <span className="font-size-18 fw-500">
                            Allow Screens 1
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pricing-plan-footer">
                      <div className="iq-button">
                        <Link className="btn text-uppercase position-relative">
                          {userPlan === "free" ? (
                            <span className="button-text">Active</span>
                          ) : (
                            <span className="button-text">Free</span>
                          )}
                          <i className="fa-solid fa-play"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            )}
            {packageData &&
              packageData.map((item, i) => (
                <Col lg="4" md="6" className="mb-3 mb-lg-0 my-3">
                  <div className="pricing-plan-wrapper">
                    {userPlan === item.packageLabel && (
                      <div className="pricing-plan-discount bg-primary p-2 text-center">
                        <span className="text-white">Active</span>
                      </div>
                    )}
                    <div className="pricing-plan-header">
                      <h4 className="plan-name text-capitalize text-body">
                        {item.packageName}
                      </h4>
                      {/* <span className="sale-price text-decoration-line-through">$49</span> */}
                      <span className="main-price text-primary">
                        Rs {item.packagePrice}
                      </span>
                      <span className="font-size-18">/ Month</span>
                    </div>
                    <div className="pricing-details">
                      <div className="pricing-plan-description">
                        <ul className="list-inline p-0">
                          <li>
                            <i className="fas fa-check text-primary"></i>
                            <span className="font-size-18 fw-500">
                              Ads free movies and shows
                            </span>
                          </li>
                          <li>
                            <i className="fas fa-check text-primary"></i>
                            <span className="font-size-18 fw-500">
                              Watch on TV or Laptop
                            </span>
                          </li>
                          <li>
                            <i className="fas fa-check text-primary"></i>
                            <span className="font-size-18 fw-500">
                              Max video quality
                            </span>
                          </li>
                          <li>
                            <i className="fas fa-check text-primary"></i>
                            <span className="font-size-18 fw-500">
                              Allow Screens {item.packageAllowScreens}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="pricing-plan-footer">
                        <div className="iq-button">
                          {user ? (
                            userPlan === item.packageLabel ? (
                              <Link className="btn text-uppercase position-relative">
                                <span className="button-text">Active</span>
                                <i className="fa-solid fa-play"></i>
                              </Link>
                            ) : (
                              <Link
                                to={`/checkout/${item._id}/${item.packageName}/${item.packageStripePriceId}/${item.packagePrice}`}
                                onClick={handleLinkClick}
                                className="btn text-uppercase position-relative"
                              >
                                <span className="button-text">
                                  select {item.packageName}
                                </span>
                                <i className="fa-solid fa-play"></i>
                              </Link>
                            )
                          ) : (
                            <Link
                              onClick={loginRequired}
                              className="btn text-uppercase position-relative"
                            >
                              <span className="button-text">
                                select {item.packageName}
                              </span>
                              <i className="fa-solid fa-play"></i>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

PricingPage.displayName = "PricingPage";
export default PricingPage;
