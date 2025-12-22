import { useState, Fragment } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { populerSlider } from "../../StaticData/data";

function PopularMovies() {
  const [title] = useState("Popular Movies");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={populerSlider}
        className="popular-movies-block streamit-block"
      >
        {(data) => (
          <CardStyle
            image={data.image}
            title={data.title}
            movieTime={data.movieTime}
            watchlistLink="/playlist"
            link="/movies-detail"
          />
        )}
      </SectionSlider>
    </Fragment>
  );
}

PopularMovies.displayName = PopularMovies;
export default PopularMovies;
