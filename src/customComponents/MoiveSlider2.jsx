import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import api from '../services/api';
import { createKeyHandler } from '../utils/tizenRemote';

const MovieSlider2 = ({ focusMode, onFocusChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerView = 4;

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        const response = await api.get(`/api/homev2/v2/${import.meta.env.VITE_BUILDER_ID}/PK`);
        const homeData = response.data.home?.homeData;
        const dramaSection = homeData?.find(section => section.name === "TELEFILMS");
        if (dramaSection && dramaSection.data && dramaSection.data.series) {
          setMovies(dramaSection.data.series.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, []);

  useEffect(() => {
    if (focusMode !== 'movieSlider') return;

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
        onFocusChange?.('top10');
      },
      ArrowDown: (e) => {
        e.preventDefault();
        // Navigate to next section if exists
      },
      Enter: (e) => {
        e.preventDefault();
        console.log('Selected movie:', movies[focusedIndex]?.title);
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
      <h2 className="top10-title">Telefilms</h2>
      <div className="top10-slider">
        <button className="top10-nav prev" onClick={prevSlide}>‹</button>
        <div className="movie-slider-list" style={{ transform: `translateX(-${currentIndex * 230}px)`, paddingLeft: '60px' }}>
          {movies.map((movie, index) => (
            <div 
              key={movie._id} 
              className={`movie-slider-item ${focusMode === 'movieSlider' && focusedIndex === index ? 'focused' : ''}`}
            >
              <MovieCard movie={{
                id: movie._id,
                title: movie.title,
                img: movie.imagePoster.includes("https://") 
                  ? movie.imagePoster 
                  : `${import.meta.env.VITE_APP_IMAGE_PATH}${movie.imagePoster}`,
                episodes: `${movie.episodeCount} Episodes`,
                year: movie.ageRating || 'G',
                tags: movie.genreId?.join(' | ') || 'Drama'
              }} />
            </div>
          ))}
        </div>
        <button className="top10-nav next" onClick={nextSlide}>›</button>
      </div>
    </section>
  );
};

export default MovieSlider2;