import { useState, Fragment } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { latestMovie } from "../../StaticData/data";

function BestOfInternationalShows() {
  const [title] = useState("Best Of InternationalShows");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={latestMovie}
        className="recommended-block section-top-spacing streamit-block"
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

BestOfInternationalShows.displayName = BestOfInternationalShows;
export default BestOfInternationalShows;
