import React, { useState } from 'react';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);

  const movieData = {
  top10: [
    { id: 1, title: 'Meri Zindagi Hai Tu', img: '/images/top1-poster.jpg' },
    { id: 2, title: 'Chaalbaaz', img: '/images/top2-poster.jpg' },
    { id: 3, title: 'Chaalawa', img: '/images/top3-poster.jpg' },
    { id: 4, title: 'Sharpa Sand', img: '/images/top4-poster.jpg' },
    { id: 5, title: 'Kabhi Main Kabhi Tum', img: '/images/top5-poster.jpg' }
  ],
  dramas: [
    { 
      id: 101, 
      title: 'Dil Lagi', 
      episodes: '25 Episodes', 
      tags: 'Romance | Drama', 
      img: '/images/dillagi.jpg',
      videoPreview: '/videos/dillagi-trailer.mp4' 
    },
    { 
      id: 102, 
      title: 'Hasrat', 
      episodes: '30 Episodes', 
      tags: 'Family | Drama', 
      img: '/images/hasrat.jpg',
      videoPreview: '/videos/hasrat-preview.mp4' 
    }
  ]
};

  return (
    <div className="movie-card-container">
      <div className="movie-card">
        {/* Main Image / Video Preview */}
        <div className="image-wrapper">
          <img 
            src={movie.img} 
            alt={movie.title} 
            className="card-img" 
          />
        </div>
        {console.log("Adadada",movie.tags)}
      </div>
      <div className="movie-title-container" style={{ padding: '8px 0', marginTop: '8px' }}>
        <h2 style={{ color: 'white', margin: '0', fontSize: '16px' }}>{movie.title}</h2>
        
      </div>
    </div>
  );
};

export default MovieCard;