import { Fragment, useState, useEffect, memo } from "react";

//react-bootstrap
import { Button, Col, Container, Form, Row } from "react-bootstrap";

//react-router-dom
import { Link, useNavigate, useLocation } from "react-router-dom";

import { getConfig } from "../../../config";

import toast, { Toaster } from "react-hot-toast";
import Loader from "../../components/ReactLoader";

import Logo from "../../components/logo";
import { useAuthStore } from "../../stores/useAuthStore";

const SignUpPage = memo(() => {
  const config = getConfig();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState(null);
  const [accept, setAccept] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const navigate = useNavigate();
  const redirectLocation = useLocation();
  const { user, isLoading, register: registerUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(redirectLocation.search);
      const redirectTo = searchParams.get("redirect") || "/";
      navigate(redirectTo);
    }

    const isFormValid =
      name !== "" &&
      email !== "" &&
      password !== "" &&
      accept !== false &&
      password === confirmPassword;
    setFormValid(isFormValid);
  }, [name, email, password, confirmPassword, accept, navigate, redirectLocation.search, user]);

  const register = async () => {
    if (!formValid) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
      } else if (accept == false) {
        toast.error("Please accept terms & conditions.");
      } else {
        toast.error("Please fill in all required fields.");
      }
      return;
    }

    const result = await registerUser(email, password);
    if (result.success) {
      toast.success("Account created successfully!");
      const searchParams = new URLSearchParams(redirectLocation.search);
      const redirectTo = searchParams.get("redirect") || "/";
      navigate(redirectTo);
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <Fragment>
      <Toaster />
      {isLoading ? (
        <Loader />
      ) : (
        <main className="main-content">
          <div
            className="vh-100"
            style={{
              backgroundImage: `url(${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/01-new.webp)`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              position: "relative",
              minHeight: "500px",
            }}
          >
            <Container>
              <Row className="justify-content-center align-items-center height-self-center vh-100">
                <Col lg="8" md="12" className="align-self-center">
                  <div className="user-login-card bg-body py-3">
                    <div className="text-center">
                      <Logo />
                    </div>
                    <h4 className="text-center mb-4">Create Your Account</h4>
                    <Row lg="2" className="row-cols-1 g-2 g-lg-2">
                      <Col>
                        <Form.Label className="text-white fw-500 mb-2">
                          Full Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          className="rounded-0"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </Col>

                      <Col>
                        <Form.Label className="text-white fw-500 mb-2">
                          Email *
                        </Form.Label>
                        <Form.Control
                          type="email"
                          className="rounded-0"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </Col>
                      <Col>
                        <Form.Label className="text-white fw-500 mb-2">
                          Phone
                        </Form.Label>
                        <Form.Control
                          type="text"
                          className="rounded-0"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Form.Label className="text-white fw-500 mb-2">
                          Date Of Birth
                        </Form.Label>
                        <Form.Control
                          type="date"
                          className="rounded-0"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                        />
                      </Col>

                      <Col>
                        <Form.Label className="text-white fw-500 mb-2">
                          Password *
                        </Form.Label>
                        <Form.Control
                          type="password"
                          className="rounded-0"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </Col>
                      <Col>
                        <Form.Label className="text-white fw-500 mb-2">
                          Confirm Password *
                        </Form.Label>
                        <Form.Control
                          type="password"
                          className="rounded-0"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </Col>
                    </Row>
                    <Form.Label className="list-group-item d-flex align-items-center mt-3 mb-3 text-white">
                      <Form.Check.Input
                        checked={accept}
                        onChange={(e) => setAccept(e.target.checked)}
                        required
                        className="m-0 me-2"
                        type="checkbox"
                      />
                      I've read and accept the
                      <Link to="/terms-of-use" className="ms-1">
                        terms & conditions*
                      </Link>
                    </Form.Label>
                    <Row className="text-center">
                      <Col lg="3"></Col>
                      <Col lg="6">
                        <div className="full-button">
                          <div className="iq-button">
                            <Button
                              onClick={register}
                              className="btn text-uppercase position-relative"
                            >
                              <span className="button-text">Sign Up</span>
                              <i className="fa-solid fa-play"></i>
                            </Button>
                          </div>
                          <p className="mt-2 mb-0 fw-normal">
                            Already have an account?
                            <a href="/login" className="ms-1">
                              Sign In
                            </a>
                          </p>
                        </div>
                      </Col>
                      <Col lg="3"></Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </main>
      )}
    </Fragment>
  );
});

SignUpPage.displayName = "SignUpPage";
export default SignUpPage;
