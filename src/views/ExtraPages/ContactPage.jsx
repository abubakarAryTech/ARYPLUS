import { memo, Fragment, useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import logger from '../../services/logger';

// react-bootstrap
import { Container, Row, Col, Form } from "react-bootstrap";
import BreadcrumbWidget from "../../components/BreadcrumbWidget";

const ContactPage = memo(() => {
  // / State for input values
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    message: "",
  });

  // Handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Validation functions
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const isValidPhone = (phone) => {
      const phoneRegex = /^\d{10,15}$/;
      return phoneRegex.test(phone.replace(/[\s-]/g, "")); // Remove spaces or dashes for validation
    };

    // Check if all fields are filled and valid
    const { firstName, lastName, phoneNumber, email, message } = formData;
    let isValid = true;
    let errorMessage = "";

    if (!firstName.trim()) {
      isValid = false;
      errorMessage = "First name is required.";
    } else if (!phoneNumber.trim()) {
      isValid = false;
      errorMessage = "Phone number is required.";
    } else if (!isValidPhone(phoneNumber)) {
      isValid = false;
      errorMessage = "Please enter a valid phone number (10-15 digits).";
    } else if (!email.trim()) {
      isValid = false;
      errorMessage = "Email is required.";
    } else if (!isValidEmail(email)) {
      isValid = false;
      errorMessage = "Please enter a valid email address.";
    } else if (!message.trim()) {
      isValid = false;
      errorMessage = "Message is required.";
    }

    if (!isValid) {
      toast.error(errorMessage); // Show error toast
      return;
    }

    // Send data to backend API
    const payload = {
      firstName,
      ...(lastName.trim() && { lastName }),
      phoneNumber,
      email,
      message,
    };

    // Logging the API endpoint and headers
    const apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/contact`;
    const token = import.meta.env.VITE_AUTH_TOKEN;

    axios.post(
      apiUrl,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        // Handle success response
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          message: "",
        });
        toast.success("Your query has been sent successfully!");
      })
      .catch((error) => {
        // Log error details for debugging
        logger.error("API Error:", error.response || error);
        if (error.response) {
          toast.error(`"Failed to send your query. Please try again later."}`);
        } else {
          toast.error("Network error. Please check your connection.");
        }
      });
  };

  return (
    <Fragment>
      <BreadcrumbWidget title="Contact Us" />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="section-padding paddingLeftRight">
        <Container>
          <Row>
            <Col lg="8">
              <Form className="mb-5 mb-lg-0" onSubmit={handleSubmit}>
                <Row>
                  <Col md="6" className="mb-4 mb-lg-5">
                    <input
                      type="text"
                      className="me-2 transparent-input form-control"
                      placeholder="Your Name*"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required=""
                    />
                  </Col>
                  <Col md="6" className="mb-4 mb-lg-5">
                    <input
                      type="text"
                      className="me-2 transparent-input form-control"
                      placeholder="Last Name*"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col md="6" className="mb-4 mb-lg-5">
                    <input
                      type="tel"
                      className="me-2 transparent-input form-control"
                      placeholder="Phone Number*"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col md="6" className="mb-4 mb-lg-5">
                    <input
                      type="email"
                      className="me-2 transparent-input form-control"
                      placeholder="Your Email*"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col md="12" className="mb-4 mb-lg-5">
                    <textarea
                      className="me-2 transparent-input form-control"
                      cols="40"
                      rows="10"
                      placeholder="Your Message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                  </Col>
                  <Col>
                    <div className="iq-button">
                      <button type="submit" className="btn newbtn">
                        Send Message
                      </button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col lg="4">
              <div className="border-bottom pb-4 mb-4">
                <h5 className="mb-4">Get In Touch</h5>
                <Link to="mailto:support@aryplus.com" className="text-white">
                  support@aryplus.com
                </Link>
              </div>
              <div>
                <h5>Follow Us</h5>
                <ul className="p-0 m-0 mt-4 list-unstyled widget_social_media">
                  <li className="">
                    <Link
                      to="https://www.facebook.com/aryzappk/"
                      className="position-relative"
                    >
                      <img
                        src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/footer/facebook.svg`}
                        loading="lazy"
                        alt="Facebook"
                      />
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="https://twitter.com/aryzapofficial"
                      className="position-relative"
                    >
                      <img
                        src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/footer/twitter.svg`}
                        loading="lazy"
                        alt="Twitter"
                      />
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="https://www.instagram.com/officialaryzap/"
                      className="position-relative"
                    >
                      <img
                        src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/footer/instagram.svg`}
                        loading="lazy"
                        alt="Instagram"
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="map">
        <Container fluid className="p-0">
          {/* Map Placeholder */}
        </Container>
      </div>
    </Fragment>
  );
});

ContactPage.displayName = "ContactPage";
export default ContactPage;
