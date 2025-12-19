import { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../App';
import { createKeyHandler } from '../utils/tizenRemote';

const Series = () => {
  const [cardFocus, setCardFocus] = useState(0);
  const { focusMode } = useContext(FocusContext);
  
  const cards = ['Drama Series', 'Comedy Shows', 'Reality TV'];

  useEffect(() => {
    const handleKeyDown = createKeyHandler({
      ArrowRight: (e) => {
        if (focusMode === 'content') {
          e.preventDefault();
          setCardFocus(prev => (prev + 1) % cards.length);
        }
      },
      ArrowLeft: (e) => {
        if (focusMode === 'content') {
          e.preventDefault();
          setCardFocus(prev => (prev - 1 + cards.length) % cards.length);
        }
      },
      Enter: (e) => {
        if (focusMode === 'content') {
          alert(`Selected: ${cards[cardFocus]}`);
        }
      }
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardFocus, cards, focusMode]);

  return (
    <div className="page-content">
      <h1>TV Series</h1>
      <div className="content-grid">
        <div className="series-section">
          <h2>Popular Series</h2>
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

export default Series;