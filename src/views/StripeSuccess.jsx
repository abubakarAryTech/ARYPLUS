import React, { useEffect } from 'react';
import logger from '../services/logger';

const StripeSuccess = () => {
  useEffect(() => {
    logger.log('Stripe Success page loaded');

    // Extract session ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    logger.log('Session ID from URL:', sessionId);

    // Send success message to parent window
    const sendSuccessMessage = () => {
      try {
        if (window.opener && !window.opener.closed) {
          logger.log('Sending success message to parent window');
          window.opener.postMessage({
            type: 'stripe_checkout_success',
            sessionId: sessionId,
            timestamp: new Date().toISOString()
          }, window.opener.location.origin);

          // Close the window after a short delay
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          logger.log('No opener window found, redirecting to TVOD page');
          // Store session ID for status check
          try {
            sessionStorage.setItem('pendingStripeSession', sessionId);
          } catch (_) {}
          
          // Try to extract series ID from URL or use a fallback
          const urlParams = new URLSearchParams(window.location.search);
          const seriesId = urlParams.get('seriesId');
          
          if (seriesId) {
            // Redirect to specific TVOD page with success parameter
            const mainUrl = `${window.location.origin}/tvod/${seriesId}?paymentStatus=success&sessionId=${sessionId}`;
            window.location.href = mainUrl;
          } else {
            // Fallback: redirect to home with success parameter
            const mainUrl = `${window.location.origin}/?paymentStatus=success&sessionId=${sessionId}`;
            window.location.href = mainUrl;
          }
        }
      } catch (error) {
        logger.error('Error sending success message:', error);
        // Fallback: try to close window or redirect
        try {
          window.close();
        } catch (closeError) {
          window.location.href = `${window.location.origin}/?paymentStatus=success`;
        }
      }
    };

    // Send message immediately and also after a short delay
    sendSuccessMessage();

    const timeoutId = setTimeout(sendSuccessMessage, 500);

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
          backgroundColor: '#22c55e',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
          </svg>
        </div>

        <h2 style={{
          color: '#1f2937',
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Payment Successful!
        </h2>

        <p style={{
          color: '#6b7280',
          marginBottom: '20px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Your payment has been processed successfully. This window will close automatically.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #d1d5db',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          Processing...
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StripeSuccess;