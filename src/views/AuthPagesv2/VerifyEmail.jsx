import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import "../../authpages.scss";
import { toast } from "react-hot-toast";
import { ThreeDot } from "react-loading-indicators";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../services/api";

const VerifyEmail = memo(() => {
  const [searchParams] = useSearchParams();
  const redirectURL = searchParams.get("redirect") || "/";
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuthStore();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpComplete, setOtpComplete] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (user?.emailVerified) {
      navigate(redirectURL);
      return;
    }
    if (user?.email) {
      handleSendVerification();
    }

    // Push a dummy state to intercept browser back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
      e.preventDefault();
      setTimeout(() => navigate('/', { replace: true }), 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const handleSendVerification = async () => {
    try {
      const response = await api.post(`/api/v2/memberv2/resend-verification/${user.email}`);
      if (response.data.success) {
        startResendTimer();
        toast.success("Verification code sent!", { id: 'code-sent' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send verification code";
      toast.error(errorMessage, { id: 'send-failed' });
    }
  };

  const handleResendVerification = async () => {
    if (resendTimer > 0) return;
    handleSendVerification();
  };

  const handleVerifyCode = async (code) => {
    setIsVerifying(true);
    setOtpError(false);

    try {
      const response = await api.post('/api/v2/memberv2/verify-email', {
        email: user.email,
        code
      });
      
      if (response.data.success) {
        // Update database
        await api.put(`/api/v2/member/${user.uid}`, {
          emailVerified: true
        });
        
        updateUserProfile({ emailVerified: true });
        toast.success("Email verified successfully!", { id: 'email-verified', duration: 2000 });
        setTimeout(() => navigate(redirectURL), 1500);
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

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const input = otpRefs.current[index];
    
    if (!input.dataset.value) input.dataset.value = '';
    input.dataset.value = value;
    input.value = value;
    setOtpError(false);

    const allValues = otpRefs.current.map(ref => ref?.dataset.value || '').join('');
    setOtpComplete(allValues.length === 6);

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
      handleVerifyCode(allValues);
    } else {
      toast.error('Please enter all 6 digits');
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpRefs.current[index - 1].focus();
    }
    setTimeout(() => {
      const allValues = otpRefs.current.map(ref => ref?.dataset.value || '').join('');
      setOtpComplete(allValues.length === 6);
    }, 0);
  };

  return (
    <Fragment>
      <main className="main-content">
        <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
          <Container>
            <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
              <Col lg="5" md="5" sm="12" xs="12" className="d-flex flex-column justify-content-center gap-5 text-left text-md-center">
                <p className="text-left d-flex backHeading">
                  <span className="backbtn" onClick={() => navigate('/')}>
                    <IoIosArrowBack size={"1.2rem"} />
                  </span>
                  Verify Email
                </p>
                <div className="d-flex flex-column gap-4">
                <div>
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/get-started/notification-email.png`}
                    alt="Email icon"
                    className="email-icon"
                  />
                </div>

                <h2 className="verify-title">Verify Email</h2>

                <div>
                  <p className="verify-text">We've sent a verification code to your email</p>
                  <p className="verify-email">{user?.email}</p>
                </div>

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
                  {isVerifying ? (
                    <ThreeDot color="#A7CA11" size="medium" />
                  ) : (
                    <Button variant="danger" className="verify-btn" onClick={handleVerifyButtonClick} disabled={!otpComplete || isVerifying}>
                      {isVerifying ? <ThreeDot color="#ffffff" size="small" /> : 'Verify'}
                    </Button>
                  )}
                </div>

                <p className="verify-text">
                  Not seeing the email? <span className="resend-link" onClick={handleResendVerification} style={{ cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', opacity: resendTimer > 0 ? 0.5 : 1 }}>{resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}</span>
                </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </main>
    </Fragment>
  );
});

VerifyEmail.displayName = "VerifyEmail";
export default VerifyEmail;
