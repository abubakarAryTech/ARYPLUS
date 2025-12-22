import React, { memo, Fragment, useState, useEffect } from "react";

// react-bootstrap
import { Container, Row, Col, Nav, Tab, Form, Table } from "react-bootstrap";

// react-router
import { Link, useNavigate } from "react-router-dom";

// components
import CustomButton from "../../components/CustomButton";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";

import { cast } from "../../StaticData/data";

import CastCard from "../../components/cards/CastCard";

import {
  get_user_sessions,
  logout,
  get_account_details,
  deleteaccount,
  UpdateUserData,
} from "../../firebase";
import { useAuthStore } from "../../stores/useAuthStore";

import { geners } from "../../StaticData/data";
import GenersCard from "../../components/cards/GanresCard";

import SessionsSection from "../ExtraPages/AboutSections/SessionsSection";
import Loader from "../../components/ReactLoader";

import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";

import FeedbackComponent from "../../components/FeedbackComponent";

const MyAccount = memo(() => {
  const [sessions, setSessions] = useState([]);
  const [accountDetails, setaccountDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("ARY PLUS - My Account");
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    const fetchUserSessions = async () => {
      setIsLoading(true);
      const userSessions = await get_user_sessions();
      setSessions(userSessions);

      setIsLoading(false);
    };
    // fetchUserSessions();

    const fetchAccountDetails = async () => {
      const account_details = await get_account_details();
      setaccountDetails(account_details);
    };
    fetchAccountDetails();
  }, [isAuthenticated, navigate]);
  const formatDate = (timestamp) => {
    // Assuming `timestamp` is a Firebase Firestore `Timestamp`
    const date = timestamp.toDate(); // Convert Firebase Timestamp to Date
    return date.toLocaleString(); // Format as a localized string
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p>Are you sure you want to delete your account?</p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <button
              onClick={() => {
                deleteAccount()
                  .then(() => {
                    toast.dismiss(t.id); // Dismiss the confirmation toast
                    // toast.success('Account deleted successfully!');
                    navigate("/");
                  })
                  .catch((error) => {
                    toast.dismiss(t.id); // Dismiss the confirmation toast
                    toast.error(
                      `Error: ${error.message || "Failed to delete account"}`,
                    );
                  });
              }}
              style={{
                color: "white",
                backgroundColor: "red",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
              }}
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                color: "white",
                backgroundColor: "gray",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
              }}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        },
      },
    );
  };

  const deleteAccount = () => {
    return new Promise((resolve, reject) => {
      // Simulate a deletion request, use your actual deletion logic here
      deleteaccount() // Replace with your actual function
        .then(() => {
          resolve(); // Resolve on success
        })
        .catch((error) => {
          reject(error); // Reject on failure with error message
        });
    });
  };

  const handleUserUpdate = async (event) => {
    event.preventDefault();
    // Get form data
    const formData = new FormData(event.target);
    // Validate all fields
    const displayName = formData.get("display-name");
    const phone = formData.get("phone");
    const dateOfBirth = formData.get("dateofBirth");
    const email = event.target
      .querySelector('input[name="email"]')
      .getAttribute("data-email");

    if (displayName && phone && dateOfBirth && email) {
      const updateSuccessful = await UpdateUserData(
        email,
        displayName,
        phone,
        dateOfBirth,
      );

      if (updateSuccessful) {
        toast.success("Account Updated!");
      } else {
        toast.error("Failed to update account. Please try again.");
      }
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <Fragment>
      {isLoading == false ? (
        <Helmet>
          <title>{`${title}`}</title>
        </Helmet>
      ) : null}
      <BreadCrumbWidget title="My Account" />

      {isLoading && <Loader />}
      <div className="section-padding service-details">
        <Container>
          <Toaster />
          <Tab.Container defaultActiveKey="five">
            <Row>
              <Col md="4" lg="3">
                <div className="acc-left-menu p-4 mb-5 mb-lg-0 mb-md-0">
                  <div className="product-menu">
                    <Nav
                      as="ul"
                      variant="tabs"
                      className="list-inline m-0 nav-tabs flex-column bg-transparent border-0"
                      id="nav-tab"
                      role="tablist"
                    >
                      <Nav.Item as="li" className="py-3">
                        <Nav.Link
                          eventKey="five"
                          className="p-0 bg-transparent"
                        >
                          <i className="fas fa-user"></i>
                          <span className="ms-2">Account details</span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item as="li" className="py-3">
                        <Nav.Link
                          eventKey="feedback"
                          className="p-0 bg-transparent"
                        >
                          <i className="fas fa-pen"></i>
                          <span className="ms-2">Write Feedback</span>
                        </Nav.Link>
                      </Nav.Item>
                      {/* <Nav.Item as="li" className="py-3">
                                        <Nav.Link eventKey="sixth" className="p-0 bg-transparent">
                                            <i className="fas fa-house-laptop"></i><span className="ms-2">Linked Devices</span>
                                        </Nav.Link>
                                    </Nav.Item> */}
                      <Nav.Item as="li" className="py-3">
                        <Nav.Link
                          eventKey="delete"
                          className="p-0 bg-transparent"
                        >
                          <i className="fa-solid fa-trash"></i>
                          <span className="ms-2">Delete Account</span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item as="li" className="pt-3">
                        <Nav.Link
                          eventKey="logout"
                          className="p-0 bg-transparent"
                        >
                          <i className="fas fa-sign-out-alt"></i>
                          <span className="ms-2">Logout</span>
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>
                </div>
              </Col>
              <Col lg="9" md="8">
                <Tab.Content>
                  <Tab.Pane className=" fade" eventKey="five">
                    <form onSubmit={handleUserUpdate}>
                      {/* <div className="form-group mb-5">
                                        <label className="mb-2">Full Name&nbsp; <span className="text-danger">*</span></label>
                                        <input type="text" name="first-name" defaultValue={accountDetails.name} className="form-control" required="required" />
                                    </div> */}
                      {/* <div className="form-group mb-5">
                                        <label className="mb-2">Last name&nbsp; <span className="text-danger">*</span></label>
                                        <input type="text" name="last-name" defaultValue="Abbas" className="form-control" required="required" />
                                    </div> */}
                      <div className="form-group mb-5">
                        <label className="mb-2">
                          Full Name&nbsp; <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="display-name"
                          defaultValue={accountDetails?.name}
                          className="form-control"
                          required="required"
                        />
                      </div>
                      {/* <em className="d-block mb-5">This will be how your name will be displayed in the account
                                        section and in reviews</em> */}
                      <div className="form-group mb-5">
                        <label className="mb-2">
                          Email Address&nbsp;{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          disabled
                          name="email"
                          defaultValue={accountDetails?.email}
                          className="form-control"
                          required="required"
                          data-email={accountDetails?.email}
                        />
                      </div>
                      <div className="form-group mb-5">
                        <label className="mb-2">
                          Phone Number&nbsp;{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          defaultValue={accountDetails?.phoneNumber}
                          className="form-control"
                          required="required"
                        />
                      </div>
                      <div className="form-group mb-5">
                        <label className="mb-2">
                          Date of Birth&nbsp;{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          defaultValue={accountDetails?.dateOfBirth}
                          name="dateofBirth"
                          className="form-control"
                        />
                      </div>
                      {/* <div className="form-group mb-5">
                                        <label className="mb-2">Plan&nbsp; <span className="text-danger">*</span></label>
                                        <input type="text" disabled name="plan" defaultValue={accountDetails.plan}className="form-control" required="required" />
                                    </div> */}
                      <div className="form-group">
                        <div className="iq-button">
                          <button
                            type="submit"
                            className="btn text-uppercase position-relative"
                          >
                            <span className="button-text">Update Changes</span>
                            <i className="fa-solid fa-play"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </Tab.Pane>
                  {/* <Tab.Pane className=" fade" eventKey="sixth"> 
                                    <SessionsSection data={sessions}></SessionsSection>
                                </Tab.Pane> */}
                  <Tab.Pane
                    className=" fade"
                    id="nav-review"
                    eventKey="feedback"
                    role="tabpanel"
                    aria-labelledby="nav-review-tab"
                  >
                    <FeedbackComponent />
                  </Tab.Pane>
                  <Tab.Pane className=" fade" eventKey="delete">
                    <Toaster />
                    <div className="form-group">
                      <div className="iq-button">
                        {/* Change from Link to a button */}
                        <button
                          onClick={() => handleDelete()}
                          className="btn text-uppercase position-relative"
                        >
                          <span className="button-text">Delete Account</span>
                          <i className="fa-solid fa-play"></i>
                        </button>
                      </div>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane className=" fade" eventKey="logout">
                    <div className="form-group">
                      <div className="iq-button">
                        <Link
                          onClick={() => handleLogout()}
                          className="btn text-uppercase position-relative"
                        >
                          <span className="button-text">Logout</span>
                          <i className="fa-solid fa-play"></i>
                        </Link>
                      </div>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Container>
      </div>
    </Fragment>
  );
});

MyAccount.displayName = "MyAccount";
export default MyAccount;
