import { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../App';

const Sports = () => {
  const [cardFocus, setCardFocus] = useState(0);
  const { focusMode } = useContext(FocusContext);
  
  const cards = ['Football', 'Basketball', 'Cricket', 'Tennis'];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (focusMode === 'content') {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCardFocus(prev => (prev + 1) % cards.length);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCardFocus(prev => (prev - 1 + cards.length) % cards.length);
        } else if (e.key === 'Enter') {
          alert(`Selected: ${cards[cardFocus]}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardFocus, cards, focusMode]);

  return (
    <div className="page-content">
      <h1>Sports</h1>
      <div className="content-grid">
        <div className="sports-section">
          <h2>Sports Categories</h2>
          <div className="content-cards">
            {cards.map((card, index) => (
              <div 
                key={index}
                className={`card ${focusMode === 'content' && index === cardFocus ? 'card-focused' : ''}`}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sports;