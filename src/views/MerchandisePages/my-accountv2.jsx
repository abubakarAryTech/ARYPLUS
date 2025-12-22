import React, { Fragment, memo, useEffect, useState } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import "../../authpages.scss";
import { AnimatePresence, motion } from "framer-motion";

import { IoIosArrowBack } from "react-icons/io";
import { useAuthStore } from "../../stores/useAuthStore"
import { isFeatureEnabled } from "../../../config";
import { isTvodEnabled } from "../../utilities/tvodHelper";
import { ThreeDot } from "react-loading-indicators";
import sessionService from "../../services/session";
import logger from '../../services/logger';

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import toast from "react-hot-toast";
import { Helmet } from "react-helmet";
import { FaAngry, FaFrown, FaMeh, FaSmile, FaGrinHearts, FaCheckCircle, FaDownload } from "react-icons/fa";
import api from "../../services/api";
import WatchHoursCard from "../../components/WatchHoursCard";
import { generateAndDownloadInvoice } from "../../utilities/downloadInvoice";
import { formatBillingPrice, getPaymentMethodInfo, formatBillingDate, getBillingStatusInfo, validateBillingData } from "../../utilities/billingUtils";


// Helper function to safely get billing metadata
const getBillingDisplayData = (bill) => {
  const defaultData = {
    packageName: bill?.packageName || 'Content Package',
    packageDays: 'N/A',
    billingMethod: 'N/A',
    hasValidMeta: false
  };

  try {
    if (!bill || !bill.billingMeta) {
      logger.warn('⚠️ No billing metadata found for bill:', bill?._id);
      return defaultData;
    }

    // Stripe gateway
    if (bill.billingMeta.stripeMeta) {
      return {
        packageName: bill.billingMeta.stripeMeta.packageName || defaultData.packageName,
        packageDays: bill.billingMeta.stripeMeta.packageDays || defaultData.packageDays,
        billingMethod: bill.billingMeta.stripeMeta.billingMethod || 'Card Payment',
        hasValidMeta: true
      };
    }

    // PayFast gateway
    if (bill.billingMeta.payfastMeta) {
      return {
        packageName: bill.billingMeta.payfastMeta.packageName || defaultData.packageName,
        packageDays: bill.billingMeta.payfastMeta.packageDays || defaultData.packageDays,
        billingMethod: 'PayFast Payment',
        hasValidMeta: true
      };
    }

    // Fallback to generic billingMeta
    if (bill.billingMeta.packageName) {
      return {
        packageName: bill.billingMeta.packageName,
        packageDays: bill.billingMeta.packageDays || defaultData.packageDays,
        billingMethod: getPaymentMethodInfo(bill).details || defaultData.billingMethod,
        hasValidMeta: true
      };
    }

    logger.warn('⚠️ Using fallback billing data for:', bill._id);
    return {
      packageName: bill.packageName || defaultData.packageName,
      packageDays: defaultData.packageDays,
      billingMethod: getPaymentMethodInfo(bill).details || defaultData.billingMethod,
      hasValidMeta: false
    };
  } catch (error) {
    logger.error('❌ Error processing billing display data:', error, bill);
    return defaultData;
  }
};

