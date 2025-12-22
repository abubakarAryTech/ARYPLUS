import { useState, Fragment } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { latestMovie } from "../../StaticData/data";

function SpecialsLatestVideos() {
  const [title] = useState("Specials Latest Videos");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={latestMovie}
        className="latest-block streamit-block"
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

SpecialsLatestVideos.displayName = SpecialsLatestVideos;
export default SpecialsLatestVideos;
