import { Fragment, useState, useEffect, memo } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../components/logo";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../../components/ReactLoader";
import { Helmet } from "react-helmet";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "../../stores";

const LoginPage = memo(() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const redirectLocation = useLocation();
  
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      const searchParams = new URLSearchParams(redirectLocation.search);
      const redirectTo = searchParams.get("redirect") || "/";
      navigate(redirectTo);
    } else {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const searchParams = new URLSearchParams(redirectLocation.search);
      const redirectTo = searchParams.get("redirect") || "/";
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectLocation.search]);

  return (
    <Fragment>
      {!isLoading && (
        <Helmet>
          <title>ARY PLUS - Login</title>
        </Helmet>
      )}
      <Toaster />
      <main className="main-content">
        <div
          className="vh-100"
          style={{
            backgroundImage: `url(${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/01.webp)`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            position: "relative",
            minHeight: "500px",
          }}
        >
          <Container>
            <Row className="justify-content-center align-items-center height-self-center vh-100">
              <Col lg="5" md="12" className="align-self-center">
                <div className="user-login-card bg-body">
                  <div className="text-center">
                    <Logo />
                  </div>
                  <Form
                    action="post"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white fw-500 mb-2">
                        Username or Email Address
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className="rounded-0"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white fw-500 mb-2">
                        Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        className="rounded-0"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        onClick={togglePassword}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#ccc",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </Form.Group>
                    <Form.Group className="text-end mb-3">
                      <Link
                        to="/lost-password"
                        className="text-primary fw-semibold fst-italic"
                      >
                        Forgot Password?
                      </Link>
                    </Form.Group>
                    <Form.Label className="list-group-item d-flex align-items-center mb-3 font-size-14 text-white fw-500">
                      <Form.Check.Input type="checkbox" className="m-0 me-2" />
                      Remember Me
                    </Form.Label>
                    <div className="full-button">
                      <div className="iq-button">
                        <Button
                          type="submit"
                          className="btn text-uppercase position-relative"
                        >
                          <span className="button-text">log in</span>
                          <i className="fa-solid fa-play"></i>
                        </Button>
                      </div>
                    </div>
                  </Form>
                  <p className="my-4 text-center fw-500 text-white">
                    New to ZAP?
                    <Link
                      to={{
                        pathname: "/register",
                        search: redirectLocation.search, // This includes the redirect parameter if it exists
                      }}
                      className="text-primary ms-1"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </main>
      {isLoading && <Loader />}
    </Fragment>
  );
});

export default LoginPage;
