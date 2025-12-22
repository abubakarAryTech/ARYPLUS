import { Fragment, useState } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../../components/cards/CardStyle";
import { latestMovie } from "../../StaticData/data";

const LatestMovies = () => {
  const [title] = useState("Latest Movies");
  const [latestMovie1] = useState(latestMovie);

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={latestMovie}
        className="latest-block streamit-block"
        slidesPerView="6"
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
};

LatestMovies.DisplayName = LatestMovies;
export default LatestMovies;
