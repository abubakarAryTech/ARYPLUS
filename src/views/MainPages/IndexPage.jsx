import { memo } from "react";
// hero slider
import HomeHeroSlider from "../../components/slider/HomeHeroSlider";

// sections
import ContinueWatching from "../../components/sections/ContinueWatching";

import LatestMovies from "../../components/sections/LatestMovies";

import VerticalSectionSlider from "../../components/slider/VerticalSectionSlider";

import TrendingSlider from "../../components/sections/Trending";

import SuggestedBlock from "../../components/sections/SuggestedBlock";

import RecommendedTVShow from "../../components/sections/RecommendedTVShow";

import ParallexSection from "../../components/sections/ParallexSection";

import { verticleLatestMovies, latestMovie } from "../../StaticData/data";
import TopTenMoviesToWatch from "../../components/sections/TopTenMoviesToWatch";
import GenreSlider from "../../components/sections/GenreSlider";
import LiveEventSlider from "../../components/sections/LiveEventSlider";
import PlaylistSlider from "./../../components/sections/PlaylistSlider";

const HomePage = memo(() => {
  return (
    <>
      <HomeHeroSlider />

      {/* <ContinueWatching /> */}
      <LiveEventSlider type="liveevents" title="Live Events" />
      <LiveEventSlider type="livechannels" title="Live Channels" />
      <PlaylistSlider playlistid="2" />
      <TopTenMoviesToWatch />

      <PlaylistSlider playlistid="3" />
      <GenreSlider />
      <PlaylistSlider playlistid="4" />

      <PlaylistSlider playlistid="8" />
      <PlaylistSlider playlistid="9" />

      {/* <LatestMovies sliderData={latestMovie} /> */}

      {/* <VerticalSectionSlider sliderData={verticleLatestMovies} /> */}

      {/* <SuggestedBlock /> */}

      {/* <ParallexSection />

      <TrendingSlider /> */}

      {/* <RecommendedTVShow /> */}
    </>
  );
});

HomePage.displayName = "HomePage";
export default HomePage;
