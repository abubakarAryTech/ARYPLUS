import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate for React Router v6
import Loader from "../components/ReactLoader"; // Assuming you have a Loader component
import toast from "react-hot-toast";
import logger from '../services/logger';

const SubscriptionStatusPage = () => {
  const { sessionId } = useParams(); // Get sessionId from the URL params
  const navigate = useNavigate(); // useNavigate in React Router v6
  const [paymentStatus, setPaymentStatus] = useState(null); // "success" or "fail"
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  logger.log("sessionId from URL:", sessionId); // Log to check sessionId value

  useEffect(() => {
    if (!sessionId) {
      setPaymentStatus("fail");
      setIsLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const mockData = {
          success: {
            status: "success",
            planName: "Pro Plan",
            amount: 9.99,
            expiryDate: "2025-08-06",
          },
          fail: {
            status: "fail",
            planName: "",
            amount: 0,
            expiryDate: "",
          },
        };

        logger.log("Fetching status for sessionId:", sessionId); // Log fetching
        if (sessionId === "abcd1234") {
          setPaymentStatus(mockData.success.status);
          setPaymentDetails(mockData.success);
        } else {
          setPaymentStatus(mockData.fail.status);
        }
      } catch (err) {
        logger.error(err);
        setPaymentStatus("fail");
      }
      setIsLoading(false);
    };

    fetchPaymentStatus();
  }, [sessionId]);

  const handleGoHome = () => {
    navigate("/home"); // Redirect to your app's home or subscription page using navigate()
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} className="text-center">
          {paymentStatus === "success" ? (
            <>
              <h2 className="text-success">Payment Successful!</h2>
              <p>Your subscription is now active.</p>
              <p>
                Plan: {paymentDetails?.planName} <br />
                Amount: ${paymentDetails?.amount} <br />
                Expiry: {paymentDetails?.expiryDate}
              </p>
              <Button variant="success" onClick={handleGoHome}>
                Go to Home
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-danger">Payment Failed</h2>
              <p>There was an issue with your payment. Please try again.</p>
              <Button variant="danger" onClick={handleGoHome}>
                Try Again
              </Button>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionStatusPage;
