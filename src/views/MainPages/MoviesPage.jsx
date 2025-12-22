import { Fragment, memo } from "react";

// hero slider
import MovieHeroSlider from "../../components/slider/MovieHeroSlider";

// section
import PopularMovies from "../../components/sections/PopularMovies";
import SpecialsLatestMovies from "../../components/sections/Specials&LatestMovies";
import MoviesRecommendedForYou from "../../components/sections/MoviesRecommendedForYou";

const MoviesPage = memo(() => {
  return (
    <Fragment>
      <MovieHeroSlider />
      <PopularMovies />
      <SpecialsLatestMovies />
      <MoviesRecommendedForYou />
    </Fragment>
  );
});

MoviesPage.displayName = "MoviesPage";
export default MoviesPage;
