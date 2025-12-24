import React from 'react';

const HomeHeroSlider = ({ list = [], favorites = [], user = null }) => {
  return (
    <div className="hero-slider">
      {/* Placeholder for hero slider */}
      <div className="hero-content">
        <h2 style={{ fontSize: '1.5rem' }}>Welcome to ARY Plus</h2>
        <p>Your entertainment destination</p>
      </div>
    </div>
  );
};

export default HomeHeroSlider;