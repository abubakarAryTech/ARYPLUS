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
      </div>
      {/* Movie Info Below Card */}
      <div className="movie-info" style={{ padding: '8px 0', color: 'white' }}>
        <h3 className="movie-title" style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>{movie.title}</h3>
        <p className="movie-genre" style={{ margin: '0', fontSize: '12px', opacity: '0.8' }}>{movie.tags}</p>
      </div>
    </div>
  );
};

export default MovieCard;