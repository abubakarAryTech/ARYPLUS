import { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../App';
import { createKeyHandler } from '../utils/tizenRemote';
import HomeHeroSlider from '../components/slider/HomeHeroSlider';
import api from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';
import TopTenMoviesToWatch from "../components/sections/TopTenMoviesToWatch";
import LiveEventSlider from "../components/sections/LiveEventSlider";
import Top10Picks from '../customComponents/Top10Picks';
import MovieSlider from '../customComponents/MovieSlider';
import SmallMovieSlider from '../customComponents/SmallMovieSlider';
import HeroSlider from '../components/slider/HeroSlider';

const Home = () => {
  const [cardFocus, setCardFocus] = useState(0);
  const [sectionFocus, setSectionFocus] = useState('hero');
  const { focusMode } = useContext(FocusContext);
  const [sliderData, setSliderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  
  const cards = ['Popular Movies', 'Trending Shows', 'Live Channels'];

  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const response = await api.get(`/api/v2/homev2/v2/${import.meta.env.VITE_BUILDER_ID}/PK`);
        const homeData = response.data.home?.homeData;
        const imageSlider = homeData?.find(item => item.type === 'ImageSlider');
        if (imageSlider?.data?.slider?.sliderData) {
          setSliderData(imageSlider.data.slider.sliderData);
        }
      } catch (error) {
        console.error('Failed to fetch slider data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  const handleFocusChange = (newSection) => {
    console.log('Home: Focus changing from', sectionFocus, 'to', newSection);
    setSectionFocus(newSection);
  };

  return (
    <>
    {/* {!isLoading && <HomeHeroSlider list={sliderData} favorites={[]} user={user} />} */}
    {/* <LiveEventSlider type="liveevents" title="Live Events" /> */}
    {/* <TopTenMoviesToWatch /> */}

    <HeroSlider Slider="Slider" focusMode={sectionFocus} onFocusChange={handleFocusChange} />
    <Top10Picks focusMode={sectionFocus} onFocusChange={handleFocusChange} />
    <MovieSlider focusMode={sectionFocus} onFocusChange={handleFocusChange} sectionName="DRAMAS" title="Featured Dramas" sectionId="dramas" />
    <MovieSlider focusMode={sectionFocus} onFocusChange={handleFocusChange} sectionName="TELEFILMS" title="Telefilms" sectionId="telefilms" />
    <MovieSlider focusMode={sectionFocus} onFocusChange={handleFocusChange} sectionName="TV SHOWS" title="Tv Shows" sectionId="tvshows" />
    <MovieSlider focusMode={sectionFocus} onFocusChange={handleFocusChange} sectionName="SPORTS" title="Sports" sectionId="sports" />
    <MovieSlider focusMode={sectionFocus} onFocusChange={handleFocusChange} sectionName="PODCASTS" title="PODCASTS" sectionId="podcasts" />
    <SmallMovieSlider focusMode={sectionFocus} onFocusChange={handleFocusChange} sectionName="OST" title="OST" sectionId="ost"/>
    
    </>
  );
};

export default Home;