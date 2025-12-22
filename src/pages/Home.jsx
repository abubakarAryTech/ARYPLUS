import { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../App';
import { createKeyHandler } from '../utils/tizenRemote';
import HomeHeroSlider from '../components/slider/HomeHeroSlider';
import api from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';

const Home = () => {
  const [cardFocus, setCardFocus] = useState(0);
  const { focusMode } = useContext(FocusContext);
  const [sliderData, setSliderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  
  const cards = ['Popular Movies', 'Trending Shows', 'Live Channels'];

  useEffect(() => {
    // Hardcoded slider data for testing
    const hardcodedData = [
      {
        imagePath: "slider1.jpg",
        data: {
          _id: "1",
          title: "Sample Movie 1",
          description: "This is a sample movie description for testing the slider.",
          seriesType: "singleVideo",
          releaseDate: "2024-01-01",
          genreId: [{ title: "Action" }],
          episodeCount: 1,
          videoDuration: "02:15:30",
          logo: null,
          trailer: null,
          imageCoverMobile: "mobile1.jpg"
        }
      },
      {
        imagePath: "slider2.jpg",
        data: {
          _id: "2",
          title: "Sample Show 2",
          description: "This is a sample TV show description for testing the slider.",
          seriesType: "show",
          releaseDate: "2024-02-01",
          genreId: [{ title: "Drama" }],
          episodeCount: 24,
          videoDuration: "45:00",
          logo: null,
          trailer: null,
          imageCoverMobile: "mobile2.jpg"
        }
      }
    ];
    
    setSliderData(hardcodedData);
    setIsLoading(false);
  }, []);

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

    {!isLoading && <HomeHeroSlider list={sliderData} favorites={[]} user={user} />}


      <h1>Welcome to ARYPLUS TV</h1>
      <div className="content-grid">
        <div className="featured-section">
          <h2>Featured Content</h2>
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

export default Home;