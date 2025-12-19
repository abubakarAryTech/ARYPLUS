import { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../App';
import { createKeyHandler } from '../utils/tizenRemote';

const Settings = () => {
  const [cardFocus, setCardFocus] = useState(0);
  const { focusMode } = useContext(FocusContext);
  
  const cards = ['Display Settings', 'Audio Settings', 'Network Settings', 'Account Settings'];

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
      <h1>Settings</h1>
      <div className="content-grid">
        <div className="settings-section">
          <h2>App Settings</h2>
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

export default Settings;