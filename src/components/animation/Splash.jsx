import React from 'react';

const Splash = () => {
  return (
    <div className="splash-screen" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff'
    }}>
      <div className="splash-content">
        <h1>ARY Plus</h1>
        <div className="loading-spinner">Loading...</div>
      </div>
    </div>
  );
};

export default Splash;