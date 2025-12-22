import React, { memo, useState, useEffect } from 'react';

const ARYZAPLoader = memo(() => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  const loadingTexts = [
    "Loading your entertainment...",
    "Preparing premium content...",
    "Setting up your experience...",
    "Almost ready to stream..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(31, 31, 31, 1);',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px'
      }}>
        <div style={{
          position: 'relative',
          width: '100px',
          height: '100px'
        }}>
          <img 
            src="https://images.aryzap.com/images/figma-icons/loaderimgv2.png"
            alt="ARY PLUS Logo"
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              animation: 'aryzap-logo-pulse 2s ease-in-out infinite'
            }}
          />
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            border: '2px solid transparent',
            borderTop: '2px solid rgba(255, 255, 255, 0.7)',
            borderRight: '2px solid rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            animation: 'aryzap-rotate 2s linear infinite'
          }}></div>
        </div>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '700',
            fontFamily: 'Poppins',
            marginBottom: '16px',
            letterSpacing: '1px'
          }}>
            ARY PLUS
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            fontWeight: '400',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '0.5px',
            minHeight: '20px',
            animation: 'aryzap-text-fade 1.5s ease-in-out infinite'
          }}>
            {loadingTexts[currentTextIndex]}
          </div>
        </div>
      </div>
    </div>
  );
});

ARYZAPLoader.displayName = 'ARYZAPLoader';
export default ARYZAPLoader;
