import React, { Fragment, memo, useEffect, useState } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import "../../authpages.scss";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa"; // FontAwesome check icon
import { BsExclamationTriangle } from "react-icons/bs"; // FontAwesome check icon
import { AnimatePresence, motion } from "framer-motion";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { toast } from "react-hot-toast";
import logger from '../../services/logger';

import AuthService from "../../services/auth";

// import Loader from "../components/ReactLoader";

import { ThreeDot } from "react-loading-indicators";

import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";

import { signInWithGooglev2, signInWithApplev2, auth, checkIfUserExistsByEmail, sendPasswordResetEmailv2 } from "../../firebase";
import api from "../../services/api";
import sessionService from "../../services/session";
import Cookies from "universal-cookie";
import DeviceInfo from "../../components/DeviceInfo";
import { useAuthStore } from "../../stores/useAuthStore";

const GetStarted = memo(() => {
  const [searchParams] = useSearchParams();
  const signup = searchParams.get("signup") === "true";
  const signin = searchParams.get("signin") === "true";

  // logger.log("signup: ", signup);
  // logger.log("signin: ", signin);
  //   const [step, setStep] = useState(() => {
  //   const savedStep = localStorage.getItem("getStartedStep");
  //   return savedStep ? parseInt(savedStep, 10) : (signup ? 1 : 6);
  // });

  const [step, setStep] = useState(() => {
    if (signup) return 1;
    if (signin) return 6;
    return 6;

    // const savedStep = localStorage.getItem("getStartedStep");
    // return savedStep ? parseInt(savedStep, 10) : 0;
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [genre, setGenre] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, SetLoginPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [forgetEmail, setForgetEmail] = useState("");

  const [memberId, setMemberId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const location = useLocation(); // Get the current location

  const params = new URLSearchParams(location.search);
  const redirectURL = params.get("redirect") || "/"; // Default to "/" if no redirect is found

  const navigate = useNavigate();

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  useEffect(() => {
    setError(null); // or setErrors({ signup: null, login: null, reset: null });
    // localStorage.setItem("getStartedStep", step);
    // logger.log("step is: ",localStorage.getItem("getStartedStep"))
  }, [step]);

  useEffect(() => {
    if (signup) {
      setStep(1);
    } else {
      setStep(6);
    }
  }, [signup, signin]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setisLoading(true);
    setError(null);

    // Email format validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setisLoading(false);
      setError("Please enter a valid email.");
      return;
    }

    try {
      const response = await api.get(`/api/v2/memberv2/email/${email}`);
      const already_exists = await checkIfUserExistsByEmail(email);
      logger.info("User existence check:", already_exists);

      if (already_exists) {
        setError(
          "Email already exists. Please login or use a different email.",
        );
      } else {
        setStep(2); // Proceed to the next step if email is not taken
      }

      if (response.data.success && response.data.data) {
        // User exists, redirect to login
        handleLogin();
      } else if (response.data.requiresVerification) {
        // New user, verification email sent
        setStep(1.5);
        startResendTimer();
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setisLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    if (resendTimer > 0) return;
    
    try {
      setisLoading(true);
      const response = await api.post(`/api/v2/memberv2/resend-verification/${email}`);
      if (response.data.success) {
        startResendTimer();
      } else {
        setError(response.data.message || "Failed to resend verification email");
      }
    } catch (error) {
      setError("Failed to resend verification email");
    } finally {
      setisLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const response = await api.post('/api/v2/memberv2/verify-email', {
        email,
        code: verificationCode
      });
      
      if (response.data.success) {
        setEmailVerified(response.data.emailVerified || true);
        localStorage.setItem('emailVerified', 'true');
        setStep(2); // Proceed to password setup
      } else {
        setError(response.data.message || "Invalid verification code");
      }
    } catch (error) {
      setError("Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("signin", "true");
    newParams.set("signup", "false");

    navigate({
      pathname: "/login",
      search: newParams.toString(),
    });
  };

  const handleForgotPass = (e) => {
    setStep(7);
  };

  const handleSkip = (e) => {
    logger.log("Redirect URL:", redirectURL);

    // Check for empty, undefined, null, or exactly "/"
    const shouldAddDemo = redirectURL && redirectURL !== "/";
    const finalRedirectURL = shouldAddDemo
      ? `/demo${redirectURL}`
      : redirectURL || "/";

    logger.log("Final redirect URL:", finalRedirectURL);
    // navigate(finalRedirectURL);
    navigate(finalRedirectURL, { replace: true });
  };

  // const handleSignup = (e) => {
  //   setStep(1)
  // }

  const handleSignup = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("signup", "true");
    newParams.set("signin", "false");

    navigate({
      pathname: "/login",
      search: newParams.toString(),
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setisLoading(true);

    if (password && password === confirmPassword) {
      try {
        const response = await AuthService.register(email, password);
        if (response.success === true) {
          const user = response.user;
          // const {email, uid } = user;          
          const { displayName, email, photoURL, uid, phoneNumber } = user;
          if (user) {
            const deviceInfo = DeviceInfo();
            const device = `${deviceInfo.os.name} ${deviceInfo.os.version}`;
            try {
              // Single API call to handle user creation/retrieval
              const response = await api.post("/api/v2/member", {
                uid,
                displayName,
                photoURL,
                phoneNumber,
                email,
                emailVerified: emailVerified,
                authProvider: "local", // Required field
                device,
                // The backend will validate the Firebase token and handle user creation/retrieval
              });

              if (response.data.success) {
                // Clean up email verification status
                localStorage.removeItem('emailVerified');
                setEmailVerified(false);
                
                // Fetch user subscriptions
                const subscriptionsResponse = await api.get(`/api/v2/subscriptions/user/${uid}`);
                const subscriptions = subscriptionsResponse.data;

                // Structure subscriptions data for localStorage
                const subscriptionsData = subscriptions.reduce((acc, sub) => ({
                  ...acc,
                  [sub.package_id]: {
                    subscription_date: sub.subscription_date,
                    subscription_expiry: sub.subscription_expiry,
                    subscription_status: sub.subscription_status,
                    daysLeft:sub.daysLeft,
                    daysLeftText:sub.daysLeftText
                  }
                }), {});


                // Save user data and subscriptions to localStorage
                const userData = {
                  ...response.data.user,
                  subscriptions: subscriptionsData
                };
                localStorage.setItem("user", JSON.stringify(userData));

                // Check status code to determine if the user is new (status 201) or existing (status 200)
                if (response.status === 201) {
                  // New user created
                  await sessionService.createSession();
                  setMemberId(uid)
                  setStep(3);
                } else if (response.status === 200) {
                  // Existing user
                  await sessionService.createSession();
                  navigate(redirectURL, { replace: true });
                }
              }

            } catch (err) {
              toast.error("Failed to authenticate with backend");
              return;
            }
          }
        } else {
          setError(formatErrorMessage(response.error) || "Registration failed");
        }
      } catch (error) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setisLoading(false);
      }
    } else {
      setError("Passwords do not match or are empty");
      setisLoading(false);
    }
  };



  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setisLoading(true);
  
    if (loginEmail && loginPassword) {
      try {
        const response = await AuthService.login(
          loginEmail,
          loginPassword,
        );
        if (response.success) {
          // Create session after successful login
          await sessionService.createSession();
          navigate(redirectURL);
        } else {
          setError(
            formatErrorMessage(response.error) ||
            "Login failed.",
          );
        }
      } catch (error) {
        setError("Login failed.");
      } finally {
        setisLoading(false);
      }
    } else {
      setError("Email or password is missing.");
      setisLoading(false);
    }
  };


  const handleFogetPassSubmit = async (e) => {
    e.preventDefault();
    setisLoading(true);
  
    if (forgetEmail) {
      try {
        const response = await sendPasswordResetEmailv2(forgetEmail);
        if (response.success === true) {
          setStep(8); // Navigate to confirmation step
        } else {
          setError(
            formatErrorMessage(response.message.error.message) ||
            "Something went wrong. Please try again later.",
          );
        }
      } catch (error) {
        setError(error.message || "An unexpected error occurred.");
      } finally {
        setisLoading(false);
      }
    } else {
      setError("Please Enter Email Address.");
      setisLoading(false);
    }
  };


  const handleGoogleLogin = async (e) => {
    const result = await signInWithGooglev2();
    if (result.success) {
      // Get idToken from Firebase user
      const user = auth.currentUser;
      const { displayName, email, photoURL, uid, phoneNumber, emailVerified } = user;
      if (user) {
        const deviceInfo = DeviceInfo();
        const device = `${deviceInfo.os.name} ${deviceInfo.os.version}`;

        try {
          // Single API call to handle user creation/retrieval
          const response = await api.post("/api/v2/member", {
            uid,
            displayName,
            photoURL,
            phoneNumber,
            emailVerified: emailVerified || true, // Google emails are pre-verified
            email,
            authProvider: "google",
            device,
          });

          if (response.data.success) {
            // Clean up email verification status
            localStorage.removeItem('emailVerified');
            setEmailVerified(false);
            
            // Fetch user subscriptions
            const subscriptionsResponse = await api.get(`/api/v2/subscriptions/user/${uid}`);
            const subscriptions = subscriptionsResponse.data;

            // Structure subscriptions data for localStorage
            const subscriptionsData = subscriptions.reduce((acc, sub) => ({
              ...acc,
              [sub.package_id]: {
                subscription_date: sub.subscription_date,
                subscription_expiry: sub.subscription_expiry,
                subscription_status: sub.subscription_status,
                daysLeft:sub.daysLeft,
                daysLeftText:sub.daysLeftText
              }
            }), {});

            const userData = {
              uid,
              email,
              displayName,
              photoURL,
              subscriptions: subscriptionsData
            };
            
            localStorage.setItem('auth-storage', JSON.stringify({
              state: {
                user: userData,
                isAuthenticated: true,
                displayName: displayName || email?.split('@')[0] || 'User'
              }
            }));

            if (response.status === 201) {
              await sessionService.createSession();
              setMemberId(uid);
              setStep(3);
            } else {
              await sessionService.createSession();
              window.location.href = redirectURL || "/";
            }
          }
        } catch (err) {
          toast.error("Failed to authenticate or fetch subscriptions");
          return;
        }
      }
    } else {
      toast.error(result.message || "Google sign-in failed");
    }
  };


  const handleAppleLogin = async (e) => {
    const result = await signInWithApplev2();
    if (result.success) {
      logger.log("Apple sign-in completed successfully");
      // Get idToken from Firebase user
      const user = auth.currentUser;
      logger.log("User authenticated:", user);
      const { displayName, email, photoURL, uid, phoneNumber, emailVerified } = user;
      if (user) {
        try {
          const deviceInfo = DeviceInfo();
          const device = `${deviceInfo.os.name} ${deviceInfo.os.version}`;
          // Single API call to handle user creation/retrieval
          const response = await api.post("/api/v2/member", {
            uid,
            displayName,
            photoURL,
            email,
            emailVerified: emailVerified || true, // Apple emails are pre-verified
            phoneNumber,
            authProvider: "apple", // Required field
            device,
            // The backend will validate the Firebase token and handle user creation/retrieval
          });

          if (response.data.success) {
            // Clean up email verification status
            localStorage.removeItem('emailVerified');
            setEmailVerified(false);
            
            // Fetch user subscriptions
            const subscriptionsResponse = await api.get(`/api/v2/subscriptions/user/${uid}`);
            const subscriptions = subscriptionsResponse.data;

            // Structure subscriptions data for localStorage
            const subscriptionsData = subscriptions.reduce((acc, sub) => ({
              ...acc,
              [sub.package_id]: {
                subscription_date: sub.subscription_date,
                subscription_expiry: sub.subscription_expiry,
                subscription_status: sub.subscription_status,
                daysLeft:sub.daysLeft,
                daysLeftText:sub.daysLeftText
              }
            }), {});


            const userData = {
              uid,
              email,
              displayName,
              photoURL,
              subscriptions: subscriptionsData
            };
            
            localStorage.setItem('auth-storage', JSON.stringify({
              state: {
                user: userData,
                isAuthenticated: true,
                displayName: displayName || email?.split('@')[0] || 'User'
              }
            }));

            if (response.status === 201) {
              await sessionService.createSession();
              setMemberId(uid)
              setStep(3);
            } else {
              await sessionService.createSession();
              window.location.href = redirectURL || "/";
            }

          }
        } catch (err) {
          toast.error("Failed to authenticate with backend");
          return;
        }
      }
    } else {
      toast.error(result.message || "Apple sign-in failed");
    }
  };

  const handleGenderSubmit = (e) => {
    e.preventDefault();
    if (gender && ageGroup) {
      setStep(4);
    } else {
      // You might show an error message here in a real app
      logger.warn("Password validation failed: passwords do not match or are empty");
    }
  };

  const handleGenreSubmit = async (e) => {
    e.preventDefault();
    console.log('FORM SUBMITTED - handleGenreSubmit called');
    console.log('Form data:', { gender, ageGroup, genre, memberId });

    // Basic validation
    if (!gender || !ageGroup || genre.length === 0) {
      setError("Please fill in all fields before submitting.");
      console.log('❌ Validation failed');
      return;
    }

    setIsSubmitting(true);
    setError(null); // Reset error before trying submission

    try {
      const response = await api.put(
        `/api/v2/member/${memberId}`,
        {
          gender: gender,
          ageGroup: ageGroup,
          genresPreference: genre,
        }
      );
      // Success feedback or redirect
      logger.info("User preferences updated successfully");
      
      // Get current user data and update with preferences
      const currentUser = auth.currentUser;
      const storedUser = localStorage.getItem('user');
      
      if (storedUser && currentUser) {
        const userData = JSON.parse(storedUser);
        const updatedUserData = {
          ...userData,
          gender,
          ageGroup,
          genresPreference: genre
        };
        
        // Update localStorage with preferences
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // Update auth store
        useAuthStore.setState({
          user: updatedUserData,
          isAuthenticated: true
        });
        
        logger.info('User data updated with preferences');
      }
      
      navigate("/");
    } catch (err) {
      logger.error("Network/API error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGenre = (selectedGenre) => {
    setGenre((prevGenres) => {
      if (prevGenres.includes(selectedGenre)) {
        return prevGenres.filter((g) => g !== selectedGenre); // remove if already selected
      } else if (prevGenres.length < 3) {
        return [...prevGenres, selectedGenre]; // add if less than 3 selected
      } else {
        return prevGenres; // do nothing if already 3 selected
      }
    });
  };

  const goBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const skipPreference = async () => {
    // Set auth store state to ensure user stays logged in
    const storedUserData = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUserData.uid) {
      useAuthStore.setState({
        user: storedUserData,
        isAuthenticated: true
      });
      logger.info('Auth store updated with user data (skip)');
    }
    
    navigate("/");
  };

  const formatErrorMessage = (message) => {
    if (!message || typeof message !== "string") return "Login failed";

    // Remove Firebase prefix and error codes
    let cleaned = message
      .replace(/^Firebase:\s*/i, "") // Remove "Firebase:" prefix
      .replace(/\s*\([^)]*\)\.?$/, "") // Remove error codes like (auth/weak-password)
      .replace(/_/g, " ") // Replace underscores with spaces
      .toLowerCase() // Convert entire string to lowercase
      .trim(); // Remove leading/trailing spaces

    // Capitalize the first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <Fragment>
      <main className="main-content">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            // STEP 1: EMAIL ENTRY
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started bg-dark-overlay text-white min-vh-100 d-flex align-items-center">
                <Container>
                  <Row className="justify-content-center justify-content-lg-start align-items-center min-vh-100">
                    <Col
                      lg="5"
                      md="5"
                      sm="10"
                      xs="10"
                      className="d-flex flex-column justify-content-center text-left gap-4"
                    >
                      <div>
                        <Link to="/" className="text-white fw-bold mb-3">
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                            alt="ARY PLUS Logo"
                            className="img-fluid"
                            style={{ maxHeight: "60px" }}
                          />
                        </Link>
                      </div>
                      <div>
                        <h2 className="fw-bold poppins-regular">
                          Watch all your favorite ARY content for FREE!
                        </h2>
                      </div>
                      <div>
                        <p>
                          Ready to watch? Enter your email to create your
                          account
                        </p>
                      </div>

                      <div>
                        <Form className="w-100" onSubmit={handleEmailSubmit}>
                          <Form.Group controlId="formEmail">
                            <Row className="d-flex g-3 align-items-stretch">
                              <Col xs={12} sm={12} md={8} lg={8}>
                                {/* <Form.Control
                                  type="email"
                                  placeholder="Enter Email"
                                  className="transparent-input h-100"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                /> */}
                                <div className="position-relative h-100">
                                  <Form.Control
                                    type={"email"}
                                    placeholder="Enter Email"
                                    className="transparent-input h-100 "
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    maxLength={256}
                                    style={{
                                      paddingRight: error ? "40px" : "12px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      cursor: error ? "default" : "pointer",
                                      color: "white",
                                      pointerEvents: "auto",
                                    }}
                                  >
                                    {error ? (
                                      <BsExclamationTriangle color="white" size={20} />
                                    ) : null}
                                  </span>
                                </div>




                              </Col>
                              <Col xs={12} sm={12} md={4} lg={4}>
                                <Button
                                  variant="danger"
                                  type="submit"
                                  className="w-100 h-100"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <ThreeDot color="#ffffff" size="small" />
                                  ) : (
                                    "Get Started"
                                  )}
                                </Button>
                              </Col>

                              {error && (
                                <Col xs={12}>
                                  <div className="errorDiv text-center">
                                    <p id="error" className="error">
                                      {error}
                                    </p>
                                  </div>
                                </Col>
                              )}
                            </Row>
                          </Form.Group>
                        </Form>
                      </div>

                      <div className="d-flex flex-column flex-md-row gap-2 w-100 social-login">
                        <Button
                          onClick={() => handleGoogleLogin()}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-100 gap-2"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/google.png`}
                            alt="Google icon"
                          />
                          <span>Continue with Google</span>
                        </Button>
                        <Button
                          onClick={() => handleAppleLogin()}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-100 gap-2"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/Apple.png`}
                            alt="Apple icon"
                          />
                          <span>Continue with Apple</span>
                        </Button>
                      </div>
                      <div>
                        <p className="footerp mt-3">
                          Already have an account?{" "}
                          <Link
                            onClick={handleLogin}
                            className="text-white fw-bold"
                          >
                            Login
                          </Link>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 1.5 ? (
            // STEP 1.5: EMAIL VERIFICATION
            <motion.div
              key="step1.5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center justify-content-md-between align-items-center top-bar">
                    <Col md="6" xs="10">
                      <Link to="/" className="text-white fw-bold">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                    </Col>
                    <Col md="6" xs="10" className="text-end d-none d-md-block">
                      <p className="mb-0">
                        Already have an account?{" "}
                        <Link onClick={handleLogin} className="text-white fw-bold">
                          Login
                        </Link>
                      </p>
                    </Col>
                  </Row>

                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-4 text-center">
                      <h2 className="fw-bold">Verify Your Email</h2>
                      <div className="row align-items-center">
                        <div className="col-2 col-md-1 justify-content-center d-flex p-0">
                          <p onClick={goBack} aria-label="Go back">
                            <IoIosArrowBack size="1.2rem" />
                          </p>
                        </div>
                        <div className="col-10 col-md-11 justify-content-start d-flex p-0">
                          <p>We sent a verification code to <strong>{email}</strong></p>
                        </div>
                      </div>

                      <Form onSubmit={handleVerifyCode}>
                        <Form.Group>
                          <div className="d-flex flex-column gap-3">
                            <div className="position-relative">
                              <Form.Control
                                type="text"
                                placeholder="Enter 6-digit code"
                                className="transparent-input text-center"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                style={{
                                  letterSpacing: '0.5em',
                                  fontSize: '1.2rem',
                                  paddingRight: error ? "40px" : "12px",
                                  borderColor: error ? "red" : undefined,
                                }}
                              />
                              {error && (
                                <span style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "white",
                                }}>
                                  <BsExclamationTriangle size={20} />
                                </span>
                              )}
                            </div>

                            {error && (
                              <div className="errorDiv">
                                <p className="error">{error}</p>
                              </div>
                            )}

                            {isVerifying ? (
                              <ThreeDot color="#A7CA11" size="medium" />
                            ) : (
                              <Button variant="danger" type="submit" disabled={verificationCode.length !== 6}>
                                Verify Email
                              </Button>
                            )}

                            <div className="text-center">
                              {resendTimer > 0 ? (
                                <p className="text-muted">Resend code in {resendTimer}s</p>
                              ) : (
                                <Button variant="link" className="text-white p-0" onClick={handleResendVerification}>
                                  Resend verification code
                                </Button>
                              )}
                            </div>
                          </div>
                        </Form.Group>
                      </Form>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 2 ? (
            // STEP 2: PASSWORD FORM
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  {/* Top Logo and Login Link */}
                  <Row className="justify-content-center justify-content-md-between align-items-center top-bar">
                    <Col md="6" xs="10">
                      <Link to="/" className="text-white fw-bold">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                    </Col>
                    <Col
                      md="6"
                      xs="10"
                      className="text-end d-none d-md-block d-lg-block d-xl-block d-xxl-block"
                    >
                      <p className="mb-0">
                        Already have an account?{" "}
                        <Link
                          onClick={handleLogin}
                          className="text-white fw-bold"
                        >
                          Login
                        </Link>
                      </p>
                    </Col>
                  </Row>

                  {/* Main Signup Content */}
                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col
                      lg="5"
                      md="5"
                      sm="10"
                      xs="10"
                      className="d-flex flex-column justify-content-center gap-4 text-left text-md-center"
                    >
                      <h2 className="fw-bold text-center">Welcome</h2>
                      <div className="row align-items-center ">
                        <div className="col-2 col-md-1 justify-content-center d-flex p-0">
                          <p onClick={goBack} aria-label="Go back">
                            <IoIosArrowBack size="1.2rem" />
                          </p>
                        </div>
                        <div className="col-10 col-md-11 justify-content-start d-flex p-0">
                          <p>
                            Create a password for <strong>{email}</strong>
                          </p>
                        </div>
                      </div>

                      {/* <p className="text-left d-flex border">
                        <span className='' onClick={goBack}><IoIosArrowBack size={'1.1rem'} />
                        </span>
                        Create a password for {email}
                      </p> */}

                      <Form onSubmit={handlePasswordSubmit}>
                        <Form.Group controlId="formEmail">
                          <div className="d-flex flex-column gap-3">
                            {/* Password Field */}
                            <div className="position-relative">
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Add a password"
                                className="me-2 transparent-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                maxLength={256}
                                style={{
                                  paddingRight: error ? "40px" : "12px",
                                  borderColor: error ? "red" : undefined,
                                }}
                              />
                              <span
                                onClick={!error ? togglePassword : undefined}
                                style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  cursor: error ? "default" : "pointer",
                                  color: "#ccc",
                                  pointerEvents: "auto",
                                }}
                              >
                                {error ? (
                                  <BsExclamationTriangle color="white" size={20} />
                                ) : showPassword ? (
                                  <FaEyeSlash size={20} />
                                ) : (
                                  <FaEye size={20} />
                                )}
                              </span>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="position-relative">
                              <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter password"
                                className="me-2 transparent-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                maxLength={256}
                                style={{
                                  paddingRight: error ? "40px" : "12px",
                                  borderColor: error ? "red" : undefined,
                                }}
                              />
                              <span
                                onClick={!error ? toggleConfirmPassword : undefined}
                                style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  cursor: error ? "default" : "pointer",
                                  color: "#ccc",
                                  pointerEvents: "auto",
                                }}
                              >
                                {error ? (
                                  <BsExclamationTriangle color="white" size={20} />
                                ) : showConfirmPassword ? (
                                  <FaEyeSlash size={20} />
                                ) : (
                                  <FaEye size={20} />
                                )}
                              </span>
                            </div>

                            {/* Error message below */}
                            {error && (
                              <div className="errorDiv">
                                <p id="error" className="error">
                                  {error}
                                </p>
                              </div>
                            )}


                            {isLoading ? (
                              <ThreeDot
                                color="#A7CA11"
                                size="medium"
                                text=""
                                textColor=""
                              />
                            ) : (
                              <Button variant="danger" type="submit">
                                Next
                              </Button>
                            )}

                            <div className="d-flex align-items-center gap-2 mt-2">
                              <input
                                type="checkbox"
                                id="termsCheckbox"
                                className="form-check-input mt-1 custom-white-border"
                                style={{ width: "18px", height: "18px" }}
                                required
                              />
                              <label
                                htmlFor="termsCheckbox"
                                className="form-check-label text-white"
                              >
                                By checking the box you agree to our{" "}
                                <Link
                                  target="_blank"
                                  to="/terms-of-use"
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
                      <div className="d-flex gap-3 social-login  my-2">
                        <Link
                          onClick={() => handleGoogleLogin()}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/google.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">
                            Signup with Google
                          </span>
                        </Link>
                        <Link
                          onClick={() => handleAppleLogin()}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/apple-logo.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">
                            Signup with Apple
                          </span>
                        </Link>
                      </div>

                      <div className="d-block d-md-none text-center">
                        <p className="mb-0">
                          Already have an account?{" "}
                          <Link
                            onClick={handleLogin}
                            className="text-white fw-bold"
                          >
                            Login
                          </Link>
                        </p>
                      </div>

                      {/* <Link onClick={goBack} className="text-white text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        className="ltr:mr-[4px] rtl:ml-[4px] rtl:rotate-180"
                      >
                        <defs>
                          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="11%" stopColor="#6BFE12" />
                            <stop offset="113.58%" stopColor="#A7CA11" />
                          </linearGradient>
                        </defs>
                        <g fill="url(#arrowGradient)" fillRule="evenodd">
                          <path d="M8.707 7.293c.39.39.39 1.024 0 1.414L6.414 11H20c.513 0 .936.386.993.883L21 12c0 .552-.448 1-1 1H6.414l2.293 2.293c.39.39.39 1.024 0 1.414-.39.39-1.024.39-1.414 0l-4-4c-.39-.39-.39-1.024 0-1.414l4-4c.39-.39 1.024-.39 1.414 0z" />
                        </g>
                      </svg>
                      Previous Step
                    </Link> */}
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 3 ? (
            // STEP 3: GENDER & AGE
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start pt-4">
                <Container>
                  {/* Top Logo and Login Link */}
                  <Row className="justify-content-center justify-content-md-between align-items-center mb-5">
                    <Col md="6" xs="10">
                      <Link to="/" className="text-white fw-bold">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                    </Col>
                    {/* <Col xs="6" className="text-end"> */}
                    {/* <Col md="6" xs="6" className="text-end d-none d-md-block d-lg-block d-xl-block d-xxl-block">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <Link onClick={handleLogin}  className="text-white fw-bold">
                          Login
                        </Link>
                      </p>
                    </Col> */}
                  </Row>

                  {/* Main Signup Content */}
                  <Row className="justify-content-center align-items-center min-vh-75">
                    {/* <Col lg="5" md="5" sm="10" className="d-flex flex-column justify-content-center text-center gap-4"> */}
                    <Col
                      lg="5"
                      md="5"
                      sm="10"
                      xs="10"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center pb-5"
                    >
                      <h3 className="fw-bold">
                        Your taste, your rules. Help us tune the algorithm.
                      </h3>

                      {/* <Form onSubmit={handlePasswordSubmit}>
                      <Form.Group controlId="formEmail">
                        <div className="d-flex flex-column gap-4">
                          <Form.Control
                            type="password"
                            placeholder="Add a password"
                            className="me-2 transparent-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <Form.Control
                            type="password"
                            placeholder="Re-enter password"
                            className="me-2 transparent-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <Button variant="danger">
                            Next
                          </Button>
                          <Link to="#"><p>Skip and start watching</p></Link>
                        </div>
                      </Form.Group>
                    </Form> */}

                      <Form onSubmit={handleGenderSubmit}>
                        <Form.Group controlId="formGender">
                          <div className="d-flex flex-column gap-2">
                            <Form.Label className="fw-bold gender-label">
                              What's your gender?
                            </Form.Label>
                            <div className="d-flex justify-content-left justify-content-md-center gap-3 flex-wrap">
                              {["Male", "Female", "Prefer not to say"].map(
                                (option) => (
                                  <Button
                                    key={option}
                                    variant={
                                      gender === option
                                        ? "light"
                                        : "outline-light"
                                    }
                                    className={`stroke-button d-flex align-items-center justify-content-center ${gender === option ? "selected" : ""}`}
                                    onClick={() => setGender(option)}
                                  >
                                    {gender === option && (
                                      <FaCheck className="me-2" />
                                    )}
                                    {option}
                                  </Button>
                                ),
                              )}
                            </div>
                          </div>
                        </Form.Group>

                        <Form.Group controlId="formAge" className="mt-4">
                          <div className="d-flex flex-column gap-2">
                            <Form.Label className="fw-bold gender-label">
                              Age group
                            </Form.Label>
                            <div className="d-flex justify-content-left justify-content-md-center gap-3 flex-wrap">
                              {[
                                "23 and under",
                                "24-34",
                                "35-44",
                                "45-55",
                                "55+",
                              ].map((option) => (
                                <Button
                                  key={option}
                                  variant={
                                    ageGroup === option
                                      ? "light"
                                      : "outline-light"
                                  }
                                  className={`stroke-button d-flex align-items-center justify-content-center ${ageGroup === option ? "selected" : ""}`}
                                  onClick={() => setAgeGroup(option)}
                                >
                                  {ageGroup === option && (
                                    <FaCheck className="me-2" />
                                  )}
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </Form.Group>

                        {/* Submit Button and Skip Link */}
                        <div className="d-flex flex-column align-items-center gap-3 mt-5">
                          <Button
                            type="submit"
                            variant="danger"
                            className="w-100"
                          >
                            Next
                          </Button>
                          <Link onClick={skipPreference} className="text-white">
                            Skip and start watching
                          </Link>
                          {/* <Link onClick={goBack} className="text-white text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            className="ltr:mr-[4px] rtl:ml-[4px] rtl:rotate-180"
                          >
                            <defs>
                              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="11%" stopColor="#6BFE12" />
                                <stop offset="113.58%" stopColor="#A7CA11" />
                              </linearGradient>
                            </defs>
                            <g fill="url(#arrowGradient)" fillRule="evenodd">
                              <path d="M8.707 7.293c.39.39.39 1.024 0 1.414L6.414 11H20c.513 0 .936.386.993.883L21 12c0 .552-.448 1-1 1H6.414l2.293 2.293c.39.39.39 1.024 0 1.414-.39.39-1.024.39-1.414 0l-4-4c-.39-.39-.39-1.024 0-1.414l4-4c.39-.39 1.024-.39 1.414 0z" />
                            </g>
                          </svg>
                          Previous Step
                        </Link> */}
                        </div>

                        {/* <div className="d-block d-md-none text-center">
                          <p className="mb-0">
                            Already have an account?{' '}
                            <Link onClick={handleLogin}  className="text-white fw-bold">
                              Login
                            </Link>
                          </p>
                        </div> */}
                      </Form>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 4 ? (
            // STEP 4: GENRES
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start pt-4">
                <Container>
                  {/* Top Logo and Login Link */}
                  <Row className="justify-content-center justify-content-md-between align-items-center mb-5">
                    <Col md="6" xs="10">
                      <Link to="/" className="text-white fw-bold">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                    </Col>
                    {/* <Col md="6" xs="10" className="text-end d-none d-md-block d-lg-block d-xl-block d-xxl-block">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <Link onClick={handleLogin}  className="text-white fw-bold">
                          Login
                        </Link>
                      </p>
                    </Col> */}
                  </Row>

                  {/* Main Signup Content */}
                  <Row className="justify-content-center align-items-center min-vh-75">
                    <Col
                      lg="5"
                      md="5"
                      sm="10"
                      xs="10"
                      className="d-flex flex-column justify-content-center text-left text-md-center gap-5"
                    >
                      <h3 className="fw-bold">
                        Which genres make your popcorn disappear faster?
                      </h3>

                      <Form onSubmit={handleGenreSubmit}>
                        <Form.Group controlId="formGender">
                          <div className="d-flex flex-column gap-2">
                            <Form.Label className="fw-bold">
                              Pick up to 3 genres
                            </Form.Label>
                            <div className="d-flex justify-content-left justify-content-md-center gap-3 flex-wrap">
                              {[
                                "Romance",
                                "Comedy",
                                "Thriller",
                                "Action",
                                "Drama",
                                "TV Shows",
                                "News",
                                "Sports",
                                "Shorts",
                                "Telefilms",
                              ].map((option) => (
                                <Button
                                  key={option}
                                  variant={
                                    genre.includes(option)
                                      ? "light"
                                      : "outline-light"
                                  }
                                  className={`stroke-button d-flex align-items-center justify-content-center ${genre.includes(option) ? "selected" : ""}`}
                                  onClick={() => toggleGenre(option)}
                                >
                                  {genre.includes(option) && (
                                    <FaCheck className="me-2" />
                                  )}
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </Form.Group>
                        {/* Submit Button and Skip Link */}
                        <div className="d-flex flex-column align-items-center gap-3 mt-5">
                          <Button
                            type="submit"
                            variant="danger"
                            className="w-100"
                          >
                            Next
                          </Button>
                          <Link onClick={skipPreference} className="text-white">
                            Skip and start watching
                          </Link>
                          <Link
                            onClick={goBack}
                            className="text-white text-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="30"
                              height="30"
                              viewBox="0 0 24 24"
                              className="ltr:mr-[4px] rtl:ml-[4px] rtl:rotate-180"
                            >
                              <defs>
                                <linearGradient
                                  id="arrowGradient"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop
                                    offset="11%"
                                    stopColor="#6BFE12"
                                  />
                                  <stop offset="113.58%" stopColor="#A7CA11" />
                                </linearGradient>
                              </defs>
                              <g fill="url(#arrowGradient)" fillRule="evenodd">
                                <path d="M8.707 7.293c.39.39.39 1.024 0 1.414L6.414 11H20c.513 0 .936.386.993.883L21 12c0 .552-.448 1-1 1H6.414l2.293 2.293c.39.39.39 1.024 0 1.414-.39.39-1.024.39-1.414 0l-4-4c-.39-.39-.39-1.024 0-1.414l4-4c.39-.39 1.024-.39 1.414 0z" />
                              </g>
                            </svg>
                            Previous Step
                          </Link>
                        </div>

                        {/* <div className="d-block d-md-none text-center">
                          <p className="mb-0">
                            Already have an account?{' '}
                            <Link onClick={handleLogin}  className="text-white fw-bold">
                              Login
                            </Link>
                          </p>
                        </div> */}
                      </Form>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 5 ? (
            // STEP 5: Loading
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex justify-content-center">
                <Container>
                  <Row className="justify-content-center">
                    {/* <Col lg="12" md="12" sm="12" className="text-center"> */}
                    <Col
                      lg="10"
                      md="10"
                      sm="10"
                      xs="10"
                      className="text-left text-md-center"
                      style={{ marginTop: "25vh" }}
                    >
                      <Link to="/" className="d-inline-block mb-4">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                      <h2 className="fw-bold mt-4">
                        Done and dusted. <br />
                        Get ready to love your watchlist.
                      </h2>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 6 ? (
            // STEP 6: LOGIN FORM
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  {/* Top Logo and Login Link */}
                  <Row className="justify-content-center justify-content-md-between align-items-center top-bar">
                    <Col md="6" xs="10">
                      <Link to="/" className="text-white fw-bold">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                    </Col>
                    <Col
                      md="6"
                      xs="10"
                      className="text-end d-none d-md-block d-lg-block d-xl-block d-xxl-block"
                    >
                      <p className="mb-0">
                        New to Zap?{" "}
                        <Link
                          onClick={handleSignup}
                          className="text-white fw-bold mt-5"
                        >
                          Create an Account
                        </Link>
                      </p>
                    </Col>
                  </Row>

                  {/* <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-4 text-left text-md-center">
                        <h2 className="fw-bold">Welcome</h2>
                        <p className="">Create a password for {email}</p> */}

                  {/* Main Signup Content */}
                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col
                      lg="5"
                      md="5"
                      sm="10"
                      xs="10"
                      className="d-flex flex-column justify-content-center gap-4 text-left text-md-center"
                    >
                      <h2 className="fw-bold">Welcome</h2>
                      {/* <p className="">Enter email and password to continue.</p> */}
                      <div>
                        <Form onSubmit={handleLoginSubmit}>
                          <Form.Group controlId="formEmail">
                            <div className="d-flex flex-column gap-3">
                              <Form.Control
                                type="email"
                                placeholder="Enter Email"
                                className="me-2 transparent-input"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                maxLength={256}
                              />

                              <div style={{ position: "relative" }}>
                                <Form.Control
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter Password"
                                  className="me-2 transparent-input"
                                  value={loginPassword}
                                  onChange={(e) =>
                                    SetLoginPassword(e.target.value)
                                  }
                                  maxLength={256}
                                />

                                <span
                                  onClick={!error ? togglePassword : undefined}
                                  style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: error ? "default" : "pointer",
                                    color: "#ccc",
                                  }}
                                >
                                  {error ? (
                                    <BsExclamationTriangle color="white" size={20} />
                                  ) : showPassword ? (
                                    <FaEyeSlash size={20} />
                                  ) : (
                                    <FaEye size={20} />
                                  )}
                                </span>

                              </div>

                              {error ? (
                                <div className="errorDiv">
                                  <p id="error" className="error">
                                    {error}
                                  </p>
                                </div>
                              ) : null}
                              <div className="text-start my-1">
                                <p className="mb-0 ">
                                  <Link
                                    onClick={handleForgotPass}
                                    className="text-white"
                                  >
                                    Forgot Password?
                                  </Link>
                                </p>
                              </div>

                              {isLoading ? (
                                <ThreeDot
                                  color="#A7CA11"
                                  size="medium"
                                  text=""
                                  textColor=""
                                />
                              ) : null}
                              <Button variant="danger" type="submit">
                                Next
                              </Button>

                              <div className="d-flex align-items-center gap-2 mt-2">
                                <input
                                  type="checkbox"
                                  id="termsCheckbox"
                                  className="form-check-input mt-1 custom-white-border"
                                  style={{ width: "18px", height: "18px" }}
                                  required
                                />
                                <label
                                  htmlFor="termsCheckbox"
                                  className="form-check-label text-white"
                                >
                                  By checking the box you agree to our{" "}
                                  <Link
                                    target="_blank"
                                    to="/terms-of-use"
                                    className="text-white fw-bold text-decoration-underline"
                                  >
                                    Terms and Conditions
                                  </Link>
                                </label>
                              </div>
                            </div>
                          </Form.Group>
                        </Form>
                      </div>

                      {/* Social Buttons */}
                      <div className="d-flex gap-3 social-login">
                        <Link
                          onClick={() => handleGoogleLogin()}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/google.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">
                            Signin with Google
                          </span>
                        </Link>
                        <Link
                          onClick={() => handleAppleLogin()}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/apple-logo.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">
                            Signin with Apple
                          </span>
                        </Link>
                      </div>

                      <div className="d-block d-md-none text-center">
                        <p className="mb-0">
                          New to Zap?{" "}
                          <Link
                            onClick={handleSignup}
                            className="text-white fw-bold"
                          >
                            Create an Account
                          </Link>
                        </p>
                      </div>

                      {/* <div className="text-center my-1">
                        <Link
                          className="text-white fw-bold text-decoration-underline"
                          onClick={handleSkip}
                          variant="danger"
                        >
                          Skip Now
                        </Link>
                      </div> */}
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 7 ? (
            // STEP 6: FORGOT PASS
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  {/* Top Logo and Login Link */}
                  <Row className="justify-content-center justify-content-md-between align-items-center top-bar">
                    <Col md="6" xs="10">
                      <Link to="/" className="text-white fw-bold">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                    </Col>
                    <Col
                      md="6"
                      xs="10"
                      className="text-end d-none d-md-block d-lg-block d-xl-block d-xxl-block"
                    >
                      <p className="mb-0">
                        New to Zap?{" "}
                        <Link
                          onClick={handleSignup}
                          className="text-white fw-bold mt-5"
                        >
                          Create an Account
                        </Link>
                      </p>
                    </Col>
                  </Row>

                  {/* <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-4 text-left text-md-center">
                        <h2 className="fw-bold">Welcome</h2>
                        <p className="">Create a password for {email}</p> */}

                  {/* Main Signup Content */}
                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col
                      lg="5"
                      md="5"
                      sm="10"
                      xs="10"
                      className="d-flex flex-column justify-content-center gap-4 text-left"
                    >
                      {/* <h2 className="fw-bold">Welcome</h2> */}
                      <h2 className="fw-bold text-center">Reset Password</h2>
                      <p className="">
                        Please enter your email address. You will receive a link
                        to create a new password via email.
                      </p>
                      <div>
                        <Form onSubmit={handleFogetPassSubmit}>
                          <Form.Group controlId="formEmail">
                            <div className="d-flex flex-column gap-3">
                              <div style={{ position: "relative" }}>
                                <Form.Control
                                  type="email"
                                  placeholder="Enter Email"
                                  className="me-2 transparent-input"
                                  value={forgetEmail}
                                  onChange={(e) => setForgetEmail(e.target.value)}
                                  maxLength={256}
                                  style={{
                                    paddingRight: error ? "40px" : "12px",
                                    borderColor: error ? "red" : undefined,
                                    height: "48px", // Optional: match height for visual consistency
                                  }}
                                />

                                {error && (
                                  <span
                                    style={{
                                      position: "absolute",
                                      right: "12px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: "white",
                                      pointerEvents: "none",
                                    }}
                                  >
                                    <BsExclamationTriangle size={22} />
                                  </span>
                                )}
                              </div>

                              {error && (
                                <div className="errorDiv">
                                  <p id="error" className="error">{error}</p>
                                </div>
                              )}

                              {isLoading ? (
                                <ThreeDot
                                  color="#A7CA11"
                                  size="medium"
                                  text=""
                                  textColor=""
                                />
                              ) : null}
                              <Button variant="danger" type="submit">
                                Send Reset Link
                              </Button>
                              <Link onClick={handleLogin} className="text-center">
                                <p
                                  aria-label="Go back"
                                  style={{
                                    fontFamily: "Poppins",
                                    fontWeight: 500,
                                    fontSize: "16px",
                                  }}
                                >
                                  <IoIosArrowBack size="1.2rem" className="me-1" />
                                  Back to Login
                                </p>
                              </Link>

                            </div>

                          </Form.Group>
                        </Form>
                      </div>

                      <div className="d-block d-md-none text-center">
                        <p className="mb-0">
                          New to Zap?{" "}
                          <Link
                            onClick={handleSignup}
                            className="text-white fw-bold"
                          >
                            Create an Account
                          </Link>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 8 ? (
            // FORGOT PASS SENT 
            <motion.div
              key="step8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-signup bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  {/* Top Logo and Login Link */}
                  <Row className="justify-content-center justify-content-md-between align-items-center top-bar">
                    <Col md="6" xs="10">
                      <Link to="/" className="text-white fw-bold">
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
                          alt="ARY PLUS Logo"
                          className="img-fluid"
                          style={{ maxHeight: "60px" }}
                        />
                      </Link>
                    </Col>
                    <Col
                      md="6"
                      xs="10"
                      className="text-end d-none d-md-block d-lg-block d-xl-block d-xxl-block"
                    >
                      <p className="mb-0">
                        New to Zap?{" "}
                        <Link
                          onClick={handleSignup}
                          className="text-white fw-bold mt-5"
                        >
                          Create an Account
                        </Link>
                      </p>
                    </Col>
                  </Row>


                  {/* Main Signup Content */}
                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col
                      lg="5"
                      md="5"
                      sm="10"
                      xs="10"
                      className="d-flex flex-column justify-content-center gap-4 text-left"
                    >
                      {/* <h2 className="fw-bold">Welcome</h2> */}
                      <h2 className="fw-bold text-center">Email Sent</h2>
                      <p className="text-center">
                        Please check your inbox for password reset instructions to {forgetEmail}
                      </p>
                      <div>
                        <Link onClick={handleLogin} className="text-center">
                          <p
                            aria-label="Go back"
                            style={{
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              fontSize: "16px",
                            }}
                          >
                            <IoIosArrowBack size="1.2rem" className="me-1" />
                            Back to Login
                          </p>
                        </Link>
                      </div>

                      <div className="d-block d-md-none text-center">
                        <p className="mb-0">
                          New to Zap?{" "}
                          <Link
                            onClick={handleSignup}
                            className="text-white fw-bold"
                          >
                            Create an Account
                          </Link>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>

          ) : null}
        </AnimatePresence>
      </main>
    </Fragment>
  );
});

GetStarted.displayName = "GetStarted";
export default GetStarted;
