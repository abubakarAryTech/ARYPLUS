import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { createKeyHandler } from '../../utils/tizenRemote';
import playBtnIcon from '../../assets/icons/play-btn.svg';
import moreInfoBtnIcon from '../../assets/icons/more-info-btn.svg';

const HeroSlider = ({ focusMode, onFocusChange, Slider = "Slider" }) => {
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buttonFocus, setButtonFocus] = useState(0); // 0: play, 1: more info, 2: prev, 3: next

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await api.get(`/api/v2/homev2/v2/${import.meta.env.VITE_BUILDER_ID}/PK`);
        const homeData = response.data.home?.homeData;
        const section = homeData?.find(section => section.name === Slider);
        if (section && section.data && section.data.slider && section.data.slider.sliderData) {
          setSlides(section.data.slider.sliderData.slice(0, 4));
        }
      } catch (error) {
        console.error("Hero Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, [Slider]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (focusMode !== 'hero') return;

    const handleKeyDown = createKeyHandler({
      ArrowLeft: (e) => {
        e.preventDefault();
        if (buttonFocus === 2 || buttonFocus === 3) {
          // Navigate between nav buttons
          setButtonFocus(buttonFocus === 2 ? 3 : 2);
        } else {
          // Navigate between action buttons
          setButtonFocus(buttonFocus === 0 ? 1 : 0);
        }
      },
      ArrowRight: (e) => {
        e.preventDefault();
        if (buttonFocus === 2 || buttonFocus === 3) {
          // Navigate between nav buttons
          setButtonFocus(buttonFocus === 2 ? 3 : 2);
        } else {
          // Navigate between action buttons
          setButtonFocus(buttonFocus === 0 ? 1 : 0);
        }
      },
      ArrowUp: (e) => {
        e.preventDefault();
        if (buttonFocus < 2) {
          // Move to nav buttons
          setButtonFocus(2);
        }
      },
      ArrowDown: (e) => {
        e.preventDefault();
        if (buttonFocus >= 2) {
          // Move to action buttons
          setButtonFocus(0);
        } else {
          // Exit to next section
          console.log('HeroSlider: ArrowDown pressed, calling onFocusChange with top10');
          onFocusChange?.('top10');
        }
      },
      Enter: (e) => {
        e.preventDefault();
        if (buttonFocus === 0) {
          console.log('Play button pressed');
        } else if (buttonFocus === 1) {
          console.log('More info button pressed');
        } else if (buttonFocus === 2) {
          setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
        } else if (buttonFocus === 3) {
          setActiveSlide(prev => (prev + 1) % slides.length);
        }
      }
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, activeSlide, slides, onFocusChange, buttonFocus]);

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  if (loading || slides.length === 0) return <div className="hero-loader" />;

  const current = slides[activeSlide]?.data || slides[activeSlide];

  return (
    <section className={`hero-slider ${focusMode === 'hero' ? 'focused' : ''}`}>
      {/* Background Image */}
      <div className="hero-bg">
        <img 
          src={current.imageCoverDesktop?.includes("https://") 
            ? current.imageCoverDesktop 
            : `${import.meta.env.VITE_APP_IMAGE_PATH}${current.imageCoverDesktop}`} 
          alt={current.title} 
        />
        <div className="hero-overlay-gradient"></div>
        <div className="hero-left-fade"></div>
      </div>

      {/* Content Overlay */}
      <div className="hero-content">
        <h1 className="hero-logo-text">{current.title}</h1>
        
        <div className="hero-meta">
          <span>{current.ageRating || 'G'}</span>
          <span className="separator">|</span>
          <span>{current.genreId?.join(', ') || 'Drama'}</span>
          <span className="separator">|</span>
          <span>{current.episodeCount || 0} Episodes</span>
        </div>

        <p className="hero-description">
          {current.description || "A mythic and emotionally charged hero's journey..."}
        </p>

        <div className="hero-actions">
          <button className={`btn-play ${buttonFocus === 0 ? 'focused' : ''}`}>
            <img src={playBtnIcon} alt="Play" className="play-icon" />
          </button>
          <div className="more-info-container">
            <button className={`btn-more ${buttonFocus === 1 ? 'focused' : ''}`}>
              <img src={moreInfoBtnIcon} alt="More info" className="info-icon" />
            </button>
            <span className="more-info-text">More info</span>
          </div>
          
          <div className="hero-nav-arrows">
            <button className={`nav-arrow ${buttonFocus === 2 ? 'focused' : ''}`} onClick={prevSlide}>‹</button>
            <button className={`nav-arrow ${buttonFocus === 3 ? 'focused' : ''}`} onClick={nextSlide}>›</button>
          </div>
        </div>
      </div>

      {/* Slide Indicators (the dots at bottom) */}
      <div className="hero-indicators">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${idx === activeSlide ? 'active' : ''}`} 
            onClick={() => setActiveSlide(idx)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;