import { Fragment, memo, useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import BreadcrumbWidget from "../components/BreadcrumbWidget";
import Loader from "../components/ReactLoader";
import classNames from "classnames";
import axios from "axios";
import logger from '../services/logger';

const PackagesPage = memo(() => {
  const [packageData, setPackageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (packageData === null) {
      setIsLoading(true);
      // Fetch packages from API
      axios
        .get(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/packages/`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
            }
          }
        )
        .then((response) => {
          logger.log(response.data);
          setPackageData(response.data);
        })
        .catch((error) => {
          logger.error("Failed to fetch packages:", error);
          setPackageData([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  // Always show 4 cards in a row
  const cardsToShow = 4;
  const packages = packageData || [];
  const placeholders = Array(cardsToShow - packages.length > 0 ? cardsToShow - packages.length : 0).fill(null);

  // Get selected package
  const selectedPackage = selectedIdx !== null ? packages[selectedIdx] : null;

  // Handle Next button click
  const handleNext = async () => {
    if (!selectedPackage) return;
    const packageId = selectedPackage._id;
    // Redirect to new buy page with selected package in state
    navigate(`/checkout/${packageId}`, { state: { selectedPackage } });
  };

  return (
    <Fragment>
      <BreadcrumbWidget title="Subscription Packages" />
      {isLoading && <Loader />}
      <div className="section-padding" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Container>
          <Row className="justify-content-center">
            {/* Render all package cards (including Free Plan) */}
            {packages.slice(0, cardsToShow).map((item, i) => (
              <Col lg={3} md={6} sm={12} className="mb-3 my-3 d-flex" key={item._id || i} style={{ minWidth: 260, maxWidth: 320 }}>
                <div
                  className={classNames("pricing-plan-wrapper flex-fill d-flex flex-column align-items-stretch", {
                    "border border-primary shadow-lg": selectedIdx === i,
                    "cursor-pointer": true
                  })}
                  style={{ minHeight: 420, cursor: "pointer", boxShadow: selectedIdx === i ? "0 0 0 2px #0d6efd" : undefined }}
                  onClick={() => setSelectedIdx(i)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedIdx === i}
                >
                  {/* Popular label */}
                  {item.popular && (
                    <div style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "#ffc107",
                      color: "#212529",
                      padding: "4px 12px",
                      borderRadius: 16,
                      fontWeight: 700,
                      fontSize: 14,
                      zIndex: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                      Popular
                    </div>
                  )}
                  <div className="pricing-plan-header">
                    <h4 className="plan-name text-capitalize text-body">
                      {item.packageName}
                    </h4>
                    <span className="main-price text-primary">
                      Rs {item.packagePrice}
                    </span>
                    <span className="font-size-18">/ {item.packageDays} Days</span>
                  </div>
                  <div className="pricing-details flex-grow-1">
                    <div className="pricing-plan-description">
                      <ul className="list-inline p-0">
                        {item.packageDetails.split(',').map((feature, idx) => (
                          <li key={idx}>
                            <i className="fas fa-check text-primary"></i>
                            <span className="font-size-18 fw-500">
                              {feature.trim()}
                            </span>
                          </li>
                        ))}
                        <li>
                          <i className="fas fa-check text-primary"></i>
                          <span className="font-size-18 fw-500">
                            Allow Screens {item.packageAllowScreens}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* No per-card button */}
                </div>
              </Col>
            ))}
            {/* Render placeholder cards if less than 4 */}
            {placeholders.map((_, idx) => (
              <Col lg={3} md={6} sm={12} className="mb-3 my-3 d-flex" key={"placeholder-" + idx} style={{ minWidth: 260, maxWidth: 320 }}>
                <div className="pricing-plan-wrapper flex-fill" style={{ minHeight: 420, opacity: 0.2, background: '#f5f5f5' }}>
                </div>
              </Col>
            ))}
          </Row>
          {/* Next button centered below cards */}
          <Row className="justify-content-center">
            <Col xs={12} className="d-flex justify-content-center mt-4">
              {selectedPackage && selectedPackage.packagePrice !== "0" ? (
                <button
                  className="btn btn-primary btn-lg px-5"
                  onClick={handleNext}
                >
                  Next
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg px-5"
                  disabled={selectedPackage === null}
                  style={{ opacity: selectedPackage === null ? 0.5 : 1 }}
                >
                  Next
                </button>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

PackagesPage.displayName = "PackagesPage";
export default PackagesPage;
