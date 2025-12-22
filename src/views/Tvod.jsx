import { Fragment, memo, useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Col, Container, Row, Alert } from "react-bootstrap";
import { auth } from "../services/firebase";
import { signInWithFirebaseToken, signInWithIdTokenDirect } from "../firebase";
import { getUserPlan } from "../services/user";
import { useEnterExit } from "../utilities/usePage";
import Loader from "../components/ReactLoader";
import SubscriptionCard from "../components/SubscriptionCard";
import PaymentForm from "../components/PaymentForm";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage2 from "./ExtraPages/ErrorPage2";
import api from "../services/api";
import "../authpages.scss"

import { loadStripe } from "@stripe/stripe-js";
import logger from '../services/logger';

import { isFeatureEnabled, getConfig } from "../../config";
import { fetchLocation } from "../utilities/locationManager";
import { isTvodEnabled } from "../utilities/tvodHelper";
import { useAuthStore } from "../stores/useAuthStore";

const stripePromise = loadStripe(
  "pk_test_51RsgvCJ7P89Q3fzUnJcxuyOeIDKhGahdBWjvr40vubwFaMy97J1QlgCmYCDO7J02IB4s5rigAspj3rhtPmRrja7a00g1O79XDP"
);



const Tvod = memo(() => {
  const { seriesId } = useParams();
  const { user, isAuthenticated: userIsAuthenticated, updateSubscriptions } = useAuthStore();
  const [userPlan, setUserPlan] = useState("false");
  const [seriesData, setSeriesData] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [packageId, setPackageId] = useState("");
  const [location, setLocation] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const [sahulatPhone, setSahulatPhone] = useState("");
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);
  const [isLoadingPayFast, setIsLoadingPayFast] = useState(false);
  const [checkoutSessionError, setCheckoutSessionError] = useState(null);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [isLoadingSahulat, setIsLoadingSahulat] = useState(false);
  const [sahulatError, setSahulatError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentStatusBanner, setPaymentStatusBanner] = useState(null);
  const imageBase = `${import.meta.env.VITE_APP_IMAGE_PATH}`;
  const successToastId = useRef(null);
  const navigate = useNavigate();
  const tvodEnabled = isTvodEnabled();
  const sahulatWalletEnabled = isFeatureEnabled('sahulatWalletEnabled');
  const multiGatewayEnabled = isFeatureEnabled('multiGateway');

  const getPricingByCurrency = () => {
    if (!packageData || !packageData.packagePricing) {
      return { currency: "PKR", price: "N/A" };
    }

    const targetCurrency = location === "PK" ? "PKR" : "USD";
    const pricing = packageData.packagePricing.find(
      (p) => p.currency === targetCurrency
    );

    return pricing || { currency: "PKR", price: "N/A" };
  };

  const handlePKPayment = async () => {
    setIsLoadingPayFast(true);
    try {
      // Mark payment flow started to prevent session expiry
      sessionStorage.setItem('payfastPaymentInProgress', 'true');
      
      // Create payment using unified API
      const response = await api.post('/api/payment/pay', {
        packageId: packageId,
        source: 'payfast'
      });
      
      if (!response.data.success) {
        if (response.data.error === 'ALREADY_SUBSCRIBED') {
          toast.error(response.data.message || 'You already have an active subscription for this package');
        } else if (response.data.error === 'PENDING_PAYMENT') {
          toast.error(response.data.message || 'You have a pending payment for this package');
        } else {
          toast.error(response.data.message || 'Failed to create payment');
        }
        return;
      }
      
      const { basketId, amount } = response.data;
      
      const payfastResponse = await fetch(`${import.meta.env.VITE_PAY_API_URL}/api/payments/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: basketId,
          orderAmount: parseInt(amount),
          userId: user?.uid,
          clientId: 1,
          gatewayId: 3
        })
      });
      
      const payfastData = await payfastResponse.json();
      
      if (!payfastData.success || !payfastData.data) {
        toast.error('Failed to initialize payment');
        return;
      }
      
      const invoiceData = payfastData.data;
      
      let authToken = null;
      try {
        authToken = auth.currentUser ? await auth.currentUser.getIdToken() : sessionStorage.getItem('idTokenOverride');
      } catch (e) {
        logger.warn('Failed to get auth token for callback:', e);
      }
      
      sessionStorage.setItem('payfast_payment_context', JSON.stringify({
        basketId,
        packageId,
        returnUrl: window.location.href,
        userState: user,
        authToken: authToken
      }));
      
      const callbackUrl = `${window.location.origin}${window.location.pathname}?payfast_callback=true`;
      
      const form = document.createElement('form');
      form.method = 'post';
      form.action = 'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction';
      form.style.display = 'none';
      
      const fields = {
        'CURRENCY_CODE': 'PKR',
        'MERCHANT_ID': invoiceData.MerchantId,
        'MERCHANT_NAME': 'UAT Demo Merchant',
        'TOKEN': invoiceData.Token,
        'SUCCESS_URL': callbackUrl,
        'FAILURE_URL': callbackUrl,
        'CHECKOUT_URL': callbackUrl,
        'CUSTOMER_EMAIL_ADDRESS': user?.email || 'customer@example.com',
        'CUSTOMER_MOBILE_NO': '03001234567',
        'TXNAMT': invoiceData.TransAmount,
        'BASKET_ID': basketId,
        'ORDER_DATE': invoiceData.OrderDate,
        'SIGNATURE': invoiceData.Signature,
        'VERSION': 'MERCHANTCART-0.1',
        'TXNDESC': 'Manual Payment',
        'PROCCODE': '00',
        'TRAN_TYPE': 'ECOMM_PURCHASE',
        'STORE_ID': '102-ZEOJDZS3V',
        'RECURRING_TXN': 'FALSE',
        'MERCHANT_USERAGENT': navigator.userAgent
      };
      
      Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      logger.error('Payment initialization failed:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setIsLoadingPayFast(false);
    }
  };



  const handlePayFastPaymentSuccess = async (basketId, transactionId) => {
    setPaymentSuccess(true);
    setPaymentDetails({ id: basketId, transactionId, status: 'succeeded', source: 'payfast' });

    try {
      const confirmResponse = await api.post('/api/payment/payfast/confirm', {
        basketId,
        transactionId
      });
      
      if (!confirmResponse.data.success) {
        throw new Error('Failed to confirm payment');
      }
      
      const invoiceId = confirmResponse.data.invoiceId;
      
      try {
        const billingResponse = await api.get(`/api/billings/invoice/${invoiceId}`);
        const latestBilling = billingResponse.data;
        const billingAmount = latestBilling?.billingMeta?.payfastMeta?.amount || 0;
        const packageName = latestBilling?.billingMeta?.payfastMeta?.packageName || 'content';
        
        await fetch(`${import.meta.env.VITE_PAY_API_URL}/api/payments/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentReferenceId: transactionId,
            invoice: basketId,
            status: 'Paid',
            clientId: 1,
            gatewayId: 3,
            userId: user?.uid,
            amount: billingAmount,
            description: `Payment for ${packageName}`
          })
        });
      } catch (historyErr) {
        logger.error('Failed to update payment history:', historyErr);
      }
      
      await updateUserSubscriptionData();
      setPaymentStatusBanner('success');
      
      // Clear payment flag after success
      sessionStorage.removeItem('payfastPaymentInProgress');
    } catch (err) {
      logger.error('Failed to process PayFast payment success:', err);
      sessionStorage.removeItem('payfastPaymentInProgress');
      toast.error('Payment processed! If content is not unlocked, please refresh the page.', {
        duration: 8000
      });
      setPaymentStatusBanner('success');
    }
  };

  const handlePayFastPaymentFailure = (basketId) => {
    setPaymentStatusBanner('fail');
    toast.error('Payment failed. Please try again.');
  };

  // Handle PayFast callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payfast_callback') === 'true') {
      const handlePayFastReturn = async () => {
        try {
          const context = sessionStorage.getItem('payfast_payment_context');
          if (context) {
            const { basketId, returnUrl, userState, authToken } = JSON.parse(context);
            
            if (userState && authToken && !user) {
              try {
                sessionStorage.setItem('idTokenOverride', authToken);
              } catch (e) {
                logger.warn('Failed to restore auth token:', e);
              }
            }
            
            sessionStorage.removeItem('payfast_payment_context');
            
            const transactionId = urlParams.get('transaction_id');
            const errCode = urlParams.get('err_code');
            const isSuccess = transactionId && errCode === '000';
            
            if (isSuccess) {
              await handlePayFastPaymentSuccess(basketId, transactionId);
            } else {
              handlePayFastPaymentFailure(basketId);
            }
            
            window.history.replaceState({}, document.title, returnUrl);
          }
        } catch (error) {
          logger.error('Error handling PayFast callback:', error);
        }
      };
      
      handlePayFastReturn();
    }
  }, [user]);

  const loadLocation = useCallback(async () => {
    const countryCode = await fetchLocation();
    logger.log('Current location:', countryCode);
    setLocation(countryCode);
  }, []);

  useEffect(() => {
    // Check email verification only for local auth provider
    if (userIsAuthenticated && user && user.authProvider === 'local' && !user.emailVerified) {
      toast('Please verify your email to access this content', { icon: 'ℹ️', id: 'verify-required' });
      navigate(`/verify-email?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
  }, [userIsAuthenticated, user, navigate]);

  useEffect(() => {
    // Support token-based auto-login via query param `token`
    const maybeAutoLogin = async () => {
      // Fix HTML-encoded ampersands in URL before parsing
      const cleanedSearch = window.location.search.replace(/&amp;/g, '&');
      const params = new URLSearchParams(cleanedSearch);
      const token = params.get("token");
      const tokenType = params.get("token_type"); // optional hint: custom|id
      // Capture optional deep-link return URL to send user back to app after success
      const returnUrl = params.get("return") || params.get("callback");
      if (returnUrl) {
        try { 
          // Decode HTML entities if present
          const decodedUrl = returnUrl.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
          sessionStorage.setItem('deeplinkReturnUrl', decodedUrl); 
        } catch (_) { }
      }
      try {
        // Fix HTML-encoded ampersands in URL before parsing
        const cleanedSearch = window.location.search.replace(/&amp;/g, '&');
        const params = new URLSearchParams(cleanedSearch);
        const token = params.get("token");
        const tokenType = params.get("token_type"); // optional hint: custom|id
        // Capture optional deep-link return URL to send user back to app after success
        const returnUrl = params.get("return") || params.get("callback");
        
        if (returnUrl) {
          try { 
            // Decode HTML entities if present
            const decodedUrl = returnUrl.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
            sessionStorage.setItem('deeplinkReturnUrl', decodedUrl);
            // toast.success(`Return URL stored: ${decodedUrl.substring(0, 50)}...`);
          } catch (e) {
            logger.log(`Failed to store return URL: ${e.message}`);
          }
        }

        let authSuccess = false;
        if (token && !auth.currentUser) {
          // Set token override immediately for API calls
          try {
            sessionStorage.setItem('idTokenOverride', token);
          } catch (e) {
            logger.log('Failed to set token override');
          }
          
          // toast.loading('Authenticating with token...');
          try {
            // Clear stale localStorage to prevent conflicts
            try {
              localStorage.removeItem('user');
              // Keep idTokenOverride for API calls
            } catch (e) {
              logger.log('Failed to clear stale data');
            }
            
            let result;
            if (tokenType === "id") {
              result = await signInWithIdTokenDirect(token);
            } else {
              // Try as custom token first; if it fails, fallback as ID token
              result = await signInWithFirebaseToken(token);
              if (!result?.success) {
                result = await signInWithIdTokenDirect(token);
              }
            }
            // toast.dismiss();
            if (!result?.success) {
              toast.error(`Auto-login failed: ${result?.error || 'Unknown error'}`);
            } else {
              authSuccess = true;
              // toast.success('Authentication successful!');
            }
          } catch (authError) {
            // toast.dismiss();
            logger.log(`Auth error: ${authError.message}`);
          }
        }

        // Wait for auth state to settle only if we just authenticated
        if (authSuccess) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Re-evaluate after attempting auto-login (also accept session override)
        let override = null;
        try { 
          override = sessionStorage.getItem('idTokenOverride'); 
        } catch (e) {
          logger.warn('Failed to get override token:', e);
        }
        
        const Authenticated = userIsAuthenticated || !!override;
        // toast(`Auth check: ${Authenticated ? 'Authenticated' : 'Not authenticated'}`);
        if (!Authenticated) {
          try {
            // toast.error('Redirecting to login...');
            navigate("/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
          } catch (navError) {
            logger.log(`Navigation error: ${navError.message}`);
            window.location.href = '/login';
          }
          return;
        }

        const pendingSession = sessionStorage.getItem('pendingStripeSession');
        if (pendingSession) {
          try {
            const { sessionId: pendingSessionId, seriesId: pendingSeriesId } = JSON.parse(pendingSession);
            if (pendingSeriesId === seriesId) {
              setTimeout(() => {
                try {
                  checkPaymentStatus(pendingSessionId);
                  sessionStorage.removeItem('pendingStripeSession');
                } catch (e) {
                  logger.warn('Payment status check failed:', e);
                }
              }, 2000);
            } else {
              sessionStorage.removeItem('pendingStripeSession');
            }
          } catch (e) {
            sessionStorage.removeItem('pendingStripeSession');
          }
        }

        if (token && returnUrl) {
          setTimeout(() => {
            try {
              checkRecentPayments();
            } catch (e) {
              logger.warn('Recent payments check failed:', e);
            }
          }, 3000);
        }
      } catch (error) {
        logger.error('Auto-login process failed:', error);
        // Fallback: redirect to login on any critical error
        try {
          navigate('/login');
        } catch (e) {
          window.location.href = '/login';
        }
      }
    };

    maybeAutoLogin().catch(error => {
      logger.error('maybeAutoLogin failed:', error);
    });
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);



  useEnterExit();

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user?.uid) {
        try {
          const plan = await getUserPlan(user.uid);
          setUserPlan(plan);
        } catch (err) {
          logger.error('Error fetching user plan:', err);
        }
      }
    };
    fetchUserPlan();

    // Auto-fill phone number from user profile if available
    if (user?.phoneNumber && !sahulatPhone) {
      setSahulatPhone(user.phoneNumber);
    }

    // Ensure Stripe is selected when Sahulat wallet is disabled or not in Pakistan
    if ((!sahulatWalletEnabled || location !== "PK") && selectedPaymentMethod !== 'stripe') {
      setSelectedPaymentMethod('stripe');
    }

    // Ensure Stripe is selected when location is not PK and PayFast was selected
    if (location && location !== "PK" && selectedGateway === 'payfast') {
      setSelectedGateway('stripe');
    }
  }, [sahulatWalletEnabled, selectedPaymentMethod, sahulatPhone, location, selectedGateway]);

  useEffect(() => {
    const fetchSeriesAndPackage = async () => {
      if (!seriesId) return;

      setIsLoading(true);
      setNotFound(false);

      try {
        const seriesResp = await api.get(`/api/series/${seriesId}`);
        const series = seriesResp.data;
        setSeriesData(series);

        if (series?.packageIds?.length > 0) {
          const pkgId = series.packageIds[0];
          setPackageId(pkgId);

          const packageResp = await api.get(`/api/packages/${pkgId}`);
          const pkg = packageResp.data;
          setPackageData(pkg);
        } else {
          setPackageData(null); // Free content
        }
        
        const cleanedSearch = window.location.search.replace(/&amp;/g, '&');
        const params = new URLSearchParams(cleanedSearch);
        const returnUrl = params
          .get("return")?.replace(/&quot;/g, '"')?.replace(/&#39;/g, "'")?.replace(/&amp;/g, '&');
          

        // For mobile
        if (returnUrl) {
          if (
            series?.packageIds &&
            user?.subscriptions?.[series?.packageIds[0]]?.subscription_status === "active"
          ) {
            window.location.href=returnUrl;
            // navigate(returnUrl);
            return;
          }
        } else {
          // For web
          if (
            series?.packageIds &&
            user?.subscriptions?.[series?.packageIds[0]]?.subscription_status === "active"
          ) {
            series?.seriesType === "singleVideo" 
              ? navigate(`/watch/v1/${seriesId}`, { replace: true })
              : navigate(`/series/v3/${seriesId}`, { replace: true });
            return;
          }
        }

        // if (series?.packageIds && currentUser?.subscriptions?.[series?.packageIds[0]]?.subscription_status === "active") {
        //   navigate(`/series/v3/${seriesId}`);
        //   return;
        // }
      } catch (err) {
        logger.error("Error fetching series or package:", err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesAndPackage();
  }, [seriesId]);


  // ⬇️ Create Stripe Checkout Session and redirect
  const handleStripeCheckout = async () => {
    const lsUser = user;
    const hasAnyLocalUser = !!lsUser;

    if (!hasAnyLocalUser) {
      toast("Login to Continue!", { icon: "👤" });
      return;
    }

    if (!packageData) {
      toast.success("You are already subscribed. This content is free.");
      return;
    }

    if (!location) {
      toast.error("Please wait while we detect your location...");
      return;
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      logger.log('No current user in Firebase auth, checking for override token...');
      let overrideToken = null;
      try {
        overrideToken = sessionStorage.getItem("idTokenOverride");
      } catch (_) { }

      // if (!overrideToken) {
      //   toast.error("Authentication required. Please login again.");
      //   return;
      // }
      logger.log('Using override token for authentication');
    } else {
      logger.log('User authenticated:', auth.currentUser.uid);
    }

    setIsCreatingCheckoutSession(true);
    setCheckoutSessionError(null);

    try {
      logger.log('Creating Stripe checkout session...');
      logger.log('Package ID:', packageId);
      logger.log('Country Code:', location);

      // Create checkout session using the api interceptor with token auth
      const response = await api.post('/api/payment/create-checkout-session', {
        packageId: packageId,
        source: 'stripe',
        countryCode: location,
        successUrl: `${window.location.origin}/stripe/success?session_id={CHECKOUT_SESSION_ID}&seriesId=${seriesId}`,
        cancelUrl: `${window.location.origin}/stripe/cancel?seriesId=${seriesId}`,
        metadata: {
          seriesId: seriesId,
          returnUrl: sessionStorage.getItem('deeplinkReturnUrl') || `arylive://series/${seriesId}`
        }
      });

      logger.log('Checkout session response:', response.data);

      if (!response.data || response.data.success === false) {
        throw new Error(response.data?.message || `Failed to create checkout session (${response.status})`);
      }

      const data = response.data;

      if (!data.success || !data.checkoutUrl) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Check if this is a mobile app payment (has deeplink return URL)
      const isMobileAppPayment = (() => { try { return !!sessionStorage.getItem('deeplinkReturnUrl'); } catch (_) { return false; } })();

      if (isMobileAppPayment) {
        // Mobile app: Direct redirect (works on iOS Safari)
        window.location.href = data.checkoutUrl;
      } else {
        // Web: Open in popup
        window.currentStripeSessionId = data.sessionId;
        const checkoutWindow = window.open(data.checkoutUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

        if (!checkoutWindow) {
          throw new Error('Popup blocked. Please allow popups and try again.');
        }
        sessionStorage.setItem('pendingStripeSession', JSON.stringify({ sessionId: data.sessionId, seriesId }));

        const handlePaymentMessage = (event) => {
          if (!event.origin.includes('stripe.com') && !event.origin.includes(window.location.origin)) return;
          if (event.data.type === 'stripe_checkout_success') {
            clearInterval(checkWindowClosed);
            clearTimeout(windowTimeout);
            window.removeEventListener('message', handlePaymentMessage);
            if (!checkoutWindow.closed) checkoutWindow.close();
            handleStripePaymentSuccess(event.data.sessionId || data.sessionId);
          } else if (event.data.type === 'stripe_checkout_cancel') {
            clearInterval(checkWindowClosed);
            clearTimeout(windowTimeout);
            window.removeEventListener('message', handlePaymentMessage);
            if (!checkoutWindow.closed) checkoutWindow.close();
            toast.info('Payment was cancelled');
          }
        };

        window.addEventListener('message', handlePaymentMessage);

        const checkWindowClosed = setInterval(() => {
          if (checkoutWindow.closed) {
            clearInterval(checkWindowClosed);
            clearTimeout(windowTimeout);
            window.removeEventListener('message', handlePaymentMessage);
            setTimeout(() => checkPaymentStatus(data.sessionId), 1000);
          }
        }, 1000);

        const windowTimeout = setTimeout(() => {
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', handlePaymentMessage);
          if (!checkoutWindow.closed) checkoutWindow.close();
          setTimeout(() => checkPaymentStatus(data.sessionId), 1000);
          toast.error('Payment session timed out. Please try again.');
        }, 600000);
      }

    } catch (err) {
      logger.error('Failed to create checkout session:', err);

      // Handle specific error cases
      if (err.response?.status === 401) {
        logger.error('Authentication failed - token might be expired');
        setCheckoutSessionError('Session expired. Please refresh the page and try again.');
        toast.error('Session expired. Please refresh the page and try again.');
      } else if (err.response?.status === 403) {
        logger.error('Authorization failed - insufficient permissions');
        setCheckoutSessionError('Access denied. Please check your account permissions.');
        toast.error('Access denied. Please check your account permissions.');
      } else if (err.response?.data?.message) {
        setCheckoutSessionError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setCheckoutSessionError(err.message || 'Failed to start checkout');
        toast.error(err.message || 'Failed to start checkout');
      }
    } finally {
      setIsCreatingCheckoutSession(false);
    }
  };

  // Check payment status after checkout window closes
  const checkPaymentStatus = async (sessionId, retries = 3) => {
    try {
      const response = await api.post('/api/payment/status', {
        paymentId: sessionId,
        source: 'stripe'
      });

      if (response.data && response.data.success) {
        const result = response.data;
        if (result.stripeStatus === 'succeeded' || result.billingStatus === 'Paid') {
          handleStripePaymentSuccess(sessionId);
          return true;
        } else if (retries > 0 && (result.stripeStatus === 'processing' || result.billingStatus === 'Pending')) {
          setTimeout(() => checkPaymentStatus(sessionId, retries - 1), 3000);
        }
      } else if (retries > 0) {
        setTimeout(() => checkPaymentStatus(sessionId, retries - 1), 2000);
      }
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => checkPaymentStatus(sessionId, retries - 1), 2000);
      }
    }
    return false;
  };

  //  Check for recent payments that might need status verification
  const checkRecentPayments = async () => {
    try {
      const uid = user?.uid;
      if (!uid || !packageId) return;

      const subscriptionsResponse = await api.get(`/api/subscriptions/user/${uid}`);
      const subscriptions = subscriptionsResponse.data;
      const hasSubscription = subscriptions.some(sub => sub.package_id === packageId);
      
      if (hasSubscription) {
        setPaymentStatusBanner('success');
        return;
      }

      setTimeout(async () => {
        try {
          const subscriptionsResponse2 = await api.get(`/api/subscriptions/user/${uid}`);
          const subscriptions2 = subscriptionsResponse2.data;
          const hasSubscriptionNow = subscriptions2.some(sub => sub.package_id === packageId);
          
          if (hasSubscriptionNow) {
            setPaymentStatusBanner('success');
          }
        } catch (err2) {}
      }, 5000);
      
    } catch (err) {}
  };

  // ⬇️ Handle successful Stripe checkout payment
  const handleStripePaymentSuccess = async (sessionId) => {
    logger.log('=== Processing Stripe payment success ===');
    logger.log('Session ID:', sessionId);

    setPaymentSuccess(true);
    setPaymentDetails({ id: sessionId, status: 'succeeded', source: 'stripe_checkout' });

    try {
      // Update payment status with backend (this now handles checkout sessions properly)
      const response = await api.post('/api/payment/status', {
        paymentId: sessionId,
        source: 'stripe'
      });

      if (!response.data || response.data.success === false) {
        throw new Error(`Failed to verify payment status: ${response.data?.message || 'Unknown error'}`);
      }

      const result = response.data;
      logger.log('Stripe checkout session status:', result);

      // Update localStorage with new subscription data
      await updateUserSubscriptionData();

      // Success! Show the custom toast
      setPaymentStatusBanner('success');

    } catch (err) {
      logger.error('Failed to process Stripe payment success:', err);
      toast.error('Payment processed! If content is not unlocked, please refresh the page.', {
        duration: 8000
      });
      // Show success banner anyway since payment went through
      setPaymentStatusBanner('success');
    }
  };

  // ⬇️ Helper function to update user subscription data
  const updateUserSubscriptionData = async () => {
    try {
      const uid = user?.uid;
      if (!uid) {
        logger.error('No user ID found in store');
        return;
      }

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

      // Update Zustand store with new subscriptions
      updateSubscriptions(subscriptionsData);
      logger.log('User subscriptions updated in store:', subscriptionsData);

      // Trigger a custom event to notify other parts of the app
      window.dispatchEvent(new CustomEvent('subscriptionUpdated', {
        detail: { subscriptions: subscriptionsData }
      }));

      // Check if user now has access to current content
      const hasAccess = await checkContentAccess(uid, packageId);
      if (hasAccess) {
        logger.log('User now has access to content!');
        // Content is unlocked, user can proceed to watch
        return true;
      }

      return false;
    } catch (err) {
      logger.error('Failed to update user subscription data:', err);
      throw err;
    }
  };

  // ⬇️ Check if user has access to specific content
  const checkContentAccess = async (userId, packageId) => {
    try {
      logger.log('Checking content access for user:', userId, 'package:', packageId);

      const response = await api.get(`/api/v2/subscriptions/user/${userId}`);
      const subscriptions = response.data;

      // Check if user has an active subscription for this package
      const relevantSubscription = subscriptions.find(sub => sub.package_id === packageId);

      if (!relevantSubscription) {
        logger.log('No subscription found for package:', packageId);
        return false;
      }

      // Check if subscription is still active
      const currentDate = new Date();
      const expiryDate = new Date(relevantSubscription.subscription_expiry);

      return expiryDate > currentDate;
    } catch (err) {
      logger.error('Error checking content access:', err);
      return false;
    }
  };





  const handleSahulatPayment = async () => {
    if (!sahulatWalletEnabled) {
      toast.error("Sahulat Wallet is currently unavailable");
      return;
    }
    const lsUser = user;
    const hasAnyLocalUser = !!lsUser;
    if (!hasAnyLocalUser) {
      toast("Login to Continue!", { icon: "👤" });
      return;
    }
    if (!packageId) {
      // toast.error("Package unavailable");
      return;
    }

    if (!location) {
      toast.error("Please wait while we detect your location...");
      return;
    }

    if (!sahulatPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!/^[+]?[0-9]{10,15}$/.test(sahulatPhone.replace(/[\s-]/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const memberId = user?.uid;
    if (!memberId) {
      toast.error("Missing User Id");
      return;
    }

    setIsLoadingSahulat(true);
    setSahulatError(null);

    try {
      // Use Unified Payment API with api interceptor (handles auth automatically)
      const resp = await api.post('/api/payment/pay', {
        packageId,
        source: "sahulat",
        phoneNumber: sahulatPhone,
        countryCode: location
      });

      if (!resp.data || resp.data.success === false) {
        throw new Error(`Payment init failed: ${resp.data?.message || 'Unknown error'}`);
      }

      const result = resp.data;
      if (!result?.success) {
        throw new Error("Invalid response from payment API");
      }


      // Always use frontend-generated auto-submitting form (ignore API-provided HTML)
      const paymentUrl = result.payment_url;
      const formFields = Array.isArray(result.form_fields) ? result.form_fields : [];
      if (!paymentUrl || formFields.length === 0) {
        throw new Error('Missing payment_url or form_fields for Sahulat form');
      }

      const inputs = formFields
        .map((f) => `<input type="${f.type || 'hidden'}" name="${f.name}" value="${String(f.value || '').replace(/"/g, '&quot;')}">`)
        .join('\n');
      const frontendFormHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><form id="f" action="${paymentUrl}" method="post">${inputs}</form><script>try{document.getElementById('f').submit();}catch(e){}</script></body></html>`;

      // Open in a popup window first
      const paymentWindow = window.open('', '_blank', 'width=900,height=800');
      if (!paymentWindow) {
        throw new Error('Popup blocked. Please allow popups to continue');
      }

      let wrote = false;
      try {
        paymentWindow.document.open();
        paymentWindow.document.write(frontendFormHtml);
        paymentWindow.document.close();
        wrote = true;
      } catch (_) { }

      // Fallback 1: navigate via data URL
      if (!wrote) {
        try {
          const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(frontendFormHtml);
          paymentWindow.location.href = dataUrl;
          wrote = true;
        } catch (_) { }
      }

      // Fallback 2: submit from current window if popup failed completely
      if (!wrote) {
        try {
          const tempForm = document.createElement('form');
          tempForm.action = paymentUrl;
          tempForm.method = 'POST';
          tempForm.acceptCharset = 'UTF-8';
          formFields.forEach((f) => {
            const input = document.createElement('input');
            input.type = f.type || 'hidden';
            input.name = f.name;
            input.value = String(f.value || '');
            tempForm.appendChild(input);
          });
          tempForm.style.display = 'none';
          document.body.appendChild(tempForm);
          tempForm.submit();
          setTimeout(() => { try { document.body.removeChild(tempForm); } catch (_) { } }, 5000);
        } catch (e) {
          logger.error('Failed to render Sahulat form:', e);
          throw e;
        }
      }
    } catch (error) {
      logger.error("Failed to start Sahulat checkout:", error);
      setSahulatError(error.message || "Failed to start payment");
      toast.error(error.message || "Failed to start payment");
    } finally {
      setIsLoadingSahulat(false);
    }
  };

  // ⬇️ Handle successful Sahulat Wallet payment
  const handleSahulatPaymentSuccess = async (paymentData) => {
    setPaymentSuccess(true);
    setPaymentDetails(paymentData);

    try {
      // Update payment status with backend
      const response = await api.post('/api/payment/status', {
        paymentId: paymentData?.id || paymentData?.paymentId,
        source: "sahulat",
      });

      if (!response.data || response.data.success === false) {
        throw new Error(`Failed to update payment status (${response.status})`);
      }

      const result = response.data;
      logger.log("Sahulat Wallet billing/subscription updated:", result);

      // Update localStorage with new subscription data
      await updateUserSubscriptionData();

      // Success! Show the custom toast
      setPaymentStatusBanner("success");

    } catch (err) {
      logger.error("Failed to update Sahulat Wallet billing/subscription:", err);
      toast.error('Payment processed! If content is not unlocked, please refresh the page.', {
        duration: 8000
      });
      // Show success banner anyway since payment went through
      setPaymentStatusBanner('success');
    }
  };

  // ⬇️ Called after confirmPayment succeeds (for payment intents, not checkout sessions)
  const handlePaymentSuccess = async (paymentIntent) => {
    logger.log('=== Processing Payment Intent Success ===');
    logger.log('Payment Intent ID:', paymentIntent?.id);

    setPaymentSuccess(true);
    setPaymentDetails(paymentIntent);

    try {
      const response = await api.post('/api/payment/status', {
        paymentId: paymentIntent?.id,
        source: "stripe",
      });

      if (!response.data || response.data.success === false) {
        throw new Error(`Failed to fetch payment status (${response.status})`);
      }

      const result = response.data;
      logger.log("Payment intent billing/subscription updated:", result);

      // Update localStorage with new subscription data
      await updateUserSubscriptionData();

      // Success! Show the custom toast
      setPaymentStatusBanner("success");

    } catch (err) {
      logger.error("Failed to update billing/subscription:", err);
      toast.error('Payment completed! If content is not unlocked, please refresh the page.', {
        duration: 8000
      });
      setPaymentStatusBanner("success");
    }
  };

  // ⬇️ Validate Pakistani phone number
  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Pakistani phone patterns: +92XXXXXXXXXX, 92XXXXXXXXXX, 03XXXXXXXXX, 3XXXXXXXXX
    const patterns = [
      /^\+92[0-9]{10}$/, // +92XXXXXXXXXX
      /^92[0-9]{10}$/, // 92XXXXXXXXXX
      /^03[0-9]{9}$/, // 03XXXXXXXXX
      /^3[0-9]{9}$/ // 3XXXXXXXXX
    ];
    return patterns.some(pattern => pattern.test(cleanPhone));
  };

  // ⬇️ Handle phone number input for Sahulat
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setSahulatPhone(value);

    if (value.trim() && !validatePhoneNumber(value)) {
      setPhoneNumberError('Please enter a valid Pakistani phone number (e.g., +923001234567 or 03001234567)');
    } else {
      setPhoneNumberError('');
    }
  };

  // Preserve your old query-param banner behavior for deep links (optional)
  useEffect(() => {
    const cleanedSearch = window.location.search.replace(/&amp;/g, '&');
    const queryParams = new URLSearchParams(cleanedSearch);
    const status = queryParams.get("paymentStatus");
    const sessionId = queryParams.get("sessionId");
    const payfastCallback = queryParams.get("payfast");
    const basketId = queryParams.get("basketId");
    const transactionId = queryParams.get("transaction_id");
    const errCode = queryParams.get("err_code");
    
    if (payfastCallback === "callback" && basketId) {
      if (transactionId && errCode === "000") {
        logger.log("PAYFAST PAYMENT SUCCESS UPDATING!!!!");
        handlePayFastPaymentSuccess(basketId, transactionId);
      } else {
        logger.log("PAYFAST PAYMENT FAILED UPDATING!!!!");
        handlePayFastPaymentFailure(basketId);
      }
      return;
    }
    
    if (status === "success" || status === "fail" || status === "cancelled") {
      setPaymentStatusBanner(status);
      if (status === "success") {
        // For successful payments from Stripe Checkout redirect
        setPaymentSuccess(true);
        
        if (sessionId) {
          setTimeout(() => checkPaymentStatus(sessionId), 1000);
        } else {
          setTimeout(() => checkRecentPayments(), 1000);
        }
      }
    }
  }, []);

  // ⬇️ Listen for Sahulat payment messages from callback window
  useEffect(() => {
    const handleMessage = (event) => {
      logger.log('Received message:', event.data);

      // Handle the specific message structure from Sahulat callback
      if (event.data && typeof event.data === 'object') {
        const { type, gateway, status, orderid } = event.data;

        // Check for payment window closure message from Sahulat callback
        if (type === 'payment_window_closed' && gateway === 'sahulat') {
          logger.log('Sahulat payment window closed with status:', status);

          if (status === 'success' && orderid) {
            logger.log('Processing successful Sahulat payment:', orderid);
            handleSahulatPaymentSuccess({
              id: orderid,
              status: 'success',
              source: 'sahulat'
            });
          } else if (status === 'failed') {
            logger.log('Sahulat payment failed:', orderid);
            setSahulatError('Payment failed or was cancelled');
            toast.error('Payment failed or was cancelled');
            setIsLoadingSahulat(false);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    // show once
    if (paymentStatusBanner === "success" && !successToastId.current) {
      const deeplinkUrl = (() => { try { return sessionStorage.getItem('deeplinkReturnUrl'); } catch (_) { return null; } })();
      
      // Add overlay to prevent clicks
      const overlay = document.createElement('div');
      overlay.id = 'payment-success-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9998;background:rgba(0,0,0,0.5);';
      document.body.appendChild(overlay);
      
      let countdown = 3;
      const CountdownComponent = ({ count, showRetry }) => (
        <div className="delete-account-toast">
          <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/business-prodect-diamondv2.png`} alt="Success Icon" className="stop-icon" />
          <h3 className="delete-title">Congratulations</h3>
          <p className="delete-description">
            Your exclusive content is now unlocked. Press play to start watching.
          </p>
          <div className="button-container">
            {deeplinkUrl ? (
              showRetry ? (
                <button onClick={() => window.location.href = deeplinkUrl} className="cancel-button">
                  Redirect to {seriesData?.title}
                </button>
              ) : (
                <button disabled className="cancel-button" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                  Redirecting in {count}...
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => {
                    toast.dismiss(successToastId.current);
                    document.getElementById('payment-success-overlay')?.remove();
                    seriesData?.seriesType === "singleVideo" 
                      ? navigate(`/watch/v1/${seriesId}`, { replace: true })
                      : navigate(`/series/v3/${seriesId}`, { replace: true });
                  }}
                  className="cancel-button"
                >
                  Watch now
                  <svg className="mx-2" width={window.innerWidth < 768 ? "16" : "22"} height={window.innerWidth < 768 ? "16" : "22"} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={() => {
                    toast.dismiss(successToastId.current);
                    document.getElementById('payment-success-overlay')?.remove();
                    navigate(`/view-all/Category/Tvod%20Exclusives`);
                  }} className="proceed-button">View all exclusive content</button>
              </>
            )}
          </div>
        </div>
      );
      
      successToastId.current = toast.custom(
        (t) => <CountdownComponent count={countdown} showRetry={false} />,
        {
          duration: Infinity,
          style: { background: "transparent", border: "none", zIndex: 9999 },
        }
      );
      
      if (deeplinkUrl) {
        const timer = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            toast.custom(
              (t) => <CountdownComponent count={countdown} showRetry={false} />,
              {
                id: successToastId.current,
                duration: Infinity,
                style: { background: "transparent", border: "none", zIndex: 9999 },
              }
            );
          } else {
            clearInterval(timer);
            window.location.href = deeplinkUrl;
            
            // Safari fallback: if user cancels popup, show retry button
            setTimeout(() => {
              if (!document.hidden) {
                toast.custom(
                  (t) => <CountdownComponent count={0} showRetry={true} />,
                  {
                    id: successToastId.current,
                    duration: Infinity,
                    style: { background: "transparent", border: "none", zIndex: 9999 },
                  }
                );
              }
            }, 2000);
          }
        }, 1000);
      }
    }

    // dismiss if banner no longer success
    if (paymentStatusBanner !== "success" && successToastId.current) {
      toast.dismiss(successToastId.current);
      successToastId.current = null;
      document.getElementById('payment-success-overlay')?.remove();
    }

    // cleanup on unmount
    return () => {
      if (successToastId.current) {
        toast.dismiss(successToastId.current);
        successToastId.current = null;
        document.getElementById('payment-success-overlay')?.remove();
      }
    };
  }, [paymentStatusBanner, navigate, seriesId]);

  // 🛑 If TVOD is disabled, redirect to home
  if (!tvodEnabled) {
    navigate('/');
    return null;
  }

  // 🛑 If series not found, show friendly message
  if (notFound && !isLoading) {
    return <ErrorPage2 />;
  }

  return (
    <Fragment>
      <div className="iq-breadcrumb paddingBottom0">
        <Container fluid>
          <div className="section-paddingv2">
            <Row className="align-items-center">
              <Col sm="12">
                <h2 className="title text-capitalize mb-4 text-center">Unlock Exclusive</h2>
                <h3 className="mb-4 text-center section-subtitle">High Quality Aur Ad-Free. Ab Binge Ka Waqt Hai.</h3>
                <p className="text-center tvod-fontp">
                  Rent now to stream this premium content — one-time payment, no subscription required.
                </p>

                {paymentStatusBanner === "fail" && (
                  <Alert variant="danger">
                    <h4>Payment Failed</h4>
                    <p>There was an issue with your payment. Please try again.</p>
                  </Alert>
                )}

                {paymentStatusBanner === "cancelled" && (
                  <Alert variant="warning">
                    <h4>Payment Cancelled</h4>
                    <p>Your payment was cancelled. You can try again when you're ready.</p>
                  </Alert>
                )}

                <SubscriptionCard
                  seriesData={seriesData}
                  packageData={packageData}
                  location={location}
                  imageBase={imageBase}
                />


              </Col>
            </Row>
          </div>
        </Container>
      </div>
      <Container>
        <Row className="justify-content-center">
          <Col sm={6} xs={11}>
            {!paymentSuccess && packageData && (
              // <div className="pricing-plan-wrapper v2 mx-auto ">
                <PaymentForm
                  packageData={packageData}
                  paymentSuccess={paymentSuccess}
                  multiGatewayEnabled={multiGatewayEnabled}
                  selectedGateway={selectedGateway}
                  setSelectedGateway={setSelectedGateway}
                  selectedPaymentMethod={selectedPaymentMethod}
                  setSelectedPaymentMethod={setSelectedPaymentMethod}
                  sahulatWalletEnabled={sahulatWalletEnabled}
                  location={location}
                  isCreatingCheckoutSession={isCreatingCheckoutSession}
                  isLoadingPayFast={isLoadingPayFast}
                  handleStripeCheckout={handleStripeCheckout}
                  handlePKPayment={handlePKPayment}
                  sahulatPhone={sahulatPhone}
                  handlePhoneChange={handlePhoneChange}
                  phoneNumberError={phoneNumberError}
                  isLoadingSahulat={isLoadingSahulat}
                  handleSahulatPayment={handleSahulatPayment}
                  checkoutSessionError={checkoutSessionError}
                  sahulatError={sahulatError}
                  imageBase={imageBase}
                />
              // </div>
            )}
          </Col>
        </Row>
      </Container>


      {isLoading && <Loader />}

      {/* <h2 className="tvod-fontH2 text-capitalize  text-center">Explore The Benefits</h2> */}

      <div className="ottDetail mt-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}promotionalBanner/Frame_1766049900407.webp`}
                      className="img-fluid w-70"
                      loading="lazy"
                    />
            {/* <Col
              xs={12}
              className="align-items-center text-center text-xl-start rounded"
              style={{ maxWidth: "1000px", width: "100%" }}
            >
              <Row className="align-items-stretch bg-dark-purple p-10 d-flex">
                <Col xl={6} lg={6} md={12} className="mb-4 mb-xl-0 d-flex flex-column justify-content-center">
                  <h2 className="tvod-fontH2 mb-2 mt-3">Watch on multiple devices</h2>
                  <p className="tvod-fontp">
                    Get access to Original, Exclusive, and Blockbuster Premiers with Your Zap Subscription.
                  </p>
                </Col>
                <Col xl={6} lg={6} md={12} className="d-flex align-items-center">
                  <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/payment/drama.webp`} className="img-fluid w-100" loading="lazy" alt="Series poster" />
                </Col>
              </Row>

              <Row className="align-items-stretch bg-light-purple p-10 d-flex">
                <Col xl={6} lg={6} md={12} className="mb-4 mb-xl-0 order-2 order-xl-1 d-flex align-items-center">
                  <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/payment/drama-screenshot.webp`} className="img-fluid w-100" loading="lazy" alt="Cover" />
                </Col>
                <Col xl={6} lg={6} md={12} className="order-1 order-xl-2 d-flex flex-column justify-content-center">
                  <h2 className="tvod-fontH2 mb-2 mt-3">Ad-Free Content</h2>
                  <p className="tvod-fontp">
                    Get access to Original, Exclusive, and Blockbuster Premiers with Your Zap Subscription.
                  </p>
                </Col>
              </Row>
            </Col> */}
          </Row>
        </Container>
      </div>

    </Fragment>
  );
});

Tvod.displayName = "Tvod";
export default Tvod;