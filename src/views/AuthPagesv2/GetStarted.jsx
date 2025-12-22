import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import "../../authpages.scss";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { BsExclamationTriangle } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import { IoIosArrowBack } from "react-icons/io";
import { toast, Toaster } from "react-hot-toast";
import { ThreeDot } from "react-loading-indicators";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { checkIfUserExistsByEmail } from "../../firebase";
import api from "../../services/api";
import logger from "../../services/logger";

const GetStarted = memo(() => {
  const [searchParams] = useSearchParams();
  const signup = searchParams.get("signup") === "true";
  const signin = searchParams.get("signin") === "true";

  const [step, setStep] = useState(() => {
    if (signup) return 1;
    if (signin) return 6;
    return 6;
  });

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [genre, setGenre] = useState([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorr, setErrorr] = useState(null);
  const [forgetEmail, setForgetEmail] = useState("");
  const [memberId, setMemberId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpComplete, setOtpComplete] = useState(false);
  const otpRefs = useRef([]);


  // Zustand store
  const { 
    login, 
    register, 
    googleAuth, 
    appleAuth, 
    resetPassword, 
    isLoading, 
    error, 
    clearError,
    updateUserProfile 
  } = useAuthStore();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectURL = params.get("redirect") || "/";
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  useEffect(() => {
    clearError();
  }, [step, clearError]);

  useEffect(() => {
    if (signup) {
      setStep(1);
    } else {
      setStep(6);
    }
  }, [signup, signin]);

  // Email submission for signup
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    // Empty field
    if (!trimmedEmail) {
      setErrorr("Email is required.");
      return;
    }

    // const emailRegex = /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;
    const emailRegex = /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;


    if (!emailRegex.test(trimmedEmail)) {
      setErrorr("Please enter a valid email.");
      return;
    }

    try {
      const response = await api.get(`/api/v2/memberv2/email/${email}`);
      const already_exists = await checkIfUserExistsByEmail(email);
      
      if (already_exists) {
        setErrorr("Email already exists. Please login or use a different email.");
        return;
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
      setErrorr("An unexpected error occurred. Please try again.");
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
      const response = await api.post(`/api/v2/memberv2/resend-verification/${email}`);
      if (response.data.success) {
        startResendTimer();
        toast.success("Verification code resent!", { id: 'code-resent' });
      } else {
        toast.error(response.data.message || "Failed to resend verification email", { id: 'resend-failed' });
      }
    } catch (error) {
      toast.error("Failed to resend verification email", { id: 'resend-error' });
    }
  };

  const handleVerifyCode = async (e, code = null) => {
    e.preventDefault();
    setIsVerifying(true);
    setOtpError(false);

    const codeToVerify = code || verificationCode;

    try {
      const response = await api.post('/api/v2/memberv2/verify-email', {
        email,
        code: codeToVerify
      });
      
      if (response.data.success) {
        setEmailVerified(response.data.emailVerified || true);
        setStep(2); // Proceed to password setup
        toast.success("Email verified successfully!", { id: 'email-verified' });
      } else {
        setOtpError(true);
        toast.error(response.data.message || "Invalid verification code", { id: 'invalid-code' });
      }
    } catch (error) {
      setOtpError(true);
      toast.error("Invalid verification code", { id: 'verify-error' });
    } finally {
      setIsVerifying(false);
    }
  };

  // Password-based registration
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!password || password !== confirmPassword) {
      setErrorr("Passwords do not match or are empty");
      return;
    }

    const result = await register(email, password, emailVerified);
    
    if (result.success) {
      if (result.isNewUser) {
        setMemberId(result.user.uid);
        setStep(3);
      } else {
        navigate(redirectURL, { replace: true });
      }
    } else {
      toast.error(result.error, { id: 'register-error' });
    }
  };

  // Email/password login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      setErrorr("Email or password is missing.");
      toast.error("Email or password is missing.", { id: 'login-missing' });
      return;
    }

    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      navigate(redirectURL);
    } else {
      toast.error(result.error, { id: 'login-error' });
    }
  };

  // Google OAuth
  const handleGoogleLogin = async () => {
    const result = await googleAuth();
    
    if (result.success) {
      if (result.isNewUser) {
        setMemberId(result.user.uid);
        setStep(3);
      } else {
        window.location.href = redirectURL || "/";
      }
    } else {
      toast.error(result.error, { id: 'google-error' });
    }
  };

  // Apple OAuth
  const handleAppleLogin = async () => {
    const result = await appleAuth();
    
    if (result.success) {
      if (result.isNewUser) {
        setMemberId(result.user.uid);
        setStep(3);
      } else {
        window.location.href = redirectURL || "/";
      }
    } else {
      toast.error(result.error, { id: 'apple-error' });
    }
  };

  // Password reset
  const handleForgotPassSubmit = async (e) => {
    e.preventDefault();

    if (!forgetEmail) {
      toast.error("Please Enter Email Address.", { id: 'forgot-email-required' });
      return;
    }

    const result = await resetPassword(forgetEmail);  
    setStep(8);
  };

  // Gender and age submission
  const handleGenderSubmit = (e) => {
    e.preventDefault();
    if (gender && ageGroup) {
      setStep(4);
    } else {
      toast.error("Please select both gender and age group.", { id: 'gender-age-required' });
    }
  };

  // Genre preferences submission
  const handleGenreSubmit = async (e) => {
    e.preventDefault();

    if (!gender || !ageGroup || genre.length === 0) {
      toast.error("Please fill in all fields before submitting.", { id: 'genre-required' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.put(`/api/v2/member/${memberId}`, {
        gender,
        ageGroup,
        genresPreference: genre,
      });

      if (response.data.success) {
        // Update user profile in store
        updateUserProfile({ gender, ageGroup, genresPreference: genre });
        logger.info("User preferences updated successfully");
        navigate("/");
      } else {
        throw new Error("Failed to update preferences");
      }
    } catch (err) {
      logger.error("Network/API error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGenre = (selectedGenre) => {
    setGenre((prevGenres) => {
      if (prevGenres.includes(selectedGenre)) {
        return prevGenres.filter((g) => g !== selectedGenre);
      } else if (prevGenres.length < 3) {
        return [...prevGenres, selectedGenre];
      } else {
        return prevGenres;
      }
    });
  };


  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const input = otpRefs.current[index];
    
    if (!input.dataset.value) input.dataset.value = '';
    input.dataset.value = value;
    input.value = value;
    setOtpError(false);

    // Check if all 6 digits are filled
    const allValues = otpRefs.current.map(ref => ref?.dataset.value || '').join('');
    setOtpComplete(allValues.length === 6);

    // Mask the digit after 1 second
    if (value) {
      setTimeout(() => {
        if (input && input.dataset.value) {
          input.value = '*';
        }
      }, 400);
    }

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length > 0) {
      pastedData.split('').forEach((char, index) => {
        if (otpRefs.current[index]) {
          otpRefs.current[index].dataset.value = char;
          otpRefs.current[index].value = char;
          setTimeout(() => {
            if (otpRefs.current[index]) {
              otpRefs.current[index].value = '*';
            }
          }, 400);
        }
      });
      
      setOtpComplete(pastedData.length === 6);
      setOtpError(false);
      
      const lastIndex = Math.min(pastedData.length - 1, 5);
      otpRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerifyButtonClick = () => {
    const allValues = otpRefs.current.map(ref => ref?.dataset.value || '').join('');
    if (allValues.length === 6) {
      setVerificationCode(allValues);
      handleVerifyCode({ preventDefault: () => {} }, allValues);
    } else {
      toast.error('Please enter all 6 digits');
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpRefs.current[index - 1].focus();
    }
    // Update button state after backspace
    setTimeout(() => {
      const allValues = otpRefs.current.map(ref => ref?.dataset.value || '').join('');
      setOtpComplete(allValues.length === 6);
    }, 0);
  };




  const goBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const skipPreference = () => {
    navigate("/");
  };

  const handleLogin = () => {
    if (step === 7 || step === 8) {
      setStep(6);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("signin", "true");
      newParams.set("signup", "false");
      navigate({ pathname: "/login", search: newParams.toString() });
    }
  };

  const handleSignup = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("signup", "true");
    newParams.set("signin", "false");
    navigate({ pathname: "/login", search: newParams.toString() });
  };

  const handleForgotPass = () => {
    setStep(7);
  };

  return (
    <Fragment>
      <Toaster/>
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
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center text-left gap-4">
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
                        <p>Ready to watch? Enter your email to create your account</p>
                      </div>

                      <div>
                        <Form className="w-100" onSubmit={handleEmailSubmit}>
                          <Form.Group controlId="formEmail">
                            <Row className="d-flex g-3 align-items-stretch">
                              <Col xs={12} sm={12} md={8} lg={8}>
                                <div className="position-relative h-100">
                                  <Form.Control
                                    type="email"
                                    placeholder="Enter Email"
                                    className="transparent-input h-100"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    maxLength={256}
                                    style={{ paddingRight: error ? "40px" : "12px" }}
                                  />
                                  {errorr && (
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
                              {errorr && (
                                <Col xs={12}>
                                  <div className="errorDiv text-center">
                                    <p className="error">{errorr}</p>
                                  </div>
                                </Col>
                              )}
                            </Row>
                          </Form.Group>
                        </Form>
                      </div>

                      <div className="d-flex flex-column flex-md-row gap-2 w-100 social-login">
                        <Button
                          onClick={handleGoogleLogin}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-100 gap-2"
                          disabled={isLoading}
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/google.png`}
                            alt="Google icon"
                          />
                          <span>Continue with Google</span>
                        </Button>
                        <Button
                          onClick={handleAppleLogin}
                          variant="light"
                          className="d-flex align-items-center justify-content-center w-100 gap-2"
                          disabled={isLoading}
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
                          <Link onClick={handleLogin} className="text-white fw-bold">
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
                    {/* <Col md="6" xs="10" className="text-end d-none d-md-block">
                      <p className="mb-0">
                        Already have an account?{" "}
                        <Link onClick={handleLogin} className="text-white fw-bold">
                          Login
                        </Link>
                      </p>
                    </Col> */}
                  </Row>

                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col lg="5" md="5" sm="10" xs="10"
                        className="d-flex flex-column justify-content-center text-center gap-4">

                      {/* Icon */}
                      <div>
                        <img
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/notification-email.png`}
                          alt="Email icon"
                          className="email-icon"
                        />
                      </div>

                      {/* Title */}
                      <h2 className="verify-title">Verify Email</h2>

                      {/* Subtext */}
                      <div>
                        <p className="verify-text">We've sent a verification link to your email</p>
                        <p className="verify-email">{email}</p>
                      </div>

                      {/* OTP Boxes */}
                      <div className="otp-wrapper">
                        {[0,1,2,3,4,5].map((i) => (
                          <div key={i} className={`otp-box-wrapper ${otpError ? 'otp-error' : ''}`}>
                            <input
                              type="text"
                              maxLength={1}
                              className="otp-box"
                              ref={(el) => (otpRefs.current[i] = el)}
                              onChange={(e) => handleOtpChange(e, i)}
                              onKeyDown={(e) => handleOtpKeyDown(e, i)}
                              onPaste={handleOtpPaste}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                       
                        {isLoading ? (
                                <ThreeDot color="#A7CA11" size="medium" />
                              ) : (
                                <Button variant="danger" className="verify-btn" onClick={handleVerifyButtonClick} disabled={!otpComplete || isVerifying}>
                                  {isVerifying ? <ThreeDot color="#ffffff" size="small" /> : 'Verify'}
                                </Button>
                              )}
                      </div>
                      


                      {/* Resend */}
                      <p className="verify-text">
                        Not seeing the email? <span className="resend-link" onClick={handleResendVerification} style={{ cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', opacity: resendTimer > 0 ? 0.5 : 1 }}>{resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}</span>
                      </p>

                      {/* Return to Login */}
                      <a className="return-login" onClick={handleLogin} style={{ cursor: 'pointer' }}>Return to Login</a>

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
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-4 text-left text-md-center">
                      <h2 className="fw-bold text-center">Welcome</h2>
                      <div className="row align-items-center">
                        <div className="col-2 col-md-1 justify-content-center d-flex p-0">
                          <p onClick={goBack} aria-label="Go back">
                            <IoIosArrowBack size="1.2rem" />
                          </p>
                        </div>
                        <div className="col-10 col-md-11 justify-content-start d-flex p-0">
                          <p>Create a password for <strong>{email}</strong></p>
                        </div>
                      </div>

                      <Form onSubmit={handlePasswordSubmit}>
                        <Form.Group controlId="formPassword">
                          <div className="d-flex flex-column gap-3">
                            <div className="position-relative">
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Add a password"
                                className="me-2 transparent-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                maxLength={256}
                                style={{
                                  paddingRight: errorr ? "40px" : "12px",
                                  borderColor: errorr ? "red" : undefined,
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
                                {errorr ? (
                                  <BsExclamationTriangle color="white" size={20} />
                                ) : showPassword ? (
                                  <FaEyeSlash size={20} />
                                ) : (
                                  <FaEye size={20} />
                                )}
                              </span>
                            </div>

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
                                onClick={!errorr ? toggleConfirmPassword : undefined}
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
                                {errorr ? (
                                  <BsExclamationTriangle color="white" size={20} />
                                ) : showConfirmPassword ? (
                                  <FaEyeSlash size={20} />
                                ) : (
                                  <FaEye size={20} />
                                )}
                              </span>
                            </div>

                            {errorr && (
                              <div className="errorDiv">
                                <p className="error">{errorr}</p>
                              </div>
                            )}

                            {isLoading ? (
                              <ThreeDot color="#A7CA11" size="medium" />
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
                              <label htmlFor="termsCheckbox" className="form-check-label text-white">
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

                      <div className="d-flex gap-3 social-login my-2">
                        <Link
                          onClick={handleGoogleLogin}
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/google.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">Signup with Google</span>
                        </Link>
                        <Link
                          onClick={handleAppleLogin}
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/apple-logo.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">Signup with Apple</span>
                        </Link>
                      </div>

                      <div className="d-block d-md-none text-center">
                        <p className="mb-0">
                          Already have an account?{" "}
                          <Link onClick={handleLogin} className="text-white fw-bold">
                            Login
                          </Link>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 6 ? (
            // STEP 6: LOGIN FORM
            <motion.div
              key="step6"
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
                        New to Zap?{" "}
                        <Link onClick={handleSignup} className="text-white fw-bold">
                          Create an Account
                        </Link>
                      </p>
                    </Col>
                  </Row>

                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-4 text-left text-md-center">
                      <h2 className="fw-bold">Welcome</h2>
                      <div>
                        <Form onSubmit={handleLoginSubmit}>
                          <Form.Group controlId="formLoginEmail">
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
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  maxLength={256}
                                />
                                <span
                                  onClick={!errorr ? togglePassword : undefined}
                                  style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: errorr ? "default" : "pointer",
                                    color: "#ccc",
                                  }}
                                >
                                  {errorr ? (
                                    <BsExclamationTriangle color="white" size={20} />
                                  ) : showPassword ? (
                                    <FaEyeSlash size={20} />
                                  ) : (
                                    <FaEye size={20} />
                                  )}
                                </span>
                              </div>

                              {errorr && (
                                <div className="errorDiv">
                                  <p className="error">{errorr}</p>
                                </div>
                              )}

                              <div className="text-start my-1">
                                <p className="mb-0">
                                  <Link onClick={handleForgotPass} className="text-white">
                                    Forgot Password?
                                  </Link>
                                </p>
                              </div>

                              {isLoading ? (
                                <ThreeDot color="#A7CA11" size="medium" />
                              ) : (
                                <Button variant="danger" type="submit">
                                  Next
                                </Button>
                              )}

                              <div className="d-flex align-items-center gap-2 mt-2">
                                <input
                                  type="checkbox"
                                  id="termsCheckboxLogin"
                                  className="form-check-input mt-1 custom-white-border"
                                  style={{ width: "18px", height: "18px" }}
                                  required
                                />
                                <label htmlFor="termsCheckboxLogin" className="form-check-label text-white">
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

                      <div className="d-flex gap-3 social-login">
                        <Link
                          onClick={handleGoogleLogin}
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/google.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">Signin with Google</span>
                        </Link>
                        <Link
                          onClick={handleAppleLogin}
                          className="d-flex align-items-center justify-content-center w-50"
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/apple-logo.png`}
                            width="30px"
                            className="mx-2"
                            alt=""
                          />
                          <span className="d-none d-md-flex">Signin with Apple</span>
                        </Link>
                      </div>

                      <div className="d-block d-md-none text-center">
                        <p className="mb-0">
                          New to Zap?{" "}
                          <Link onClick={handleSignup} className="text-white fw-bold">
                            Create an Account
                          </Link>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 7 ? (
            // STEP 7: FORGOT PASSWORD
            <motion.div
              key="step7"
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
                        Don't have an account?{" "}
                        <Link onClick={handleSignup} className="text-white fw-bold">
                          Sign up
                        </Link>
                      </p>
                    </Col>
                  </Row>

                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-4 text-left">
                      <h2 className="fw-bold text-center">Reset Password</h2>
                      <p>Please enter your email address. You will receive a link to create a new password via email.</p>
                      <div>
                        <Form onSubmit={handleForgotPassSubmit}>
                          <Form.Group controlId="formForgotEmail">
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
                                    height: "48px",
                                  }}
                                />
                                {error && (
                                  <span style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    pointerEvents: "none",
                                  }}>
                                    <BsExclamationTriangle size={22} />
                                  </span>
                                )}
                              </div>

                              {error && (
                                <div className="errorDiv">
                                  <p className="error">{error}</p>
                                </div>
                              )}

                              {isLoading ? (
                                <ThreeDot color="#A7CA11" size="medium" />
                              ) : (
                                <Button variant="danger" type="submit">
                                  Send Reset Link
                                </Button>
                              )}

                              <Link onClick={handleLogin} className="text-center">
                                <p aria-label="Go back" style={{
                                  fontFamily: "Poppins",
                                  fontWeight: 500,
                                  fontSize: "16px",
                                }}>
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
                          <Link onClick={handleSignup} className="text-white fw-bold">
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
            // STEP 8: PASSWORD RESET SENT
            <motion.div
              key="step8"
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
                        New to Zap?{" "}
                        <Link onClick={handleSignup} className="text-white fw-bold">
                          Create an Account
                        </Link>
                      </p>
                    </Col>
                  </Row>

                  <Row className="justify-content-center align-items-center min-vh-75 py-4">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-4 text-left">
                      <h2 className="fw-bold text-center">Email Sent</h2>
                      <p className="text-center">
                        Please check your inbox for password reset instructions to {forgetEmail}
                      </p>
                      <div>
                        <Link onClick={handleLogin} className="text-center">
                          <p aria-label="Go back" style={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "16px",
                          }}>
                            <IoIosArrowBack size="1.2rem" className="me-1" />
                            Back to Login
                          </p>
                        </Link>
                      </div>

                      <div className="d-block d-md-none text-center">
                        <p className="mb-0">
                          New to Zap?{" "}
                          <Link onClick={handleSignup} className="text-white fw-bold">
                            Create an Account
                          </Link>
                        </p>
                      </div>
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
                  </Row>

                  <Row className="justify-content-center align-items-center min-vh-75">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center gap-5 text-left text-md-center pb-5">
                      <h3 className="fw-bold">Your taste, your rules. Help us tune the algorithm.</h3>

                      <Form onSubmit={handleGenderSubmit}>
                        <Form.Group controlId="formGender">
                          <div className="d-flex flex-column gap-2">
                            <Form.Label className="fw-bold gender-label">What's your gender?</Form.Label>
                            <div className="d-flex justify-content-left justify-content-md-center gap-3 flex-wrap">
                              {["Male", "Female", "Prefer not to say"].map((option) => (
                                <Button
                                  key={option}
                                  variant={gender === option ? "light" : "outline-light"}
                                  className={`stroke-button d-flex align-items-center justify-content-center ${gender === option ? "selected" : ""}`}
                                  onClick={() => setGender(option)}
                                >
                                  {gender === option && <FaCheck className="me-2" />}
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </Form.Group>

                        <Form.Group controlId="formAge" className="mt-4">
                          <div className="d-flex flex-column gap-2">
                            <Form.Label className="fw-bold gender-label">Age group</Form.Label>
                            <div className="d-flex justify-content-left justify-content-md-center gap-3 flex-wrap">
                              {["23 and under", "24-34", "35-44", "45-55", "55+"].map((option) => (
                                <Button
                                  key={option}
                                  variant={ageGroup === option ? "light" : "outline-light"}
                                  className={`stroke-button d-flex align-items-center justify-content-center ${ageGroup === option ? "selected" : ""}`}
                                  onClick={() => setAgeGroup(option)}
                                >
                                  {ageGroup === option && <FaCheck className="me-2" />}
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </Form.Group>

                        <div className="d-flex flex-column align-items-center gap-3 mt-5">
                          <Button type="submit" variant="danger" className="w-100">
                            Next
                          </Button>
                          <Link onClick={skipPreference} className="text-white">
                            Skip and start watching
                          </Link>
                        </div>
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
                  </Row>

                  <Row className="justify-content-center align-items-center min-vh-75">
                    <Col lg="5" md="5" sm="10" xs="10" className="d-flex flex-column justify-content-center text-left text-md-center gap-5">
                      <h3 className="fw-bold">Which genres make your popcorn disappear faster?</h3>

                      <Form onSubmit={handleGenreSubmit}>
                        <Form.Group controlId="formGenre">
                          <div className="d-flex flex-column gap-2">
                            <Form.Label className="fw-bold">Pick up to 3 genres</Form.Label>
                            <div className="d-flex justify-content-left justify-content-md-center gap-3 flex-wrap">
                              {[
                                "Romance", "Comedy", "Thriller", "Action", "Drama",
                                "TV Shows", "News", "Sports", "Shorts", "Telefilms",
                              ].map((option) => (
                                <Button
                                  key={option}
                                  variant={genre.includes(option) ? "light" : "outline-light"}
                                  className={`stroke-button d-flex align-items-center justify-content-center ${genre.includes(option) ? "selected" : ""}`}
                                  onClick={() => toggleGenre(option)}
                                >
                                  {genre.includes(option) && <FaCheck className="me-2" />}
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </Form.Group>

                        <div className="d-flex flex-column align-items-center gap-3 mt-5">
                          {isSubmitting ? (
                            <ThreeDot color="#A7CA11" size="medium" />
                          ) : (
                            <Button type="submit" variant="danger" className="w-100">
                              Next
                            </Button>
                          )}
                          <Link onClick={skipPreference} className="text-white">
                            Skip and start watching
                          </Link>
                          <Link onClick={goBack} className="text-white text-center">
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
                          </Link>
                        </div>
                      </Form>
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