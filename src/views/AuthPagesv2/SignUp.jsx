import React, { Fragment, memo } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../authpages.scss";

const GetStarted = memo(() => {
  return (
    <Fragment>
      <main className="main-content get-started">
        <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start pt-4">
          <Container>
            {/* Top Logo and Login Link */}
            <Row className="justify-content-between align-items-center mb-5">
              <Col xs="6">
                <Link to="#" className="text-white fw-bold">
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                    alt="ARY PLUS Logo"
                    className="img-fluid"
                    style={{ maxHeight: "60px" }}
                  />
                </Link>
              </Col>
              <Col xs="6" className="text-end">
                <p className="mb-0">
                  Already have an account?{" "}
                  <Link to="#" className="text-white fw-bold">
                    Login
                  </Link>
                </p>
              </Col>
            </Row>

            {/* Main Signup Content */}
            <Row className="justify-content-center align-items-center min-vh-75">
              <Col
                lg="5"
                md="5"
                sm="10"
                className="d-flex flex-column justify-content-center text-center gap-4"
              >
                <h2 className="fw-bold">Welcome</h2>
                <p>Create a password for john.doe@gmail.com</p>

                <Form>
                  <Form.Group controlId="formEmail">
                    <div className="d-flex flex-column gap-4">
                      <Form.Control
                        type="password"
                        placeholder="Add a password"
                        className="me-2 transparent-input"
                      />
                      <Form.Control
                        type="password"
                        placeholder="Re-enter password"
                        className="me-2 transparent-input"
                      />
                      <Button variant="danger">Next</Button>
                      <div className="d-flex align-items-start gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="termsCheckbox"
                          className="form-check-input mt-1 custom-white-border"
                          style={{ width: "18px", height: "18px" }}
                        />
                        <label
                          htmlFor="termsCheckbox"
                          className="form-check-label text-white"
                        >
                          By checking the box you agree to our{" "}
                          <Link
                            to="#"
                            className="text-white fw-bold text-decoration-underline"
                          >
                            Terms and Conditions
                          </Link>
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                </Form>

                {/* Social Buttons */}
                <div className="d-flex gap-3 social-login pt-5">
                  <Link
                    variant="light"
                    className="d-flex align-items-center justify-content-center w-50"
                  >
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/google.png`}
                      width="25px"
                      className="mx-2"
                      alt=""
                    />
                    Signup with Google
                  </Link>
                  <Link
                    variant="light"
                    className="d-flex align-items-center justify-content-center w-50"
                  >
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/apple-logo.png`}
                      width="25px"
                      className="mx-2"
                      alt=""
                    />
                    Signup with Apple
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </main>
    </Fragment>
  );
});

GetStarted.displayName = "GetStarted";
export default GetStarted;
