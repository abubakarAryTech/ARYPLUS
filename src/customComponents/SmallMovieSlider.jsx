import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import api from '../services/api';
import { createKeyHandler } from '../utils/tizenRemote';

const SmallMovieSlider = ({ focusMode, onFocusChange, sectionName = "DRAMAS", title = "Featured Movies", sectionId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerView = 6;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get(`/api/homev2/v2/${import.meta.env.VITE_BUILDER_ID}/PK`);
        const homeData = response.data.home?.homeData;
        const section = homeData?.find(section => section.name === sectionName);
        if (section && section.data && section.data.series) {
          setMovies(section.data.series.slice(0, 10));
        }
      } catch (error) {
        console.error(`Error fetching ${sectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [sectionName]);

  useEffect(() => {
    if (focusMode !== sectionId) return;

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
        const sections = ['popular', 'top10', 'dramas', 'telefilms', 'tvshows', 'sports', 'podcasts', 'ost'];
        const currentIndex = sections.indexOf(sectionId);
        if (currentIndex > 0) {
          onFocusChange?.(sections[currentIndex - 1]);
        }
      },
      ArrowDown: (e) => {
        e.preventDefault();
        const sections = ['popular', 'top10', 'dramas', 'telefilms', 'tvshows', 'sports', 'podcasts', 'ost'];
        const currentIndex = sections.indexOf(sectionId);
        if (currentIndex < sections.length - 1) {
          onFocusChange?.(sections[currentIndex + 1]);
        }
      },
      Enter: (e) => {
        e.preventDefault();
        console.log('Selected movie:', movies[focusedIndex]?.title);
      }
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, focusedIndex, currentIndex, movies, itemsPerView, onFocusChange, sectionId]);

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
      <h2 className="top10-title">{title}</h2>
      <div className="top10-slider">
        <button className="top10-nav prev" onClick={prevSlide}>‹</button>
        <div className="small-movie-slider-list" style={{ transform: `translateX(-${currentIndex * 190}px)`, paddingLeft: '60px' }}>
          {movies.map((movie, index) => (
            <div 
              key={movie._id} 
              className={`small-movie-slider-item ${focusMode === sectionId && focusedIndex === index ? 'focused' : ''}`}
            >
              <MovieCard movie={{
                id: movie._id,
                title: movie.title,
                img: movie.imagePoster?.includes("https://") 
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

export default SmallMovieSlider;