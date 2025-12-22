import React, { useEffect } from 'react';
import logger from '../services/logger';

const StripeCancel = () => {
  useEffect(() => {
    logger.log('Stripe Cancel page loaded');

    // Send cancel message to parent window
    const sendCancelMessage = () => {
      try {
        if (window.opener && !window.opener.closed) {
          logger.log('Sending cancel message to parent window');
          window.opener.postMessage({
            type: 'stripe_checkout_cancel',
            timestamp: new Date().toISOString()
          }, window.opener.location.origin);

          // Close the window after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          logger.log('No opener window found, redirecting to TVOD page');
          // Fallback: redirect to main page with cancel parameter
          window.location.href = `${window.location.origin}/?paymentStatus=cancelled`;
        }
      } catch (error) {
        logger.error('Error sending cancel message:', error);
        // Fallback: try to close window or redirect
        try {
          window.close();
        } catch (closeError) {
          window.location.href = `${window.location.origin}/?paymentStatus=cancelled`;
        }
      }
    };

    // Send message immediately and also after a short delay
    sendCancelMessage();

    const timeoutId = setTimeout(sendCancelMessage, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 style={{
          color: '#1f2937',
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Payment Cancelled
        </h2>

        <p style={{
          color: '#6b7280',
          marginBottom: '20px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <p style={{
          color: '#6b7280',
          fontSize: '14px'
        }}>
          This window will close automatically.
        </p>
      </div>
    </div>
  );
};

export default StripeCancel;