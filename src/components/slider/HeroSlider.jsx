import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { createKeyHandler } from '../../utils/tizenRemote';
import playBtnIcon from '../../assets/icons/play-btn.svg';
import moreInfoBtnIcon from '../../assets/icons/more-info-btn.svg';
import addIcon from '../../assets/icons/Add.svg';
import informationIcon from '../../assets/icons/information.svg';

const HeroSlider = ({ focusMode, onFocusChange, sectionFocus, Slider = "Slider" }) => {
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buttonFocus, setButtonFocus] = useState(0); // 0: play, 1: add to list, 2: more info, 3: prev, 4: next

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
    if (sectionFocus !== 'hero') return;

    const handleKeyDown = createKeyHandler({
      ArrowLeft: (e) => {
        e.preventDefault();
        setButtonFocus(buttonFocus === 0 ? 4 : buttonFocus - 1);
      },
      ArrowRight: (e) => {
        e.preventDefault();
        setButtonFocus(buttonFocus === 4 ? 0 : buttonFocus + 1);
      },
      ArrowUp: (e) => {
        e.preventDefault();
        // Hero is the first section, so no up navigation
      },
      ArrowDown: (e) => {
        e.preventDefault();
        console.log('HeroSlider: ArrowDown pressed, calling onFocusChange with top10');
        onFocusChange?.('top10');
        // Scroll to next section
        setTimeout(() => {
          const nextSection = document.querySelector('.top10-container');
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      Enter: (e) => {
        e.preventDefault();
        if (buttonFocus === 0) {
          console.log('Play button pressed');
        } else if (buttonFocus === 1) {
          console.log('Add to list button pressed');
        } else if (buttonFocus === 2) {
          console.log('More info button pressed');
        } else if (buttonFocus === 3) {
          setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
        } else if (buttonFocus === 4) {
          setActiveSlide(prev => (prev + 1) % slides.length);
        }
      }
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sectionFocus, activeSlide, slides, onFocusChange, buttonFocus]);

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
        <div className="hero-text-content">
          {current.logo ? (
            <img 
              src={current.logo.includes("https://") 
                ? current.logo 
                : `${import.meta.env.VITE_APP_IMAGE_PATH}${current.logo}`} 
              alt={current.title}
              className="hero-logo-image"
            />
          ) : (
            <h1 className="hero-logo-text">{current.title}</h1>
          )}
          
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
        </div>

        <div className="hero-actions">
          <div className="main-actions">
            <div className="play-button-container">
              <button className={`btn-play ${buttonFocus === 0 ? 'focused' : ''}`}>
                <img src={playBtnIcon} alt="Play" className="play-icon" />
              </button>
              <span className="watch-now-text">Watch Now</span>
            </div>
            <div className="add-to-list-container">
              <button className={`btn-add ${buttonFocus === 1 ? 'focused' : ''}`}>
                <img src={addIcon} alt="Add" className="add-icon" />
              </button>
              <span className="add-to-list-text">Add to List</span>
            </div>
            <div className="more-info-container">
              <button className={`btn-more ${buttonFocus === 2 ? 'focused' : ''}`}>
                <img src={informationIcon} alt="More info" className="info-icon" />
              </button>
              <span className="more-info-text">More info</span>
            </div>
          </div>
          
          <div className="hero-nav-arrows">
            <button className={`nav-arrow ${buttonFocus === 3 ? 'focused' : ''}`} onClick={prevSlide}>‹</button>
            <button className={`nav-arrow ${buttonFocus === 4 ? 'focused' : ''}`} onClick={nextSlide}>›</button>
          </div>
        </div>
      </div>

      <div className="hero-bottom-fade"></div>

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