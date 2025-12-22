import React, { Fragment, memo, useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import Rating from "react-rating-stars-component";
import { useNavigate } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";

import { useAuthStore } from "../stores/useAuthStore";

import Loader from "../components/ReactLoader";
import api from "../services/api";
import logger from "../services/logger";

const ReviewComponent = memo(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login`);
    }
  }, [navigate, isAuthenticated]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      userId: user?.uid,
      feedback,
      app: "web",
      rate: rating,
    };

    try {
      const response = await api.post(
        "/api/feedback/create",
        data
      );
      const result = response.data;

      setIsLoading(false);

      toast.success("Feedback submitted!");
      logger.log("Operation completed:", result);
    } catch (error) {
      setIsLoading(false);
      logger.error("Operation failed:", error);
      toast.error("Error submitting feedback!");
    }
  };

  return (
    <Fragment>
      <div className="streamit-reviews">
        <div className="review_form">
          <div className="comment-respond">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md="12">
                  <Form.Group className="form-group">
                    <Form.Label>
                      Your Rate <span className="text-danger"> *</span>
                    </Form.Label>
                    <Rating
                      count={5}
                      size={30}
                      activeColor="#6BFE12"
                      value={rating}
                      onChange={handleRatingChange}
                    />
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group className="form-group">
                    <Form.Label>
                      Your Feedback <span className="text-danger"> *</span>
                    </Form.Label>
                    <textarea
                      className="form-control"
                      name="comment"
                      cols="5"
                      rows="8"
                      value={feedback}
                      onChange={handleFeedbackChange}
                    ></textarea>
                  </Form.Group>
                </Col>
                {isLoading ? (
                  <Loader />
                ) : (
                  <>
                    <Col md="12">
                      <div className="form-submit mt-4">
                        <div className="iq-button">
                          <Button
                            name="submit"
                            type="submit"
                            id="submit"
                            className="btn text-uppercase position-relative"
                          >
                            <span className="button-text">Submit</span>
                            <i className="fa-solid fa-play"></i>
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

export default ReviewComponent;
