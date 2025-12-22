import { Fragment, memo, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import logger from '../services/logger';

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
    } else if (paymentIntent) {
      setErrorMessage(`Payment status: ${paymentIntent.status}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div className="mb-4">
        <h5 className="text-white mb-3 fw-semibold">Payment Information</h5>
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
            Processing Payment...
          </>
        ) : (
          "Complete Payment"
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

const CompletePayment = memo(() => {
  const [searchParams] = useSearchParams();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();

  const clientSecret = searchParams.get("client_secret");
  const paymentIntentId = searchParams.get("payment_intent_id");

  useEffect(() => {
    if (!clientSecret || !paymentIntentId) {
      navigate("/my-account");
    }
  }, [clientSecret, paymentIntentId, navigate]);

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

  if (!clientSecret) {
    return null;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Complete Payment</title>
      </Helmet>
      <div className="min-vh-100 d-flex align-items-center" style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        position: 'relative'
      }}>
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(247, 2, 10, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(247, 2, 10, 0.05) 0%, transparent 50%)',
          zIndex: 1
        }}></div>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="justify-content-center">
            <Col lg="6" md="8" sm="12">
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
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z" fill="white"/>
                    </svg>
                  </div>
                </div>
                <h1 className="text-white fw-bold mb-3" style={{ fontSize: '2.5rem' }}>Complete Your Payment</h1>
                <p className="text-white-50 fs-5">Finish your pending payment to activate your subscription</p>
              </div>

              {!paymentSuccess ? (
                <div className="position-relative" style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(247, 2, 10, 0.3)',
                  borderRadius: '16px',
                  padding: '40px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                }}>
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    background: 'linear-gradient(135deg, rgba(247, 2, 10, 0.05) 0%, transparent 50%)',
                    borderRadius: '16px',
                    zIndex: -1
                  }}></div>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripeCheckoutForm onPaymentSuccess={handlePaymentSuccess} />
                  </Elements>
                </div>
              ) : (
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
                  <h3 className="text-white fw-bold mb-4">Payment Completed Successfully!</h3>
                  <div className="mb-4 p-4" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="row g-3">
                      <div className="col-6">
                        <small className="text-white-50 d-block">Payment ID</small>
                        <p className="text-white mb-0 fw-semibold" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                          {paymentDetails?.id}
                        </p>
                      </div>
                      <div className="col-6">
                        <small className="text-white-50 d-block">Status</small>
                        <span className="badge bg-success px-3 py-2">{paymentDetails?.status}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-lg px-5 py-3" 
                    style={{
                      background: 'linear-gradient(135deg, #A7CA11 0%, #ff4757 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(247, 2, 10, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate("/my-account")}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 35px rgba(247, 2, 10, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 25px rgba(247, 2, 10, 0.3)';
                    }}
                  >
                    Back to Account
                  </button>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

CompletePayment.displayName = "CompletePayment";
export default CompletePayment;