import React, { useState, useEffect } from 'react';
import { createKeyHandler } from '../utils/tizenRemote';

const Top10Picks = ({ focusMode, onFocusChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerView = 4;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}api/homev2/v2/669f5e353fe1bf91a6a4e273/PK`)
      .then(resp => resp.json())
      .then(result => {
        const top10Section = result.home.homeData.find(section => section.name === "TOP 10 PICKS");
        if (top10Section && top10Section.data && top10Section.data.series) {
          setMovies(top10Section.data.series.slice(0, 10));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (focusMode !== 'top10') return;

    const handleKeyDown = createKeyHandler({
      ArrowRight: (e) => {
        e.preventDefault();
        if (focusedIndex < movies.length - 1) {
          const newIndex = focusedIndex + 1;
          setFocusedIndex(newIndex);
          if (newIndex >= currentIndex + itemsPerView) {
            setCurrentIndex(currentIndex + 1);
          }
        }
      },
      ArrowLeft: (e) => {
        e.preventDefault();
        if (focusedIndex > 0) {
          const newIndex = focusedIndex - 1;
          setFocusedIndex(newIndex);
          if (newIndex < currentIndex) {
            setCurrentIndex(currentIndex - 1);
          }
        }
      },
      ArrowUp: (e) => {
        e.preventDefault();
        onFocusChange?.('hero');
      },
      ArrowDown: (e) => {
        e.preventDefault();
        onFocusChange?.('dramas');
      },
      Enter: (e) => {
        e.preventDefault();
        console.log('Selected top10 movie:', movies[focusedIndex]?.title);
      }
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, focusedIndex, currentIndex, movies, itemsPerView, onFocusChange]);

  const nextSlide = () => {
    if (currentIndex < movies.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="top10-container">
      <h2 className="top10-title">Top 10 Picks</h2>
      <div className="top10-slider">
        <button className="top10-nav prev" onClick={prevSlide}>‹</button>
        <div className="top10-list" style={{ transform: `translateX(-${currentIndex * 295}px)` }}>
          {movies.map((movie, index) => (
            <div 
              key={movie._id} 
              className={`top10-item ${focusMode === 'top10' && focusedIndex === index ? 'focused' : ''}`}
            >
              <div className="top10-rank">{index + 1}</div>
              <div className="top10-poster-wrapper">
                <img 
                  src={movie.imagePoster.includes("https://") 
                    ? movie.imagePoster 
                    : `${import.meta.env.VITE_APP_IMAGE_PATH}${movie.imagePoster}`
                  } 
                  alt={`Top ${index + 1} - ${movie.title}`} 
                  className="top10-poster" 
                />
              </div>
            </div>
          ))}
        </div>
        <button className="top10-nav next" onClick={nextSlide}>›</button>
      </div>
    </section>
  );
};

export default Top10Picks;