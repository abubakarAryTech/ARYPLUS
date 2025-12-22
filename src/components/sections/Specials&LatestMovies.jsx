import { useState, Fragment } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { spacialLatestMovie } from "../../StaticData/data";

function SpecialsLatestMovies() {
  const [title] = useState("Specials & Latest Movies");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={spacialLatestMovie}
        className="recommended-block streamit-block"
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

SpecialsLatestMovies.displayName = SpecialsLatestMovies;
export default SpecialsLatestMovies;
