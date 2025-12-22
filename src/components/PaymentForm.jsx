import { Row, Col } from "react-bootstrap";
import "./PaymentForm.css";

const PaymentForm = ({
  packageData,
  paymentSuccess,
  multiGatewayEnabled,
  selectedGateway,
  setSelectedGateway,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  sahulatWalletEnabled,
  location,
  isCreatingCheckoutSession,
  isLoadingPayFast,
  handleStripeCheckout,
  handlePKPayment,
  sahulatPhone,
  handlePhoneChange,
  phoneNumberError,
  isLoadingSahulat,
  handleSahulatPayment,
  checkoutSessionError,
  sahulatError,
  imageBase
}) => {
  if (paymentSuccess || !packageData) return null;

  return (
    <div className="payment-form-wrapper mt-5 pt-3">
      <Row className="align-items-stretch">
        <Col md={12} className="p-0">
          <div className="payment-form-container">
            <h5 className="payment-form-title">Mode of Payment</h5>
            <div className="payment-form-encryption">
              <img
                src={`${imageBase}images/payment/encryption-lockv3.png?timestamp=22`}
                alt="Lock"
                className="payment-form-encryption-icon"
              />
              <span className="payment-form-encryption-text">End-to-end encrypted</span>
              
            </div>

            {/* Payment Method Options */}
            <div className="payment-method-options">
              {multiGatewayEnabled ? (
                <>
                  {/* Multi-Gateway UI */}
                  <Row className="g-2">
                    {/* Stripe Option */}
                    <Col xs={12}>
                      <div
                        className={`payment-option ${selectedGateway === 'stripe' ? 'payment-option-selected' : ''}`}
                        onClick={() => setSelectedGateway('stripe')}
                      >
                        <div className="payment-option-left">
                          <div className="payment-option-radio">
                            <img
                              src={selectedGateway === 'stripe'
                                ? `${imageBase}images/billing/selectedv3.png`
                                : `${imageBase}images/billing/unselectedv2.png`
                              }
                              alt="radio button"
                              className="payment-option-radio-img"
                            />
                          </div>
                          <span className="payment-option-label">Stripe</span>
                        </div>
                        <div className="payment-option-right">
                          <img
                            src="https://images.aryzap.com/images/payment/mastercard.png"
                            alt="Mastercard"
                            className="payment-option-card-icon"
                          />
                          <img
                            src="https://images.aryzap.com/images/payment/visav2.png"
                            alt="Visa"
                            className="payment-option-card-icon payment-option-card-icon-last"
                          />
                        </div>
                      </div>
                    </Col>

                    {/* PayFast Option - Only for Pakistan */}
                    {location === "PK" && (
                      <Col xs={12}>
                        <div
                          className={`payment-option ${selectedGateway === 'payfast' ? 'payment-option-selected' : ''}`}
                          onClick={() => setSelectedGateway('payfast')}
                        >
                          <div className="payment-option-left">
                            <div className="payment-option-radio">
                              <img
                                src={selectedGateway === 'payfast'
                                  ? `${imageBase}images/billing/selectedv2.png`
                                  : `${imageBase}images/billing/unselectedv2.png`
                                }
                                alt="radio button"
                                className="payment-option-radio-img"
                              />
                            </div>
                            <span className="payment-option-label">PayFast</span>
                           
                            
                          </div>
                           <div className="payment-option-right">
                              <img
                                src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/billing/HiresPayFastLogo.png`}
                                alt="Visa"
                                className="payment-option-card-icon payment-option-card-icon-last"
                              />
                            </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </>
              ) : (
                <>
                  {/* Original UI */}
                  <Row className="g-2">
                    {/* Credit Card Option */}
                    <Col xs={12}>
                      <div
                        className={`payment-option ${selectedPaymentMethod === 'stripe' ? 'payment-option-selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('stripe')}
                      >
                        <div className="payment-option-left">
                          <div className="payment-option-radio">
                            <img
                              src={selectedPaymentMethod === 'stripe'
                                ? `${imageBase}images/billing/selectedv2.png`
                                : `${imageBase}images/billing/unselectedv2.png`
                              }
                              alt="radio button"
                              className="payment-option-radio-img"
                            />
                          </div>
                          <span className="payment-option-label">Pay Now</span>
                        </div>
                        <div className="payment-option-right">
                          <img
                            src="https://images.aryzap.com/images/payment/mastercard.png"
                            alt="Mastercard"
                            className="payment-option-card-icon"
                          />
                          <img
                            src="https://images.aryzap.com/images/payment/visav2.png"
                            alt="Visa"
                            className="payment-option-card-icon"
                          />
                          <svg className="payment-option-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </Col>

                    {/* Sahulat Wallet Option */}
                    {sahulatWalletEnabled && location === "PK" && (
                      <Col xs={12}>
                        <div
                          className={`payment-option ${selectedPaymentMethod === 'sahulat' ? 'payment-option-selected' : ''}`}
                          onClick={() => setSelectedPaymentMethod('sahulat')}
                        >
                          <div className="payment-option-left">
                            <div className="payment-option-radio">
                              <img
                                src={selectedPaymentMethod === 'sahulat'
                                  ? `${imageBase}images/billing/selectedv2.png`
                                  : `${imageBase}images/billing/unselectedv2.png`
                                }
                                alt="radio button"
                                className="payment-option-radio-img"
                              />
                            </div>
                            <img
                              src={`${imageBase}images/billing/sahulat-wallet.png`}
                              alt="Sahulat Wallet"
                              className="payment-option-sahulat-logo"
                            />
                          </div>
                          <svg className="payment-option-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </Col>
                    )}
                  </Row>
                </>
              )}
            </div>

            {/* Payment Action */}
            {multiGatewayEnabled ? (
              <button
                onClick={selectedGateway === 'stripe' ? handleStripeCheckout : handlePKPayment}
                disabled={isCreatingCheckoutSession || isLoadingPayFast}
                className="btn btn-lg w-100  newbtn payment-form-btn"
              >
                {(isCreatingCheckoutSession || isLoadingPayFast) ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  <span className="paybtn">
                    <span>Pay & Rent</span>
                    <span>
                      <svg className="mx-2" width={window.innerWidth < 768 ? "16" : "22"} height={window.innerWidth < 768 ? "16" : "22"} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                )}
              </button>
            ) : (
              selectedPaymentMethod === 'stripe' && (
                <div>
                  <button
                    onClick={location === "PK" ? handlePKPayment : handleStripeCheckout}
                    disabled={isCreatingCheckoutSession}
                    className="btn btn-lg w-100  newbtn payment-form-btn"
                  >
                    {isCreatingCheckoutSession ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <span className="paybtn">
                        <span>Pay & Rent</span>
                        <span>
                          <svg className="mx-2" width={window.innerWidth < 768 ? "16" : "22"} height={window.innerWidth < 768 ? "16" : "22"} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18l6-6-6-6" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </span>
                    )}
                  </button>
                </div>
              )
            )}

            {selectedPaymentMethod === 'sahulat' && sahulatWalletEnabled && location === "PK" && (
              <div>
                <form onSubmit={(e) => { e.preventDefault(); handleSahulatPayment(); }} className="w-100">
                  <div className="payment-form-phone-group">
                    <label className="payment-form-phone-label">Phone Number</label>
                    <input
                      type="tel"
                      className={`payment-form-phone-input ${phoneNumberError ? 'payment-form-phone-input-error' : ''}`}
                      placeholder="Enter your phone number"
                      value={sahulatPhone}
                      onChange={handlePhoneChange}
                      required
                    />
                    {phoneNumberError && (
                      <small className="payment-form-phone-error">{phoneNumberError}</small>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoadingSahulat || !!phoneNumberError || !sahulatPhone.trim()}
                    className="btn btn-lg w-100  newbtn payment-form-btn"
                  >
                    {isLoadingSahulat ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <span className="paybtn">
                        <span>Pay & Rent</span>
                        <span>
                          <svg className="mx-2" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.04289 6.29289C9.43342 5.90237 10.0666 5.90237 10.4571 6.29289L15.9571 11.7929C16.3476 12.1834 16.3476 12.8166 15.9571 13.2071L10.4571 18.7071C10.0666 19.0976 9.43342 19.0976 9.04289 18.7071C8.65237 18.3166 8.65237 17.6834 9.04289 17.2929L13.8358 12.5L9.04289 7.70711C8.65237 7.31658 8.65237 6.68342 9.04289 6.29289Z" fill="white" strokeWidth={3} />
                          </svg>
                        </span>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {(checkoutSessionError || sahulatError) && (
              <div className="payment-form-error">
                <small>{checkoutSessionError || sahulatError}</small>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentForm;
