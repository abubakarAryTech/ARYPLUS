import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { FaCheckCircle, FaExclamationCircle, FaCreditCard, FaBoxOpen, FaClock } from "react-icons/fa";
import axios from "axios";
import qs from "query-string";
import logger from '../services/logger';

const BuyPage = () => {
  // All hooks at the top, before any return or conditional
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const query = new URLSearchParams(location.search);
  const packageIdFromQuery = query.get('packageId');
  const effectiveId = packageIdFromQuery || params.packageId || params.id || params.subscriptionID || params.basket_id;
  const [loading, setLoading] = useState(!location.state?.selectedPackage);
  const [error, setError] = useState("");
  // const [showModal, setShowModal] = useState(false);
  // const [iframeUrl, setIframeUrl] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [connectPayId, setConnectPayId] = useState(null);
  // const [iframeLoading, setIframeLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [payproStatus, setPayproStatus] = useState(null);
  const [billingStatus, setBillingStatus] = useState(null);
  const [checkoutDisabled, setCheckoutDisabled] = useState(false);
  const [pendingBillingMessage, setPendingBillingMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [payfastLoading, setPayfastLoading] = useState(false);
  const [payfastError, setPayfastError] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState(null); // "success" or "failure"
  const [resultParams, setResultParams] = useState({});
  const [selectedPackage, setSelectedPackage] = useState(location.state?.selectedPackage || null);

  useEffect(() => {
    if (!selectedPackage && effectiveId) {
      logger.log('Fetching package for ID:', effectiveId);
      setLoading(true);
      axios.get(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/packages/${effectiveId}`)
        .then(res => {
          logger.log('API response for package:', res.data);
          setSelectedPackage(res.data);
        })
        .catch((err) => {
          logger.error('Error fetching package:', err);
          setSelectedPackage(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [effectiveId]);

  useEffect(() => {
    // Detect PayFast callback params (e.g., err_code, err_msg, etc.)
    const params = new URLSearchParams(location.search);
    logger.log("PayFast callback params detected:", Object.fromEntries(params.entries()));
    if (params.has("err_code") || params.has("err_msg") || params.has("transaction_id")) {
      // Send callback params to backend for logging/processing
      axios.post(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/payfast/callback`, Object.fromEntries(params.entries()));
      // Do NOT redirect!
    }
  }, [location.search]);

  useEffect(() => {
    // Re-enable checkout if billingStatus is not Pending
    if (billingStatus && billingStatus.toUpperCase() !== 'PENDING') {
      setCheckoutDisabled(false);
      setPendingBillingMessage("");
    }
    // Redirect if payment is successful
    if (billingStatus && billingStatus.toUpperCase() === 'PAID') {
      setTimeout(() => {
        navigate(location.state?.from || '/', { replace: true });
      }, 1500); // 1.5 seconds for user to see the success message
    }
  }, [billingStatus, navigate, location.state]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errCode = params.get("err_code");
    if (
      errCode &&
      errCode !== "000" &&
      errCode !== "00"
    ) {
      // Show failure modal for any non-success err_code
      setResultType("failure");
      setResultParams({
        err_code: errCode,
        err_msg: params.get("err_msg"),
        transaction_id: params.get("transaction_id"),
        order_date: params.get("order_date"),
      });
      setShowResultModal(true);
    } else if (
      params.has("transaction_id") &&
      (!errCode || errCode === "000" || errCode === "00")
    ) {
      // Show success modal for success codes or missing err_code
      setResultType("success");
      setResultParams({
        transaction_id: params.get("transaction_id"),
        order_date: params.get("order_date"),
      });
      setShowResultModal(true);
    } else {
      setShowResultModal(false);
      setResultType(null);
      setResultParams({});
    }
  }, [location.search]);

  // Handler for Checkout button
  const handleCheckout = async () => {
    if (!selectedPackage) return;
    setCheckoutLoading(true);
    setError("");
    setPendingBillingMessage("");
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/memberv2/pay`,
        { packageId: selectedPackage._id },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
          },
        }
      );
      if (resp.data.billing && resp.data.billing.billingStatus === 'Pending') {
        setCheckoutDisabled(true);
        setPendingBillingMessage("A payment is already pending for this package. Please complete the payment or wait for it to expire.");
        setCheckoutLoading(false);
        return;
      }
      const url = resp.data.paypro[1].Click2Pay;
      const orderIdFromPayPro = resp.data.paypro[1].OrderNumber;
      const connectPayIdFromPayPro = resp.data.paypro[1].ConnectPayId;
      setOrderId(orderIdFromPayPro);
      setConnectPayId(connectPayIdFromPayPro);
      setCheckoutDisabled(true);
      setCheckoutLoading(false);
      logger.log('Paypro Res', resp.data, url, orderIdFromPayPro, connectPayIdFromPayPro);
      // Open headless window (popup)
      const win = window.open(
        url,
        "_blank",
        "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500,height=700"
      );
      setPaymentWindow(win);
    } catch (err) {
      setError("Failed to create billing. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const handlePayfastPayment = async () => {
    if (!selectedPackage) return;
    setPayfastLoading(true);
    setPayfastError("");
    try {
      // 1. Get token from PayFast.js backend route
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/payfast/get-token`,
        {
          packageId: selectedPackage._id || "ZAP123",
          amount: selectedPackage.packagePrice,
        }
      );
      // FE Form
      const token = res.data.token.ACCESS_TOKEN;
      logger.log('Token received:',res.data, token);
      if (!token) throw new Error("No token received");

      // 2. Build the form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

      const fields = {
        CURRENCY_CODE: "PKR",
        MERCHANT_ID: "102",
        MERCHANT_NAME: "ARY_ZAP",
        TOKEN: token,
        SUCCESS_URL: window.location.origin + "/success",
        FAILURE_URL: window.location.origin + "/failure",
        CHECKOUT_URL: window.location.origin + "/checkout",
        CUSTOMER_EMAIL_ADDRESS: "test@example.com",
        CUSTOMER_MOBILE_NO: "03001234567",
        TXNAMT: selectedPackage.packagePrice,
        BASKET_ID: res.data.billingId,
        ORDER_DATE: new Date().toISOString().slice(0, 19).replace("T", " "),
        SIGNATURE: "SOMERANDOM-STRING",
        VERSION: "MERCHANTCART0.1",
        TXNDESC: `Purchase of ${selectedPackage.packageName}`,
        PROCCODE: "00",
        TRAN_TYPE: "ECOMM_PURCHASE",
        STORE_ID: "102-ZEOJDZS3V",
        RECURRING_TXN: "FALSE",
        MERCHANT_USERAGENT: navigator.userAgent,
        // Add items if needed
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);

      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data.form, 'text/html');
      const beForm = doc.querySelector('form');
      logger.log('Form generated Backend:', res.data.form)
      logger.log('Form generated Frontend:', form)
      logger.log('Form parsed:', beForm)
      logger.log('Type of forms', typeof form, typeof beForm)
      // form.submit();
      document.body.appendChild(beForm);
      beForm.submit();
    } catch (err) {
      setPayfastError("Failed to initiate PayFast payment. " + (err?.message || ""));
    } finally {
      setPayfastLoading(false);
    }
  };

  // Remove check status button and implement polling
  useEffect(() => {
    if (!connectPayId) return;
    let interval;
    let pollCount = 0;
    const maxPolls = 18; // e.g., poll for 3 minutes

    const pollStatus = async () => {
      setLoading(true);
      try {
        const resp = await axios.post(
          `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/paypro/order-status`,
          {
            userName: import.meta.env.VITE_PAYPRO_MERCHANT_ID,
            cpayId: connectPayId,
          },
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
            },
          }
        );
        setPayproStatus(resp.data.payproStatus);
        setBillingStatus(resp.data.billingStatus);
        setOrderStatus(resp.data.payproStatus || resp.data.billingStatus || JSON.stringify(resp.data));
        setStep(3);
        if (resp.data.billingStatus && resp.data.billingStatus.toUpperCase() === 'PAID') {
          clearInterval(interval);
        }
      } catch (err) {
        setOrderStatus("Could not fetch order status");
        setStep(3);
      } finally {
        setLoading(false);
      }
      pollCount += 1;
      if (pollCount >= maxPolls) {
        clearInterval(interval);
      }
    };

    interval = setInterval(pollStatus, 10000); // poll every 10 seconds
    pollStatus(); // initial call

    return () => clearInterval(interval);
  }, [connectPayId]);

  // Stepper UI
  const renderStepper = () => (
    <Row className="justify-content-center mb-4">
      <Col xs={12} md={10} lg={8}>
        <div className="d-flex justify-content-between align-items-center stepper-container" style={{marginBottom: 16}}>
          {/* Step 1 */}
          <div className="d-flex flex-column align-items-center" style={{minWidth: 90}}>
            <div className={`stepper-circle mb-1 ${step === 1 ? 'active-step' : 'inactive-step'}`} style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step === 1 ? '#A7CA11' : '#23232b', color: '#fff', fontWeight: 700, fontSize: 18, border: step === 1 ? '2px solid #A7CA11' : '2px solid #23232b', boxShadow: step === 1 ? '0 0 8px #A7CA1155' : 'none', transition: 'all 0.2s'
            }}>{1}</div>
            <span className={`stepper-label ${step === 1 ? 'fw-bold text-white' : 'text-white-50'}`} style={{fontSize: 14}}>Order Summary</span>
          </div>
          <div className="stepper-line flex-grow-1 mx-2" style={{height:2, background: step >= 2 ? '#A7CA11' : '#23232b', minWidth: 30}}></div>
          {/* Step 2 */}
          <div className="d-flex flex-column align-items-center" style={{minWidth: 90}}>
            <div className={`stepper-circle mb-1 ${step === 2 ? 'active-step' : 'inactive-step'}`} style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step === 2 ? '#A7CA11' : '#23232b', color: '#fff', fontWeight: 700, fontSize: 18, border: step === 2 ? '2px solid #A7CA11' : '2px solid #23232b', boxShadow: step === 2 ? '0 0 8px #A7CA1155' : 'none', transition: 'all 0.2s'
            }}>{2}</div>
            <span className={`stepper-label ${step === 2 ? 'fw-bold text-white' : 'text-white-50'}`} style={{fontSize: 14}}>Payment</span>
          </div>
          <div className="stepper-line flex-grow-1 mx-2" style={{height:2, background: step === 3 ? '#A7CA11' : '#23232b', minWidth: 30}}></div>
          {/* Step 3 */}
          <div className="d-flex flex-column align-items-center" style={{minWidth: 90}}>
            <div className={`stepper-circle mb-1 ${step === 3 ? 'active-step' : 'inactive-step'}`} style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step === 3 ? '#A7CA11' : '#23232b', color: '#fff', fontWeight: 700, fontSize: 18, border: step === 3 ? '2px solid #A7CA11' : '2px solid #23232b', boxShadow: step === 3 ? '0 0 8px #A7CA1155' : 'none', transition: 'all 0.2s'
            }}>{3}</div>
            <span className={`stepper-label ${step === 3 ? 'fw-bold text-white' : 'text-white-50'}`} style={{fontSize: 14}}>Status</span>
          </div>
        </div>
      </Col>
    </Row>
  );

  // Order status alert with icon
  const renderStatusAlert = () => {
    if (!payproStatus && !billingStatus && !orderStatus) return null;
    let icon = null;
    let variant = "info";
    let message = "";
    if (billingStatus?.toUpperCase() === "PAID") {
      icon = <FaCheckCircle className="text-success me-2" size={22} />;
      variant = "success";
      message = "Payment successful! You now have access.";
    } else if (payproStatus?.toUpperCase() === "PAID") {
      icon = <FaCheckCircle className="text-success me-2" size={22} />;
      variant = "info";
      message = "Payment confirmed by PayPro. Finalizing your order. Please wait...";
    } else if (payproStatus?.toUpperCase() === "UNPAID" || billingStatus?.toUpperCase() === "UNPAID" || orderStatus?.toUpperCase() === "UNPAID") {
      icon = <FaExclamationCircle className="text-danger me-2" size={22} />;
      variant = "danger";
      message = "Payment not yet received. Please wait or try again.";
    } else if (orderStatus === "Could not fetch order status") {
      icon = <FaExclamationCircle className="text-danger me-2" size={22} />;
      variant = "danger";
      message = orderStatus;
    } else {
      icon = <FaClock className="text-warning me-2" size={22} />;
      variant = "warning";
      message = `Order Status: ${payproStatus || billingStatus || orderStatus}`;
    }
    return (
      <Alert variant={variant} className="d-flex align-items-center justify-content-center text-center bg-li-series border-0 text-white fw-semibold" style={{fontSize:18}}>
        {icon} <span>{message}</span>
      </Alert>
    );
  };

  return (
    <>
      {/* Modal logic always rendered */}
      <Modal
        show={showResultModal}
        onHide={() => setShowResultModal(false)}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName="border-0"
      >
        <Modal.Body
          className="text-center"
          style={{
            background: "#23232b",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)"
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {resultType === "success" ? (
              <FaCheckCircle style={{ color: "#4caf50" }} />
            ) : (
              <FaExclamationCircle style={{ color: "#f44336" }} />
            )}
          </div>
          <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 12 }}>
            {resultType === "success" ? "Payment Successful" : "Payment Failed"}
          </h4>
          <div style={{ color: "#bdbdbd", marginBottom: 8 }}>
            {resultType === "success"
              ? "Your payment was successful!"
              : "There was a problem processing your payment."}
          </div>
          {resultType === "success" ? (
            <Button
              variant="primary"
              className="fw-bold py-2 fs-6 shadow-sm newbtn"
              style={{ borderRadius: 8, minWidth: 110, marginTop: 24 }}
              onClick={() => {
                setShowResultModal(false);
                window.location.href = "/";
              }}
            >
              Go to Home
            </Button>
          ) : (
            <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
              <Button
                variant="primary"
                className="fw-bold py-2 fs-6 shadow-sm newbtn"
                style={{ borderRadius: 8, minWidth: 110, flex: 1 }}
                onClick={() => {
                  setShowResultModal(false);
                  // Remove trailing /failure or /success from the pathname
                  const basePath = window.location.pathname.replace(/\/(failure|success)$/, "");
                  // Only keep packageId in the query string
                  const params = new URLSearchParams(window.location.search);
                  const newParams = new URLSearchParams();
                  if (params.get("packageId")) {
                    newParams.set("packageId", params.get("packageId"));
                  }
                  window.location.href = basePath + (newParams.toString() ? "?" + newParams.toString() : "");
                }}
              >
                Retry
              </Button>
              <Button
                variant="outline-secondary"
                className="fw-bold py-2 fs-6 newbtn"
                style={{ borderRadius: 8, minWidth: 110, flex: 1 }}
                onClick={() => {
                  setShowResultModal(false);
                  window.location.href = "/";
                }}
              >
                Go to Home
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {loading ? (
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span>Loading...</span>
        </div>
      ) : !selectedPackage ? (
        <Container className="py-5"><Alert variant="danger">Package not found.</Alert></Container>
      ) : (
        <div className="main-content" style={{ minHeight: "100vh", background: "rgba(31, 31, 31, 1);" }}>
          <Container className="py-5">
            {renderStepper()}
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <Card className="mb-4 shadow-lg border-0 bg-li-series text-white" style={{ borderRadius: 18, background: "#141314" }}>
                  <Card.Body>
                    <h3 className="mb-4 text-center fw-bold" style={{ letterSpacing: 1, color: '#fff' }}>Buy Subscription</h3>
                    <div className="mb-4 order-summary-section p-3 rounded" style={{ background: "#23232b", border: "1px solid #23232b" }}>
                      <div className="d-flex align-items-center mb-2">
                        <FaBoxOpen className="me-2 text-primary" size={22} />
                        <span className="fw-semibold fs-5 text-white">{selectedPackage?.packageName || ''}</span>
                      </div>
                      <div className="mb-2"><strong className="text-white">Price:</strong> <span className="text-primary fs-5">{selectedPackage?.packagePrice === "0" ? "Free" : selectedPackage?.packagePrice ? `Rs ${selectedPackage.packagePrice}` : ''}</span></div>
                      <div className="mb-2"><strong className="text-white">Duration:</strong> {selectedPackage?.packageDays ? `${selectedPackage.packageDays} days` : ''}</div>
                      <div className="mb-2"><strong className="text-white">Features:</strong>
                        <ul className="mb-1 ps-3">
                          {(selectedPackage?.packageDetails || '').split(",").map((f, i) => <li key={i} className="text-white-50">{f.trim()}</li>)}
                          <li className="text-white-50">Allow Screens: {selectedPackage?.packageAllowScreens || ''}</li>
                        </ul>
                      </div>
                    </div>
                    {renderStatusAlert()}
                    {error && <Alert variant="danger" className="bg-danger border-0 text-white">{error}</Alert>}
                    {/* Only show checkout button if not paid */}
                    {billingStatus?.toUpperCase() !== 'PAID' && (
                      <div className="d-grid gap-2 mt-4 iq-button">
                        <Button
                          variant="newbtn"
                          size="lg"
                          className="fw-bold py-3 fs-5 shadow-sm newbtn"
                          style={{ borderRadius: 12, letterSpacing: 1, boxShadow: "0 2px 12px rgba(13,110,253,0.08)" }}
                          onClick={handleCheckout}
                          disabled={checkoutLoading || checkoutDisabled}
                        >
                          {checkoutLoading ? <Spinner animation="border" size="sm" /> : <><FaCreditCard className="me-2 mb-1" /> Pay with PayPro</>}
                        </Button>
                        {/* PayFast Button */}
                        <Button
                          variant="success"
                          size="lg"
                          className="fw-bold py-3 fs-5 shadow-sm newbtn"
                          style={{ borderRadius: 12, letterSpacing: 1,  boxShadow: "0 2px 12px rgba(13,110,253,0.08)" }}
                          onClick={handlePayfastPayment}
                          disabled={payfastLoading}
                        >
                          {payfastLoading ? "Processing..." :<><FaCreditCard className="me-2 mb-1" /> Pay with PayFast</>}
                        </Button>
                        {payfastError && <div style={{ color: "red", marginTop: 8 }}>{payfastError}</div>}
                      </div>
                    )}
                    {pendingBillingMessage && (
                      <Alert variant="warning" className="mt-2">{pendingBillingMessage}</Alert>
                    )}
                    {/* {orderId && (
                      <div className="d-grid gap-2 mt-2">
                        <Button
                          variant="outline-info"
                          size="md"
                          className="fw-bold"
                          onClick={checkOrderStatus}
                          disabled={loading}
                        >
                          {loading ? <Spinner animation="border" size="sm" /> : "Check Payment Status"}
                        </Button>
                      </div>
                    )} */}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* Payment Modal */}
            {/* <Modal show={showModal} onHide={handleModalClose} size="lg" centered contentClassName="rounded-4 border-0 bg-li-series text-white">
              <Modal.Header closeButton className="border-0 pb-0 bg-li-series text-white">
                <Modal.Title className="fw-bold text-white">Complete Payment</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ background: "#23232b", borderRadius: 18 }}>
                {iframeUrl ? (
                  <iframe
                    src={iframeUrl}
                    title="Payment"
                    width="100%"
                    height="440"
                    style={{ border: "1px solid #23232b", borderRadius: 12, display: iframeLoading ? 'none' : 'block', background: '#141314' }}
                    allow="payment"
                    onLoad={() => setIframeLoading(false)}
                  />
                ) : (
                  <div className="text-white-50">Loading payment gateway...</div>
                )}
                {iframeLoading && <div className="d-flex flex-column align-items-center justify-content-center text-white-50" style={{height: 440}}><Spinner animation="border" variant="primary" /><div className="mt-2">Loading payment gateway...</div></div>}
              </Modal.Body>
              <Modal.Footer className="border-0 pt-0 bg-li-series text-white">
                <Button variant="outline-light" onClick={handleModalClose} className="fw-semibold px-4 py-2 rounded-3">
                  Close
                </Button>
              </Modal.Footer>
            </Modal> */}
          </Container>
        </div>
      )}
    </>
  );
};

export default BuyPage; 