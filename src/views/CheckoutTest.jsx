import { Fragment, memo, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CardStyleHover from "../components/cards/CardStyleHover";
import BreadCrumbWidget from "../components/BreadcrumbWidget";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuthStore } from "../stores/useAuthStore";
import CardShimmer from "../components/cards/CardShimmer";
import { formatDuration, toTitleCase } from "../utilities/usePage";
// Stripe imports
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import logger from '../services/logger';

// Replace with your real publishable key (already updated by you)
const stripePromise = loadStripe(
  "pk_test_51RsgvCJ7P89Q3fzUnJcxuyOeIDKhGahdBWjvr40vubwFaMy97J1QlgCmYCDO7J02IB4s5rigAspj3rhtPmRrja7a00g1O79XDP",
);

function StripeCheckoutForm({ onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required",
    });

    setIsProcessing(false);

    if (error) {
      setErrorMessage(error.message || "Payment failed");
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaymentSuccess(paymentIntent);
      logger.log("Payment intent received:", paymentIntent)
    } else if (paymentIntent) {
      setErrorMessage(`Payment status: ${paymentIntent.status}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div className="mb-4">
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <PaymentElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#adb5bd',
                },
              },
            },
          }} />
        </div>
      </div>
      <button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="btn btn-lg w-100 py-3"
        style={{
          background: isProcessing ? '#6c757d' : 'linear-gradient(135deg, #A7CA11 0%, #ff4757 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: isProcessing ? 'none' : '0 8px 25px rgba(247, 2, 10, 0.3)',
          transition: 'all 0.3s ease',
          cursor: isProcessing ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isProcessing) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(247, 2, 10, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isProcessing) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 25px rgba(247, 2, 10, 0.3)';
          }
        }}
      >
        {isProcessing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
      {errorMessage && (
        <div className="mt-3 p-3" style={{
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          borderRadius: '8px',
          color: '#f8d7da'
        }}>
          <small>{errorMessage}</small>
        </div>
      )}
    </form>
  );
}

const CheckoutTest = memo(() => {
  const [datas, setDatas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const { packageId } = useParams();
  // Payment state
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentInitResponse, setPaymentInitResponse] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      fetch(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/fav/user/${user.uid}`,
      )
        .then((resp) => resp.json())
        .then((result) => {
          const filteredResult = result.filter((item) => item.seriesId !== undefined);
          const sortedResult = filteredResult.sort((a, b) => {
            if (a.seriesId.seriesType === "programs") return 1;
            if (b.seriesId.seriesType === "programs") return -1;
            return 0;
          });
          setDatas(sortedResult);
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          logger.error("Data fetch failed:", error);
        });
    } else {
      navigate("/");
    }

  }, [user, isAuthenticated, navigate]);

  const programsAndShows =
    datas?.filter(
      (item) =>
        item.seriesId.seriesType === "show" ||
        item.seriesId.seriesType === "programs" ||
        item.seriesId.seriesType === "singleVideo",
    ) || [];

  const handleCreatePaymentIntent = async () => {
    setIsCreatingPaymentIntent(true);
    setCreateError(null);
    setPaymentSuccess(false);
    setPaymentDetails(null);

    try {
      const response = await fetch("http://localhost:3000/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: packageId,
          member: {
            _id: user.uid,
            mobile: user.phoneNumber,
            email: user.email,
          },
          customerMeta: {
            email: user.email,
            packagePrice: 9.99,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment intent (${response.status})`);
      }

      const data = await response.json();
      // Expecting { clientSecret, paymentIntentId, data: {...}, invoiceId }
      setPaymentInitResponse(data);
      setClientSecret(data.clientSecret);
    } catch (err) {
      setCreateError(err.message || "Unable to create payment intent");
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentSuccess(true);
    setPaymentDetails(paymentIntent);
    try {
      const response = await fetch("http://localhost:3000/stripe/payment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent?.id }),
      });
      const result = await response.json();
      logger.info("Billing and subscription updated successfully:", result);
    } catch (err) {
      logger.error("Failed to update billing/subscription:", err);
    }
  };

  return (
    <Fragment>
      {!isLoading && (
        <Helmet>
          <title>{toTitleCase("Checkout Test")}</title>
        </Helmet>
      )}
      <div className="min-vh-100" style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        position: 'relative'
      }}>
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(247, 2, 10, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(247, 2, 10, 0.05) 0%, transparent 50%)',
          zIndex: 1
        }}></div>
        <Container fluid className="position-relative" style={{ zIndex: 2, paddingTop: '100px', paddingBottom: '50px' }}>
          <Row className="justify-content-center">
            <Col lg="8" md="10" sm="12">
              <div className="text-center mb-5">
                <div className="mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center" style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #A7CA11 0%, #ff4757 100%)',
                    borderRadius: '50%',
                    boxShadow: '0 10px 30px rgba(247, 2, 10, 0.3)'
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M19 7H18V6C18 3.79 16.21 2 14 2H10C7.79 2 6 3.79 6 6V7H5C3.9 7 3 7.9 3 9V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V9C21 7.9 20.1 7 19 7ZM10 4H14C15.1 4 16 4.9 16 6V7H8V6C8 4.9 8.9 4 10 4ZM19 20H5V9H19V20ZM12 12C10.9 12 10 12.9 10 14C10 15.1 10.9 16 12 16C13.1 16 14 15.1 14 14C14 12.9 13.1 12 12 12Z" fill="white"/>
                    </svg>
                  </div>
                </div>
                <h1 className="text-white fw-bold mb-3" style={{ fontSize: '2.5rem' }}>Checkout Test</h1>
                <p className="text-white-50 fs-5">Test your payment integration with Stripe</p>
              </div>

              {/* Payment Control */}
              <div className="mb-5">
                <div className="text-center mb-4">
                  <button
                    className="btn btn-lg px-5 py-3"
                    onClick={handleCreatePaymentIntent}
                    disabled={isCreatingPaymentIntent}
                    style={{
                      background: isCreatingPaymentIntent ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      boxShadow: isCreatingPaymentIntent ? 'none' : '0 8px 25px rgba(40, 167, 69, 0.3)',
                      transition: 'all 0.3s ease',
                      cursor: isCreatingPaymentIntent ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCreatingPaymentIntent) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 12px 35px rgba(40, 167, 69, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCreatingPaymentIntent) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.3)';
                      }
                    }}
                  >
                    {isCreatingPaymentIntent ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Payment Intent...
                      </>
                    ) : (
                      "Create Payment Intent"
                    )}
                  </button>
                  {createError && (
                    <div className="mt-3 p-3" style={{
                      backgroundColor: 'rgba(220, 53, 69, 0.1)',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      borderRadius: '8px',
                      color: '#f8d7da',
                      maxWidth: '500px',
                      margin: '0 auto'
                    }}>
                      {createError}
                    </div>
                  )}
                </div>

                {/* Show PI details returned by API */}
                {paymentInitResponse && (
                  <div className="mb-4" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(247, 2, 10, 0.3)',
                    borderRadius: '16px',
                    padding: '30px',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <h5 className="text-white mb-4 fw-bold text-center">Payment Details</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">PaymentIntent ID</small>
                          <p className="text-white mb-0" style={{ fontSize: '0.9rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {paymentInitResponse.paymentIntentId}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">Amount</small>
                          <p className="text-white mb-0 fw-bold fs-5">
                            {(paymentInitResponse.data.amount / 100).toFixed(2)} {paymentInitResponse.data.currency?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">Status</small>
                          <span className="badge bg-info px-2 py-1">{paymentInitResponse.data.status}</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">Invoice ID</small>
                          <p className="text-white mb-0" style={{ fontSize: '0.9rem' }}>{paymentInitResponse.invoiceId}</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">Receipt Email</small>
                          <p className="text-white mb-0" style={{ fontSize: '0.9rem' }}>{paymentInitResponse.data.receipt_email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                      <small className="text-white-50 d-block mb-1">Description</small>
                      <p className="text-white mb-0">{paymentInitResponse.data.description}</p>
                    </div>
                  </div>
                )}

                {/* Render Stripe Elements form only after we have a clientSecret */}
                {clientSecret && !paymentSuccess && (
                  <div className="mb-4" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(247, 2, 10, 0.3)',
                    borderRadius: '16px',
                    padding: '40px',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <h5 className="text-white mb-4 fw-bold text-center">Complete Your Payment</h5>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripeCheckoutForm onPaymentSuccess={handlePaymentSuccess} />
                    </Elements>
                  </div>
                )}

                {paymentSuccess && (
                  <div className="text-center" style={{
                    background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)',
                    border: '1px solid rgba(40, 167, 69, 0.3)',
                    borderRadius: '16px',
                    padding: '40px',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div className="mb-4">
                      <div className="d-inline-flex align-items-center justify-content-center" style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        borderRadius: '50%',
                        boxShadow: '0 10px 30px rgba(40, 167, 69, 0.3)'
                      }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-white fw-bold mb-4">Payment Successful!</h3>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">PaymentIntent ID</small>
                          <p className="text-white mb-0" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                            {paymentDetails?.id || paymentInitResponse?.paymentIntentId}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">Amount</small>
                          <p className="text-white mb-0 fw-bold fs-5">
                            {paymentInitResponse ? (paymentInitResponse.data.amount / 100).toFixed(2) : "-"} {paymentInitResponse?.data.currency?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">Status</small>
                          <span className="badge bg-success px-3 py-2">{paymentDetails?.status}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                          <small className="text-white-50 d-block mb-1">Invoice ID</small>
                          <p className="text-white mb-0" style={{ fontSize: '0.9rem' }}>{paymentInitResponse?.invoiceId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div className="card-style-grid">
            {isLoading ? (
              <>
                <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2 mb-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Col key={index} className="mb-2 c-padding">
                      <CardShimmer />
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <>
                {programsAndShows.length > 0 && (
                  <Row className="row row-cols-xl-4 row-cols-md-4 row-cols-2 mb-4">
                    {programsAndShows.map((item, index) => (
                      <Col key={index} className="mb-2 c-padding">
                        <CardStyleHover
                          image={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.seriesId.imageCoverBig}`}
                          link={
                            item.seriesId.seriesType === "live"
                              ? `/live/${item.seriesId.ost}/${item.seriesId._id}`
                              : item.seriesId.seriesType === "live-event"
                                ? `/live-event/${item.seriesId.ost}/${item.seriesId._id}`
                                : item.seriesId.seriesType === "singleVideo"
                                  ? `/watch/${item.seriesId.seriesLayout}/${item.seriesId._id}`
                                  : `/series/v3/${item.seriesId._id}`
                          }
                          id={item.seriesId._id}
                          title={item.seriesId.title}
                          seriesType={item.seriesId.seriesType}
                          isFavorite={true}
                          episodeCount={item.seriesId.episodeCount}
                          duration={formatDuration(item.seriesId.duration)}
                          genres={item.seriesId.genresList.filter(
                            (genre) => genre.toLowerCase() !== "telefilms",
                          )}
                          ageRating={item.seriesId.ageRating}
                          trailer={item.seriesId.trailer}
                          packageInfo={item.packageIds}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
                {datas && datas.length === 0 && (
                  <p className="text-center w-100">
                    You haven't added anything to your list.
                  </p>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

CheckoutTest.displayName = "CheckoutTest";
export default CheckoutTest;
