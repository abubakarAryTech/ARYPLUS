import { useState, Fragment } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { populerSlider } from "../../StaticData/data";

function PopularVideos() {
  const [title] = useState("Popular Videos");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={populerSlider}
        className="recommended-block section-top-spacing"
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

PopularVideos.displayName = PopularVideos;
export default PopularVideos;