const MyAccountv2 = memo(() => {

  const handleDownload = (invoiceId) => {
    // Display a toast to indicate that the download has started
    toast.custom(
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#fff',
        color: '#000'
        // borderRadius: '8px',
        // boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        // fontSize: '16px',
        // fontWeight: '500'
      }}>
        <FaDownload style={{ marginRight: '8px', color: '#a7ca11 ' }} />
        <span>Downloading...</span>
        {/* <FaChevronRight style={{ marginLeft: '8px', color: '#007bff' }} /> */}
      </div>,
      { id: 'download-invoice' }
    );



    // Call the function to generate and download the PDF
    generateAndDownloadInvoice(invoiceId);
  };


  const [searchParams] = useSearchParams();
  const rate = searchParams.get("rate") === "true";

  const [step, setStep] = useState(() => {
    if (rate) return 3;
    return 1;
  });
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);



  const [aFullName, setaFullName] = useState("");
  const [aEmail, setaEmail] = useState("");
  const [aPhone, setaPhone] = useState("");
  const [aDob, setaDob] = useState("");

  const [aFeedback, setaFeedback] = useState("");

  const [selectedReaction, setSelectedReaction] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [originalBillings, setOriginalBillings] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [loadingBillings, setLoadingBillings] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(null); // null or bill object
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState("all-time");


  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [step]);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchUserInfo(user);
    }
  }, [isAuthenticated, user, navigate]);

  // Function to clear messages when user starts typing
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setisLoading(true);

    try {
      const userId = user?.uid || "";
      const rating = selectedReaction;

      if (!userId) {
        setError(
          "We couldn't identify your account. Please log in and try again.",
        );
        return;
      }

      if (!rating) {
        setError("Please select a rating before submitting your feedback.");
        return;
      }

      const data = {
        userId,
        feedback: aFeedback,
        app: "web",
        rate: rating,
      };

      const response = await api.post(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/feedback/create`,
        data,
      );

      if (response.success) {
        setaFeedback("");
        setStep(5);
        setSelectedReaction(null); // ✅ fixed typo: setSelectedReaction
      } else {
        setError(
          "We were unable to submit your feedback. Please try again shortly.",
        );
      }
    } catch (error) {
      setError(
        "Oops! Something went wrong while submitting your feedback. Please try again.",
      );
    } finally {
      setisLoading(false);
    }
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="delete-account-toast">
          <button className="close-button" onClick={() => toast.dismiss(t.id)}>
            ×
          </button>
          <img
            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/interface-essential-stop-sign-2v2.png`}
            alt="Stop Icon"
            className="stop-icon"
          />
          <h3 className="delete-title">Delete Account</h3>
          <p className="delete-description">
            Okay, this is really it. Deleting your account will erase
            everything. Like, everything-everything. No going back
          </p>
          <div className="button-container">
            <button
              onClick={() => {
                deleteAccount()
                  .then(() => {
                    toast.dismiss(t.id);
                    navigate("/");
                  })
                  .catch((error) => {
                    toast.dismiss(t.id);
                    toast.error(
                      `Error: ${error.message || "Failed to delete account"}`,
                    );
                  });
              }}
              className="proceed-button"
            >
              Proceed Anyway
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
              }}
              className="cancel-button"
            >
              Keep Using This Account
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "transparent",
          border: "none",
        },
      },
    );
  };

  const deleteAccount = async () => {
    const result = await useAuthStore.getState().deleteAccount();
    if (!result.success) {
      if (result.requiresReauth) {
        toast(result.message, { icon: 'ℹ️', duration: 5000 });
        return;
      }
      throw new Error(result.error || "Failed to delete account");
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setStep(2);
    }
  };

  const fetchUserInfo = async (currentUser) => {
    if (!currentUser?.uid) return;

    try {

      const response = await api.get(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/member/${currentUser.uid}`
      );

      if (response.data && response.data.success) {
        const userData = response.data.data;
        setaFullName(userData.displayName || userData.firstName || "");
        setaEmail(userData.email || "");
        setaPhone(userData.phoneNumber || "");
        setaDob(
          userData.dateOfBirth
            ? new Date(userData.dateOfBirth).toISOString().slice(0, 10)
            : "",
        );
      } else {

        logger.error("Failed to fetch user data", response);
      }
    } catch (error) {
      // Error fetching user info - use Zustand store data
      if (user) {
        setaFullName(user.displayName || "");
        setaEmail(user.email || "");
        setaPhone(""); // No phone in store
        setaDob(""); // No DOB in store
      }
    }
  };

  const handleAccountDetails = (e) => {
    setStep(2);
  };

  const handleWatchAnalytics = (e) => {
    setStep(10);
  };

  const handleFeedback = (e) => {
    setStep(3);
  };

  const moreOptions = (e) => {
    setStep(4);
  };

  const handleSubscriptions = async (e) => {
    if (!isTvodEnabled()) {
      toast.error('Subscriptions feature is currently unavailable');
      return;
    }
    setStep(7);
    setLoadingSubscriptions(true);
    try {
      const response = await api.get(`/api/v2/subscriptions/user/${user?.uid}`);
      setSubscriptions(response.data || []);
    } catch (error) {
      logger.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleBillings = async (e) => {
    if (!isTvodEnabled()) {
      toast.error('Billing feature is currently unavailable');
      return;
    }
    setStep(8);
    setLoadingBillings(true);
    try {
      logger.log('🧾 Fetching billing data for user:', user?.uid);
      const response = await api.get(`/api/billings/member/${user?.uid}`);

      // Include all billings (Paid, Refunded, and Pending)
      const allBillings = response.data;

      // Log billing structure for debugging
      logger.log('💰 Found billings:', allBillings.length);
      if (allBillings.length > 0) {
        logger.log('💰 First billing structure:', {
          id: allBillings[0]._id,
          hasBillingMeta: !!allBillings[0].billingMeta,
          hasStripeMeta: !!allBillings[0].billingMeta?.stripeMeta,
          hasPayfastMeta: !!allBillings[0].billingMeta?.payfastMeta,
          hasTxnMeta: !!allBillings[0].txnMeta,
          gateway: allBillings[0].txnMeta?.gateway || allBillings[0].billingMethod,
          billingMeta: allBillings[0].billingMeta
        });
      }

      // Sort by latest date (subscription_date or createdAt for pending)
      const sortedBillings = allBillings.sort((a, b) => {
        const dateA = a.billingValidThru?.[0]?.subscription_date
          ? new Date(a.billingValidThru[0].subscription_date).getTime()
          : new Date(a.createdAt).getTime();
        const dateB = b.billingValidThru?.[0]?.subscription_date
          ? new Date(b.billingValidThru[0].subscription_date).getTime()
          : new Date(b.createdAt).getTime();
        return dateB - dateA; // descending order
      });
      setBillings(sortedBillings || []);
      setOriginalBillings(sortedBillings || []);
    } catch (error) {
      logger.error('Error fetching billings:', error);
      setBillings([]);
    } finally {
      setLoadingBillings(false);
    }
  };

  const handleDateFilter = (dateRange) => {
    setLoadingBillings(true);
    try {
      let filteredBillings = originalBillings;
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);

      switch (dateRange) {
        case 'this-year':
          filteredBillings = originalBillings.filter(bill => {
            const billDate = bill.billingValidThru?.[0]?.subscription_date 
              ? new Date(bill.billingValidThru[0].subscription_date)
              : new Date(bill.createdAt);
            return billDate.getFullYear() === today.getFullYear();
          });
          break;
        case 'this-month':
          filteredBillings = originalBillings.filter(bill => {
            const billDate = bill.billingValidThru?.[0]?.subscription_date 
              ? new Date(bill.billingValidThru[0].subscription_date)
              : new Date(bill.createdAt);
            return billDate.getMonth() === today.getMonth() && billDate.getFullYear() === today.getFullYear();
          });
          break;
        case 'last-month':
          filteredBillings = originalBillings.filter(bill => {
            const billDate = bill.billingValidThru?.[0]?.subscription_date 
              ? new Date(bill.billingValidThru[0].subscription_date)
              : new Date(bill.createdAt);
            return billDate.getMonth() === lastMonth.getMonth() && billDate.getFullYear() === lastMonth.getFullYear();
          });
          break;
        case 'all-time':
        default:
          filteredBillings = originalBillings;
          break;
      }
      
      // Apply search filter if search query exists
      if (searchQuery.trim()) {
        filteredBillings = filteredBillings.filter(bill => {
          const packageName = getBillingDisplayData(bill).packageName.toLowerCase();
          const invoiceId = bill.invoiceId.toLowerCase();
          const price = formatBillingPrice(bill).formatted.toLowerCase();
          const query = searchQuery.toLowerCase();
          return packageName.includes(query) || invoiceId.includes(query) || price.includes(query);
        });
      }
      
      setBillings(filteredBillings || []);
    } catch (error) {
      logger.error('Error filtering by date:', error);
      setBillings([]);
    } finally {
      setLoadingBillings(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setLoadingBillings(true);
    try {
      if (!query.trim()) {
        setBillings(originalBillings);
        return;
      }
      
      const filtered = originalBillings.filter(bill => {
        const packageName = getBillingDisplayData(bill).packageName.toLowerCase();
        const invoiceId = bill.invoiceId.toLowerCase();
        const price = formatBillingPrice(bill).formatted.toLowerCase();
        const searchTerm = query.toLowerCase();
        return packageName.includes(searchTerm) || invoiceId.includes(searchTerm) || price.includes(searchTerm);
      });
      
      setBillings(filtered);
    } catch (error) {
      logger.error('Error searching billings:', error);
    } finally {
      setLoadingBillings(false);
    }
  };


  const handleCompletePayment = async (bill) => {
    try {
      setisLoading(true);
      const response = await fetch('http://localhost:3000/stripe/get-existing-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billingId: bill._id })
      });

      const data = await response.json();

      if (data.success) {
        setSelectedBill({
          ...bill,
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId
        });
        setStep(9);
      } else {
        setError('Unable to retrieve payment details');
      }
    } catch (error) {
      logger.error('Error retrieving payment intent:', error);
      setError('Failed to load payment details');
    } finally {
      setisLoading(false);
    }
  };

  const handleLogin = (e) => {
    setStep(6);
  };

  const handleSignup = (e) => {
    setStep(1);
  };

  const handleTerms = (e) => {
    window.open("/terms-of-use", "_blank", "noopener,noreferrer");
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();

    if (!aFullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!aPhone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setisLoading(true);

    try {
      const userId = user?.uid || "";
      const userData = {
        displayName: aFullName.trim(),
        phoneNumber: aPhone.trim(),
        dateOfBirth: aDob ? new Date(aDob).toISOString() : null,
      };

      const response = await api.put(
        `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/member/${userId}`,
        userData
      );

      if (response.data && response.data.success) {
        // Update Zustand store with new user data
        useAuthStore.getState().updateUserProfile({
          displayName: aFullName.trim(),
          phoneNumber: aPhone.trim(),
          dateOfBirth: aDob ? new Date(aDob).toISOString() : null
        });
        
        toast.success("Account details updated successfully!");
        setSuccess("Account details updated successfully!");
        setError(null);
        fetchUserInfo(user);
      } else {
        setError(response.data?.error || "Failed to update account details");
        setSuccess(null);
        toast.error(response.data?.error || "Failed to update account details");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setisLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
  };

  const formatErrorMessage = (message) => {
    if (!message || typeof message !== "string") return "Login failed";

    const cleaned = message
      .replace(/_/g, " ") // Replace underscores with spaces
      .toLowerCase() // Convert entire string to lowercase
      .trim(); // Remove leading/trailing spaces

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <Fragment>
      <Helmet>
        <title>My Account</title>
      </Helmet>
      <main className="main-content">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4"> */}
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex flex-column justify-content-top py-4">
                <Container>
                  {/* <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5"> */}
                  <Row className="justify-content-center align-items-center pt-5 mt-5">
                    <Col
                      lg="5"
                      md="5"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <h2 className="fw-bold">Account Settings</h2>

                      <div className="d-flex flex-column gap-3">
                        {/* Account Details */}
                        <Link
                          onClick={handleAccountDetails}
                          className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2 mx-2">
                            {/* <i className="bi bi-person-fill"></i> */}

                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/User-2.svg`} alt="" style={{ width: '18px' }} />

                            <span>Account Details</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                        </Link>

                        {user && isFeatureEnabled('watchAnalyticsEnabled') && (
                          <Link
                            onClick={handleWatchAnalytics}
                            className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                          >
                            <div className="d-flex align-items-center gap-2 mx-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 24 25" fill="none">
                                <path d="M7 16.5C7 17.0523 7.44772 17.5 8 17.5C8.55229 17.5 9 17.0523 9 16.5V14.5C9 13.9477 8.55229 13.5 8 13.5C7.44772 13.5 7 13.9477 7 14.5V16.5Z" fill="white"/>
                                <path d="M12 17.5C11.4477 17.5 11 17.0523 11 16.5V8.5C11 7.94771 11.4477 7.5 12 7.5C12.5523 7.5 13 7.94771 13 8.5V16.5C13 17.0523 12.5523 17.5 12 17.5Z" fill="white"/>
                                <path d="M15 16.5C15 17.0523 15.4477 17.5 16 17.5C16.5523 17.5 17 17.0523 17 16.5V10.5C17 9.94772 16.5523 9.5 16 9.5C15.4477 9.5 15 9.94772 15 10.5V16.5Z" fill="white"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M2 5.5C2 4.39543 2.89543 3.5 4 3.5H20C21.1046 3.5 22 4.39543 22 5.5V19.5C22 20.6046 21.1046 21.5 20 21.5H4C2.89543 21.5 2 20.6046 2 19.5V5.5ZM4 5.5H20V19.5H4V5.5Z" fill="white"/>
                              </svg>
                              <span>Watch Analytics</span>
                            </div>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                                fill="white"
                              />
                            </svg>
                          </Link>
                        )}
                        {/* <Link
                          onClick={handleAccountDetails  }
                          className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2 mx-2">

                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/history.svg`} alt="" style={{ width: '18px' }} />

                            <span>Watch History</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                        </Link> */}
                        {/* <Link
                          onClick={handleSubscriptions}
                          className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2 mx-2">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/billing.svg`} alt="" style={{ width: '18px' }} />
                            <span>Subscriptions</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                        </Link> */}

                        {isTvodEnabled() && (
                          <Link
                            onClick={handleBillings}
                            className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                          >
                          <div className="d-flex align-items-center gap-2 mx-2">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/billing.svg`} alt="" style={{ width: '18px' }} />
                            <span>Billing</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                          </Link>
                        )}

                        {/* Write Feedback */}
                        <Link
                          onClick={handleFeedback}
                          className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2 mx-2 " >
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/Pen.svg`} alt="" style={{ width: '18px' }} />

                            <span>Rate/Review</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                        </Link>

                        {/* Help Center */}
                        {import.meta.env.VITE_HELP_CENTER_URL && (
                          <Link
                            to={import.meta.env.VITE_HELP_CENTER_URL}
                            target="_blank"
                            className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                          >
                            <div className="d-flex align-items-center gap-2 mx-2">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 12C15 10.8954 15.8954 10 17 10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18C15.8954 18 15 17.1046 15 16V12Z" stroke="white" strokeWidth="2"/>
                                <path d="M9 12C9 10.8954 8.10457 10 7 10C4.79086 10 3 11.7909 3 14C3 16.2091 4.79086 18 7 18C8.10457 18 9 17.1046 9 16V12Z" stroke="white" strokeWidth="2"/>
                                <path d="M3 14V11C3 6.02944 7.02944 2 12 2C16.9706 2 21 6.02944 21 11V15.8462C21 17.8545 21 18.8586 20.6476 19.6417C20.2465 20.5329 19.5329 21.2465 18.6417 21.6476C17.8586 22 16.8545 22 14.8462 22H12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>Help Center</span>
                            </div>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                                fill="white"
                              />
                            </svg>
                          </Link>
                        )}

                        <Link
                          onClick={() => moreOptions()}
                          className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2 mx-2">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/More.svg`} alt="" style={{ width: '18px' }} />

                            <span>More Options</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                        </Link>
                        {/* <Link
                          onClick={() => auth.logout()}
                          className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2 mx-2">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/LogOut.svg`} alt="" />

                            <span>Logout</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                        </Link> */}


                      </div>

                      {/* Watch Hours Analytics */}
                      {/* {user?.uid && (
                        <div className="mt-4">
                          <WatchHoursCard userId={user.uid} />
                        </div>
                      )} */}
                    </Col>
                  </Row>
                </Container>
                <Container>
                  <Row className="justify-content-center align-items-center pt-5 mt-5">
                    <Col
                      lg="5"
                      md="5"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      {/* Delete Account Link at Bottom */}
                      {/* <div className="text-center mt-auto mb-4"> */}
                      {/* <div className="d-flex flex-column mt-auto gap-3 mb-4"> */}
                      <Link
                        onClick={async () => {
                          await sessionService.logoutSession();
                          useAuthStore.getState().logout();
                        }}
                        className="text-decoration-none text-white  border-secondary pb-2 d-flex justify-content-between align-items-center"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center gap-2 mx-2">
                          <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/LogOut.svg`} alt="" style={{ width: '18px' }} />
                          <span style={{ color: "white" }}>
                            Sign Out
                          </span>
                        </div>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                            fill="white"
                          />
                        </svg>
                      </Link>
                      {/* </div> */}
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <Col
                      lg="5"
                      md="5"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <p className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={goBack}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Account Details
                      </p>

                      <div>
                        <Form onSubmit={handleSettingsSubmit}>
                          <Form.Group controlId="formDetails">
                            <div className="d-flex flex-column gap-3">
                              <div className="avatar-div text-center">
                                {user.photoURL ? (
                                  <img
                                    className="user-img rounded-full"
                                    src={user.photoURL}
                                    alt="User Avatar"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/default-avatar.svg`;
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/default-avatar.svg`}
                                    className="user-img rounded-full"
                                    alt="Default Avatar"
                                  />
                                )}
                              </div>

                              <div className="form-custom-label">
                                <Form.Label className="fw-bold">
                                  Full Name*
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  className="me-2 transparent-input"
                                  value={aFullName}
                                  onChange={(e) => {
                                    setaFullName(e.target.value);
                                    clearMessages();
                                  }}
                                />
                              </div>
                              <div className="form-custom-label">
                                <Form.Label className="fw-bold">
                                  Email Address*
                                </Form.Label>
                                <Form.Control
                                  type="email"
                                  className="me-2 transparent-input"
                                  value={aEmail}
                                  disabled
                                  onChange={(e) => setaEmail(e.target.value)}
                                />
                              </div>
                              <div className="form-custom-label">
                                <Form.Label className="fw-bold">
                                  Phone Number*
                                </Form.Label>
                                <Form.Control
                                  type="tel"
                                  className="me-2 transparent-input"
                                  value={aPhone}
                                  onChange={(e) => {
                                    const onlyNums = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    setaPhone(onlyNums);
                                    clearMessages();
                                  }}
                                  pattern="\d*"
                                  inputMode="numeric"
                                />
                              </div>
                              <div className="form-custom-label">
                                <Form.Label className="fw-bold">
                                  Date of Birth*
                                </Form.Label>
                                <Form.Control
                                  type="date"
                                  className="me-2 transparent-input"
                                  value={aDob}
                                  onChange={(e) => {
                                    setaDob(e.target.value);
                                    clearMessages();
                                  }}
                                />
                              </div>

                              {error ? (
                                <div className="errorDiv">
                                  <p id="error" className="error">
                                    {error}
                                  </p>
                                </div>
                              ) : null}

                              {success ? (
                                <div className="successDiv">
                                  <p id="success" className="success">
                                    {success}
                                  </p>
                                </div>
                              ) : null}

                              {isLoading ? (
                                <ThreeDot
                                  color="#A7CA11"
                                  size="medium"
                                  text=""
                                  textColor=""
                                />
                              ) : (
                                <Button variant="danger" type="submit">
                                  Update the Changes
                                </Button>
                              )}
                            </div>
                          </Form.Group>
                        </Form>

                        {/* Watch Hours Analytics */}
                        {/* {user?.uid && (
                          <div className="mt-4">
                            <WatchHoursCard userId={user.uid} />
                          </div>
                        )} */}

                        {/* Royalty Points System */}
                        {/* {user?.uid && isFeatureEnabled('royaltyPointsEnabled') && (
                          <div className="mt-4">
                            <RoyaltyPointsCard userId={user.uid} />
                          </div>
                        )} */}
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 3 ? (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <Col
                      lg="5"
                      md="5"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <p className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={goBack}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Your Feedback
                      </p>

                      <div>
                        <div className="d-flex justify-content-center gap-4 my-3">
                          {[
                            { icon: <FaAngry />, value: 1 },
                            { icon: <FaFrown />, value: 2 },
                            { icon: <FaMeh />, value: 3 },
                            { icon: <FaSmile />, value: 4 },
                            { icon: <FaGrinHearts />, value: 5 },
                          ].map(({ icon, value }) => (
                            <div
                              key={value}
                              onClick={() => setSelectedReaction(value)}
                              style={{
                                cursor: "pointer",
                                fontSize: "2rem",
                                color:
                                  selectedReaction === value
                                    ? "#FFD700"
                                    : "#ccc",
                                transition: "transform 0.2s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform = "scale(1.1)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            >
                              {icon}
                            </div>
                          ))}
                        </div>

                        <Form onSubmit={handleFeedbackSubmit}>
                          <Form.Group controlId="formDetails">
                            <div className="d-flex flex-column gap-3">
                              <Form.Control
                                as="textarea"
                                rows={4}
                                className="me-2 transparent-input"
                                value={aFeedback}
                                required
                                onChange={(e) => setaFeedback(e.target.value)}
                              />

                              {error ? (
                                <div className="errorDiv">
                                  <p id="error" className="error">
                                    {error}
                                  </p>
                                </div>
                              ) : null}

                              {success ? (
                                <div className="successDiv">
                                  <p id="success" className="success">
                                    {success}
                                  </p>
                                </div>
                              ) : null}

                              {isLoading ? (
                                <ThreeDot
                                  color="#A7CA11"
                                  size="medium"
                                  text=""
                                  textColor=""
                                />
                              ) : (
                                <Button variant="danger" type="submit">
                                  Submit
                                </Button>
                              )}
                            </div>
                          </Form.Group>
                        </Form>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 4 ? (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex flex-column justify-content-between py-4">
                <Container>
                  <Row className="justify-content-center align-items-center py-5 mt-5">
                    <Col
                      lg="5"
                      md="5"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <h2 className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={goBack}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Account Settings
                      </h2>

                      <div className="d-flex flex-column gap-3">
                        {/* Terms & Conditions */}
                        <Link
                          onClick={handleTerms}
                          className="text-decoration-none text-white border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2 mx-2">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/terms.svg`} alt="" />
                            <span>Terms & Conditions</span>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="white"
                            />
                          </svg>
                        </Link>
                      </div>
                    </Col>
                  </Row>
                </Container>

                <Container>
                  <Row className="justify-content-center align-items-center py-5 mt-5">
                    <Col
                      lg="5"
                      md="5"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      {/* Delete Account Link at Bottom */}
                      <div className="text-center mt-auto mb-4">
                        <Link
                          onClick={() => handleDelete()}
                          className="text-danger d-flex justify-content-between align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                        >
                          <div className="d-flex gap-1">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/Trash.svg`} alt="" />
                            <span style={{ color: "#c0272c" }}>
                              Delete Account
                            </span>
                          </div>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.79289 5.79289C9.18342 5.40237 9.81658 5.40237 10.2071 5.79289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L10.2071 18.2071C9.81658 18.5976 9.18342 18.5976 8.79289 18.2071C8.40237 17.8166 8.40237 17.1834 8.79289 16.7929L13.5858 12L8.79289 7.20711C8.40237 6.81658 8.40237 6.18342 8.79289 5.79289Z"
                              fill="red"
                            />
                          </svg>
                        </Link>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 5 ? (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <div className="container">
                  <div className="row justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12 d-flex flex-column justify-content-center gap-5 text-left text-md-center">
                      <p className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={goBack}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Your Feedback
                      </p>
                      <div className="d-flex flex-column justify-content-center align-items-center my-2 gap-1">
                        <img
                          width={75}
                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/reviewDone.png`}
                          alt=""
                        />
                        <p className="feedback-thank-you fw-bold mt-3">
                          Thanks for the review.
                        </p>
                        <p>{`Your feedback is important to us and helps us make the experience better for you :)`}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : step === 6 ? (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div></div>
            </motion.div>
          ) : step === 7 ? (
            // STEP 7: SUBSCRIPTIONS
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <Col
                      lg="8"
                      md="8"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <div className="d-flex align-items-center mb-4">
                        <span className="backbtn me-3" onClick={goBack} style={{
                          backgroundColor: 'rgba(247, 2, 10, 0.1)',
                          border: '1px solid rgba(247, 2, 10, 0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          cursor: 'pointer'
                        }}>
                          <IoIosArrowBack size={"1.2rem"} color="#A7CA11" />
                        </span>
                        <h2 className="text-white mb-0 fw-bold">My Subscriptions</h2>
                      </div>

                      <div>
                        {loadingSubscriptions ? (
                          <div className="text-center py-5">
                            <ThreeDot color="#A7CA11" size="medium" text="" textColor="" />
                          </div>
                        ) : subscriptions.length > 0 ? (
                          <div className="d-flex flex-column gap-4">
                            {subscriptions.map((sub) => {
                              const isActive = new Date(sub.subscription_expiry) > new Date();
                              // const daysLeft = Math.ceil((new Date(sub.subscription_expiry) - new Date()) / (1000 * 60 * 60 * 24));
                              return (
                                <div key={sub._id} className="position-relative" style={{
                                  background: 'linear-gradient(135deg, rgba(247, 2, 10, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                                  border: '1px solid rgba(247, 2, 10, 0.3)',
                                  borderRadius: '12px',
                                  padding: '24px',
                                  marginBottom: '20px',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="flex-grow-1">
                                      <h4 className="text-white mb-2 fw-bold" style={{ fontSize: '1.4rem' }}>
                                        {sub.transaction_meta?.billingMeta?.packageName || 'Subscription'}
                                      </h4>
                                      <div className="d-flex align-items-center gap-3 mb-2">
                                        <span className="badge" style={{
                                          backgroundColor: sub.transaction_meta?.billingMeta?.packageType === 'TVOD' ? '#A7CA11' : '#6c757d',
                                          color: 'white',
                                          padding: '6px 12px',
                                          fontSize: '0.75rem'
                                        }}>
                                          {sub.transaction_meta?.billingMeta?.packageType} Package
                                        </span>
                                        <span className="text-white fw-bold" style={{ fontSize: '1.2rem' }}>
                                          PKR {sub.transaction_meta?.billingMeta?.packagePrice}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <span className={`badge fs-6 px-3 py-2 ${isActive ? 'bg-success' : 'bg-danger'}`}>
                                        {isActive ? 'Active' : 'Expired'}
                                      </span>
                                      {isActive && (
                                        <div className="mt-2">
                                          <small className="text-success fw-bold">{sub.daysLeftText}</small>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {sub.transaction_meta?.billingMeta?.packageDetails && (
                                    <div className="mb-4 p-3" style={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                      borderRadius: '8px',
                                      borderLeft: '4px solid #A7CA11'
                                    }}>
                                      <p className="text-white-50 mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {sub.transaction_meta.billingMeta.packageDetails}
                                      </p>
                                    </div>
                                  )}

                                  <div className="row g-4 mb-4">
                                    <div className="col-md-3 col-6">
                                      <div className="text-center p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                        <small className="text-white-50 d-block mb-1">Start Date</small>
                                        <p className="text-white mb-0 fw-semibold">{new Date(sub.subscription_date).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <div className="col-md-3 col-6">
                                      <div className="text-center p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                        <small className="text-white-50 d-block mb-1">Duration</small>
                                        <p className="text-white mb-0 fw-semibold">{sub.transaction_meta?.billingMeta?.packageDays || '30'} days</p>
                                      </div>
                                    </div>
                                    <div className="col-md-3 col-6">
                                      <div className="text-center p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                        <small className="text-white-50 d-block mb-1">Expiry Date</small>
                                        <p className="text-white mb-0 fw-semibold">{new Date(sub.subscription_expiry).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <div className="col-md-3 col-6">
                                      <div className="text-center p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                        <small className="text-white-50 d-block mb-1">Payment</small>
                                        <p className="text-white mb-0 fw-semibold text-capitalize">{sub.transaction_meta?.billingMeta?.billingMethod || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(247, 2, 10, 0.2)' }}>
                                    <div className="row g-3">
                                      <div className="col-md-6">
                                        <small className="text-white-50">Transaction ID</small>
                                        <p className="text-white mb-0" style={{ fontSize: '0.85rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                          {sub.transaction_id}
                                        </p>
                                      </div>
                                      <div className="col-md-6">
                                        <small className="text-white-50">Invoice ID</small>
                                        <p className="text-white mb-0" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                          {sub.transaction_meta?.invoiceId?.split('-')[0] || 'N/A'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-5">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/User-2.svg`} alt="" className="mb-3" width="48" height="48" style={{ opacity: 0.3 }} />
                            <p className="text-white-50 mb-0">No subscriptions found</p>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 88 ? (
            // STEP 88: BILLINGS
            <motion.div
              key="step8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <Col
                      lg="8"
                      md="8"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <p className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={goBack}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Billings
                      </p>

                      <div>
                        {loadingBillings ? (
                          <div className="text-center py-5">
                            <ThreeDot color="#A7CA11" size="medium" text="" textColor="" />
                          </div>
                        ) : billings.length > 0 ? (
                          <div className="d-flex flex-column gap-4">
                            {billings.map((bill) => (
                              <div key={bill._id} className="border border-secondary rounded p-3 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <h6 className="text-white mb-1 fw-bold">{bill.billingType} Package</h6>
                                    <small className="text-white-50">Invoice: {bill.invoiceId.split('-')[0]}</small>
                                  </div>
                                  <span className={`badge ${bill.billingStatus === 'Paid' ? '' : 'bg-warning text-dark'}`} style={bill.billingStatus === 'Paid' ? { backgroundColor: '#28a745', color: 'white' } : {}}>
                                    {bill.billingStatus}
                                  </span>
                                </div>

                                {bill.billingValidThru && bill.billingValidThru[0] && (
                                  <div className="row mb-3">
                                    <div className="col-md-6">
                                      <div className="form-custom-label mb-2">
                                        <small className="text-white-50">Subscription Date</small>
                                        <p className="text-white mb-0">{new Date(bill.billingValidThru[0].subscription_date).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="form-custom-label mb-2">
                                        <small className="text-white-50">Expiry Date</small>
                                        <p className="text-white mb-0">{new Date(bill.billingValidThru[0].subscription_expiry).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {(() => {
                                  const displayData = getBillingDisplayData(bill);
                                  return (
                                    <div className="row mb-3">
                                      <div className="col-md-6">
                                        <div className="form-custom-label mb-2">
                                          <small className="text-white-50">Package Days</small>
                                          <p className="text-white mb-0">{displayData.packageDays} {displayData.packageDays !== 'N/A' ? 'days' : ''}</p>
                                        </div>
                                      </div>
                                      <div className="col-md-6">
                                        <div className="form-custom-label mb-2">
                                          <small className="text-white-50">Payment Method</small>
                                          <p className="text-white mb-0 text-capitalize">{displayData.billingMethod}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="form-custom-label mb-2">
                                      <small className="text-white-50">Payment ID</small>
                                      <p className="text-white mb-0 text-truncate" style={{ fontSize: '0.85rem' }}>{bill.cpayId}</p>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-custom-label mb-2">
                                      <small className="text-white-50">Package ID</small>
                                      <p className="text-white mb-0 text-truncate" style={{ fontSize: '0.85rem' }}>{bill.packageId}</p>
                                    </div>
                                  </div>
                                </div>

                                {bill.billingStatus.toLowerCase() === 'pending' && (
                                  <div className="mt-3 pt-3 border-top border-secondary">
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleCompletePayment(bill)}
                                    >
                                      Complete Payment
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-5">
                            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/Pen.svg`} alt="" className="mb-3" width="48" height="48" style={{ opacity: 0.3 }} />
                            <p className="text-white-50 mb-0">No billing records found</p>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 9 ? (
            // STEP 9: COMPLETE PAYMENT
            <motion.div
              key="step9"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <Col
                      lg="6"
                      md="8"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <p className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={() => setStep(8)}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Complete Payment
                      </p>

                      <div>
                        {selectedBill && (
                          <div className="border border-secondary rounded p-4 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <h6 className="text-white mb-3 fw-bold">Payment Details</h6>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-custom-label mb-2">
                                  <small className="text-white-50">Package ID</small>
                                  <p className="text-white mb-0">{selectedBill.packageId}</p>
                                </div>
                                <div className="form-custom-label mb-2">
                                  <small className="text-white-50">Invoice ID</small>
                                  <p className="text-white mb-0">{selectedBill.invoiceId}</p>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-custom-label mb-2">
                                  <small className="text-white-50">Status</small>
                                  <span className="badge bg-warning text-dark">{selectedBill.billingStatus}</span>
                                </div>
                                <div className="form-custom-label mb-2">
                                  <small className="text-white-50">Billing Type</small>
                                  <p className="text-white mb-0 text-capitalize">{selectedBill.billingType}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="d-flex flex-column gap-3">
                          <Button
                            variant="danger"
                            size="lg"
                            onClick={() => {
                              if (selectedBill?.clientSecret) {
                                navigate(`/complete-payment?client_secret=${selectedBill.clientSecret}&payment_intent_id=${selectedBill.paymentIntentId}`);
                              }
                            }}
                          >
                            Proceed to Payment
                          </Button>

                          <Button
                            variant="outline-secondary"
                            onClick={() => setStep(8)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 8 ? (
            // STEP 8: BILLINGS
            <motion.div
              key="step8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <Col
                      lg="5"
                      md="5"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-3 text-left text-md-center"
                    >
                      <p className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={goBack}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Billing
                      </p>
                      <div className="billing-card top-effect">
                        <div className="billing-section">


                          <div className="billing-history">
                            <div className="section-header pt-3">
                              <h4>Billing History</h4>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {/* <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 22 22"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0711 3.88333C6.38893 3.51267 3.13107 6.26233 2.70293 9.38323C2.67893 9.53603 2.75293 9.68603 2.78707 9.82283C3.25307 11.68 4.58507 13.1095 6.03307 14.2024C7.58507 15.6259 9.70207 16.4081 11.8911 16.4077H12.2301C14.6421 16.325 16.8861 15.2842 18.5791 13.5363C19.3881 12.6826 20.0191 11.6758 20.4331 10.5751C20.8471 9.47437 21.0381 8.30197 20.9921 7.12667C20.9071 4.75447 19.8491 2.50667 18.0711 0.883301C14.3891 -2.48737 8.63107 -2.23777 5.20307 1.38323C3.67907 2.98903 2.81607 5.10953 2.78507 7.32283C2.75307 9.53603 3.55607 11.68 5.03307 13.3284L-1.57293 19.4619C-1.63293 19.5177 -1.68093 19.5854 -1.71293 19.6606C-1.74493 19.7357 -1.76293 19.8169 -1.76293 19.8988C-1.76293 19.9808 -1.74493 20.0619 -1.71293 20.1371C-1.68093 20.2123 -1.63293 20.2799 -1.57293 20.3358C-1.44493 20.461 -1.27493 20.5019 -1.10593 20.5019C-0.936927 20.5019 -0.767927 20.461 -0.640927 20.3358L5.92207 14.2024C7.58507 15.6259 9.70207 16.4081 11.8911 16.4077H12.2301C14.6421 16.325 16.8861 15.2842 18.5791 13.5363C19.3881 12.6826 20.0191 11.6758 20.4331 10.5751C20.8471 9.47437 21.0381 8.30197 20.9921 7.12667C20.9071 4.75447 19.8491 2.50667 18.0711 0.883301C14.3891 -2.48737 8.63107 -2.23777 5.20307 1.38323C3.67907 2.98903 2.81607 5.10953 2.78507 7.32283C2.75307 9.53603 3.55607 11.68 5.03307 13.3284ZM18.6481 12.6624C17.2191 14.1646 15.2591 15.0463 13.1871 15.118C11.1161 15.2031 9.09407 14.4704 7.55707 13.0781C4.38307 10.2067 4.21307 5.29537 7.13407 2.21537C8.65807 0.591967 10.7751 -0.240333 12.8911 -0.240333C14.7961 -0.240333 16.7011 0.425033 18.2241 1.79883C19.7481 3.21447 20.6381 5.08747 20.7231 7.16837C20.7691 8.17717 20.6091 9.18487 20.2521 10.1296C19.8961 11.0743 19.3491 11.9362 18.6481 12.6624Z" fill="white" />
                                  </svg> */}
                                  <img style={{width:"20px"}} src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/billing/Search icon.png`} alt="" />
                                </div>
                                <div
                                  onClick={() => setIsSortOpen(!isSortOpen)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {/* <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M3 7H21M3 12H15M3 17H9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                  </svg> */}
                                  <img style={{width:"25px"}} src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/billing/ActiveFilterv2.png`} alt="" />
                                </div>
                              </div>
                            </div>
                            <AnimatePresence>
                              {(isSearchOpen || isSortOpen) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div className="d-flex gap-2 mb-2" style={{ paddingTop: '10px', justifyContent: 'space-between' }}>
                                    {isSearchOpen && (
                                      <div className="position-relative" style={{ width: '60%' }}>
                                        <input
                                          type="text"
                                          className="form-control search-input"
                                          placeholder="Search..."
                                          value={searchQuery}
                                          onChange={(e) => handleSearch(e.target.value)}
                                          autoFocus
                                          style={{
                                            backgroundColor: 'white !important',
                                            border: '1px solid #fff',
                                            color: 'black',
                                            paddingRight: '35px',
                                            height: '40px'
                                          }}
                                        />
                                        <svg
                                          onClick={() => {
                                            setIsSearchOpen(false);
                                            setSearchQuery('');
                                            handleSearch('');
                                          }}
                                          className="position-absolute"
                                          style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                          width="20"
                                          height="20"
                                          viewBox="0 0 20 20"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM7.70711 6.29289C7.31658 5.90237 6.68342 5.90237 6.29289 6.29289C5.90237 6.68342 5.90237 7.31658 6.29289 7.70711L8.58579 10L6.29289 12.2929C5.90237 12.6834 5.90237 13.3166 6.29289 13.7071C6.68342 14.0976 7.31658 14.0976 7.70711 13.7071L10 11.4142L12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L11.4142 10L13.7071 7.70711C14.0976 7.31658 14.0976 6.68342 13.7071 6.29289C13.3166 5.90237 12.6834 5.90237 12.2929 6.29289L10 8.58579L7.70711 6.29289Z" fill="#a7ca11" />
                                        </svg>
                                      </div>
                                    )}
                                    {isSortOpen && (
                                      <div className="position-relative" style={{ width: '40%', marginLeft: 'auto' }}>
                                        <select
                                          value={sortValue}
                                          onChange={(e) => {
                                            setSortValue(e.target.value);
                                            handleDateFilter(e.target.value);
                                          }}
                                          style={{
                                            backgroundColor: 'white',
                                            border: '1px solid #fff',
                                            color: 'black',
                                            height: '40px',
                                            width: '100%',
                                            padding: '0 35px 0 12px',
                                            fontSize: '1rem',
                                            appearance: 'none',
                                            WebkitAppearance: 'none',
                                            MozAppearance: 'none'
                                          }}
                                        >
                                          <option value="all-time">All time</option>
                                          <option value="this-year">This year</option>
                                          <option value="this-month">This month</option>
                                          <option value="last-month">Last month</option>
                                        </select>
                                        <svg
                                          onClick={() => {
                                            setIsSortOpen(false);
                                            setSortValue('all-time');
                                            handleDateFilter('all-time');
                                          }}
                                          className="position-absolute"
                                          style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', pointerEvents: 'auto', zIndex: 10 }}
                                          width="20"
                                          height="20"
                                          viewBox="0 0 20 20"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM7.70711 6.29289C7.31658 5.90237 6.68342 5.90237 6.29289 6.29289C5.90237 6.68342 5.90237 7.31658 6.29289 7.70711L8.58579 10L6.29289 12.2929C5.90237 12.6834 5.90237 13.3166 6.29289 13.7071C6.68342 14.0976 7.31658 14.0976 7.70711 13.7071L10 11.4142L12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L11.4142 10L13.7071 7.70711C14.0976 7.31658 14.0976 6.68342 13.7071 6.29289C13.3166 5.90237 12.6834 5.90237 12.2929 6.29289L10 8.58579L7.70711 6.29289Z" fill="#a7ca11" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <div className="Scroller">
                              {loadingBillings && (
                                <div className="text-center py-4">
                                  <ThreeDot color="#A7CA11" size="medium" text="" textColor="" />
                                </div>
                              )}
                              {billings && billings.length > 0 ? (
                                billings.map((bill, index) => {
                                  const status = (bill.billingStatus || 'Unknown').toLowerCase();
                                  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
                                  
                                  let bgColor = '#6c757d';
                                  let textColor = 'white';
                                  
                                  if (status === 'pending') {
                                    bgColor = '#FFE838';
                                    textColor = 'black';
                                  } else if (status === 'paid') {
                                    bgColor = '#38FF70';
                                    textColor = 'black';
                                  } else if (status === 'refunded') {
                                    bgColor = '#FF3838';
                                    textColor = 'white';
                                  }

                                  return (
                                  <>
                                    <div key={bill.id} className="BillingRow row d-flex my-4">
                                      <div className="col-10 d-flex flex-column align-items-start gap-3">
                                        <div className="w-100">
                                          <p className="date">{formatBillingDate(bill?.billingValidThru?.[0]?.subscription_date || bill?.createdAt)}</p>
                                        </div>

                                        <div><p className="desc">{getBillingDisplayData(bill).packageName}</p></div>

                                        <div><p className="contentRental">Content Rental</p></div>

                                        <div><p className="price">{formatBillingPrice(bill).formatted}</p></div>

                                      </div>
                                      <div className="col-2 d-flex flex-column align-items-end justify-content-between">
                                        <span style={{
                                          backgroundColor: bgColor,
                                          color: textColor,
                                          fontSize: '12px',
                                          fontFamily: 'Poppins',
                                          fontWeight: '400',
                                          borderRadius: '6px',
                                          padding: '4px 12px',
                                          display: 'inline-block',
                                          minWidth: '80px',
                                          textAlign: 'center'
                                        }}>
                                          {normalizedStatus}
                                        </span>
                                        {status !== 'pending' && (
                                          <div
                                            className="chevron-right"
                                            onClick={() => setIsInvoiceModalOpen(bill)}
                                          >
                                            <i className="fa-solid fa-chevron-right"></i>
                                          </div>
                                        )}

                                      </div>




                                    </div>
                                    {index !== billings.length - 1 && <div className="separator"></div>}


                                    {/* <div className="separator"></div> */}

                                  </>
                                )})
                              ) : (
                                !loadingBillings && <p className="no-invoices pb-4">No invoices generated</p>
                              )}
                            </div>

                            {isInvoiceModalOpen && (
                              <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/invoice-logo.png`} alt="ARY PLUS Logo"  />
                                    <span className="close-btn" onClick={() => setIsInvoiceModalOpen(null)}>
                                      <svg style={{ fill: "#000" }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10ZM10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM7.70711 6.29289C7.31658 5.90237 6.68342 5.90237 6.29289 6.29289C5.90237 6.68342 5.90237 7.31658 6.29289 7.70711L8.58579 10L6.29289 12.2929C5.90237 12.6834 5.90237 13.3166 6.29289 13.7071C6.68342 14.0976 7.31658 14.0976 7.70711 13.7071L10 11.4142L12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L11.4142 10L13.7071 7.70711C14.0976 7.31658 14.0976 6.68342 13.7071 6.29289C13.3166 5.90237 12.6834 5.90237 12.2929 6.29289L10 8.58579L7.70711 6.29289Z" fill="black" />
                                      </svg>
                                    </span>
                                  </div>
                                  <div className="modal-body">
                                    <h2>Invoice</h2>
                                    <br />
                                    {isInvoiceModalOpen && (
                                      <>
                                        <p>ARY PLUS</p>
                                        <p>6th Floor Madina City Mall</p>
                                        <p>Abdullah Haroon Rd</p>
                                        <p>Saddar, Karachi 74400</p>
                                        <p><a href="mailto:support@aryplus.com">support@aryplus.com</a></p>
                                        <hr className="modal-divider" />
                                        <p>
                                            {
                                              user?.displayName
                                                ? user.displayName
                                                : isInvoiceModalOpen.billingFullName.includes("@")
                                                  ? isInvoiceModalOpen.billingFullName.split("@")[0]
                                                  : isInvoiceModalOpen.billingFullName
                                            }
                                        </p>

                                        <p>
                                            {isInvoiceModalOpen.billingMeta?.stripeMeta?.email || isInvoiceModalOpen.billingMeta?.payfastMeta?.email || user?.email}
                                          </p>
                                        <hr className="modal-divider" />
                                        <p>Receipt # {isInvoiceModalOpen.invoiceId}</p>
                                        <div className="history-item">
                                          <p>Date</p>
                                          <p>{formatBillingDate(isInvoiceModalOpen.billingValidThru[0]?.subscription_date)}</p>
                                        </div>
                                        {/* Add more bill fields as needed */}
                                      </>
                                    )}
                                    <div className="history-item">
                                      <p>Subscription Period</p>
                                      <p>One-time payment</p>
                                    </div>

                                    <div className="history-item">
                                      <p>Description</p>
                                      <p>{isInvoiceModalOpen?.billingMeta?.stripeMeta?.packageName || isInvoiceModalOpen?.billingMeta?.payfastMeta?.packageName}</p>
                                    </div>

                                    <div className="history-item">
                                      <p>Payment Method</p>
                                      {(() => {
                                        const paymentInfo = getPaymentMethodInfo(isInvoiceModalOpen);
                                        const gateway = paymentInfo.gateway;

                                        if (gateway === "stripe") {
                                          return <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/billing/stripe.png`} alt="stripe" className="gateway-logo" style={{ width: "2.8rem" }} />;
                                        } else if (gateway === "payfast") {
                                          // return <p>PayFast</p>;
                                          return <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/billing/payfast.png`} alt="paypro" className="gateway-logo" />;
                                        } else if (gateway === "sahulat") {
                                          return <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/billing/sahulat-black.png`} alt="sahulat" className="gateway-logo" />;
                                        } else if (gateway === "paypro") {
                                          return <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/billing/paypro.png`} alt="paypro" className="gateway-logo" />;
                                        } else {
                                          return <p>{paymentInfo.displayName}</p>;
                                        }
                                      })()}
                                    </div>

                                    <hr className="modal-divider" />
                                    <div className="history-item">
                                      <p><strong>Total</strong></p>
                                      <p><strong>{formatBillingPrice(isInvoiceModalOpen).formatted}</strong></p>
                                    </div>
                                    {isInvoiceModalOpen.refundMeta && (
                                      <>
                                        <hr className="modal-divider" />
                                        <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
                                          <p style={{ color: '#856404', fontWeight: 'bold', marginBottom: '8px' }}>Refund Information</p>
                                          <div className="history-item" style={{ borderBottom: 'none' }}>
                                            <p style={{ color: '#856404' }}>Refund Amount</p>
                                            <p style={{ color: '#856404' }}>{isInvoiceModalOpen.refundMeta.amount} PKR</p>
                                          </div>
                                          <div className="history-item" style={{ borderBottom: 'none' }}>
                                            <p style={{ color: '#856404' }}>Refund Date</p>
                                            <p style={{ color: '#856404' }}>{formatBillingDate(isInvoiceModalOpen.refundMeta.refundedAt)}</p>
                                          </div>
                                          <div className="history-item" style={{ borderBottom: 'none' }}>
                                            <p style={{ color: '#856404' }}>Reason</p>
                                            <p style={{ color: '#856404' }}>{isInvoiceModalOpen.refundMeta.reason}</p>
                                          </div>
                                          <div className="history-item" style={{ borderBottom: 'none' }}>
                                            <p style={{ color: '#856404' }}>Reference Number</p>
                                            <p style={{ color: '#856404' }}>{isInvoiceModalOpen.refundMeta.refundReferenceNumber}</p>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                    {/* <button className="download-pdf-btn" onClick={() => toast("Todo")}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                                        <path d="M8.00016 1.83398C8.36835 1.83398 8.66683 2.13246 8.66683 2.50065V10.2245L10.8621 8.02925C11.1224 7.7689 11.5446 7.7689 11.8049 8.02925C12.0652 8.2896 12.0652 8.71171 11.8049 8.97205L8.47157 12.3054C8.21122 12.5657 7.78911 12.5657 7.52876 12.3054L4.19542 8.97205C3.93508 8.71171 3.93508 8.2896 4.19542 8.02925C4.45577 7.7689 4.87788 7.7689 5.13823 8.02925L7.3335 10.2245V2.50065C7.3335 2.13246 7.63197 1.83398 8.00016 1.83398Z" fill="white" />
                                        <path d="M2.00016 9.83398C2.36835 9.83398 2.66683 10.1325 2.66683 10.5007V13.1673C2.66683 13.5355 2.96531 13.834 3.3335 13.834H12.6668C13.035 13.834 13.3335 13.5355 13.3335 13.1673V10.5007C13.3335 10.1325 13.632 9.83398 14.0002 9.83398C14.3684 9.83398 14.6668 10.1325 14.6668 10.5007V13.1673C14.6668 14.2719 13.7714 15.1673 12.6668 15.1673H3.3335C2.22893 15.1673 1.3335 14.2719 1.3335 13.1673V10.5007C1.3335 10.1325 1.63197 9.83398 2.00016 9.83398Z" fill="white" />
                                      </svg>
                                      <span className="mx-2">Download PDF</span></button> */}

                                    <button 
                                      className="download-pdf-btn" 
                                      onClick={() => isInvoiceModalOpen.billingStatus?.toLowerCase() === 'refunded' 
                                        ? toast.error('Invoice download is not available for refunded transactions', { id: 'refund-error' }) 
                                        : handleDownload(isInvoiceModalOpen._id)}
                                      style={{ opacity: isInvoiceModalOpen.billingStatus?.toLowerCase() === 'refunded' ? 0.5 : 1, cursor: isInvoiceModalOpen.billingStatus?.toLowerCase() === 'refunded' ? 'not-allowed' : 'pointer' }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                                        <path d="M8.00016 1.83398C8.36835 1.83398 8.66683 2.13246 8.66683 2.50065V10.2245L10.8621 8.02925C11.1224 7.7689 11.5446 7.7689 11.8049 8.02925C12.0652 8.2896 12.0652 8.71171 11.8049 8.97205L8.47157 12.3054C8.21122 12.5657 7.78911 12.5657 7.52876 12.3054L4.19542 8.97205C3.93508 8.71171 3.93508 8.2896 4.19542 8.02925C4.45577 7.7689 4.87788 7.7689 5.13823 8.02925L7.3335 10.2245V2.50065C7.3335 2.13246 7.63197 1.83398 8.00016 1.83398Z" fill="black" />
                                        <path d="M2.00016 9.83398C2.36835 9.83398 2.66683 10.1325 2.66683 10.5007V13.1673C2.66683 13.5355 2.96531 13.834 3.3335 13.834H12.6668C13.035 13.834 13.3335 13.5355 13.3335 13.1673V10.5007C13.3335 10.1325 13.632 9.83398 14.0002 9.83398C14.3684 9.83398 14.6668 10.1325 14.6668 10.5007V13.1673C14.6668 14.2719 13.7714 15.1673 12.6668 15.1673H3.3335C2.22893 15.1673 1.3335 14.2719 1.3335 13.1673V10.5007C1.3335 10.1325 1.63197 9.83398 2.00016 9.83398Z" fill="black" />
                                      </svg>
                                      <span className="mx-2">Download PDF</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* <div className="history-item">
                              <div className="payment-card">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="card-logo" />
                                <span>VISA &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 0345</span>
                              </div>
                              <span>6th July, 2025</span>
                              <span>Membership for 6th July, 2025 - 5th Aug, 2025</span>
                              <span className="amount">USD 9.99/mo</span>
                            </div>
                            <div className="history-item">
                              <div className="payment-card">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="card-logo" />
                                <span>VISA &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 0345</span>
                              </div>
                              <span>6th July, 2025</span>
                              <span>Content rental</span>
                              <span className="amount">USD 9.99/mo</span>
                            </div> */}
                          </div>
                        </div>
                      </div>




                    </Col>
                  </Row>
                </Container>
              </div>
            </motion.div>
          ) : step === 10 ? (
            // STEP 10: WATCH ANALYTICS
            <motion.div
              key="step10"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="get-started-account bg-dark-overlay text-white min-vh-100 d-flex align-items-start py-4">
                <Container>
                  <Row className="justify-content-center align-items-center min-vh-75 py-5 mt-5">
                    <Col
                      lg="8"
                      md="8"
                      sm="12"
                      xs="12"
                      className="d-flex flex-column justify-content-center gap-5 text-left text-md-center"
                    >
                      <p className="text-left d-flex backHeading">
                        <span className="backbtn" onClick={goBack}>
                          <IoIosArrowBack size={"1.2rem"} />
                        </span>
                        Watch Analytics
                      </p>

                      <div>
                        {user?.uid && (
                          <WatchHoursCard userId={user.uid} />
                        )}
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

MyAccountv2.displayName = "MyAccountv2";
export default MyAccountv2;
