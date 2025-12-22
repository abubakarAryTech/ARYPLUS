import { useState, Fragment } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { recommendedforYou } from "../../StaticData/data";

function MoviesRecommendedForYou() {
  const [title] = useState("Movies Recommended For You");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={recommendedforYou}
        className="recommended-block"
        slidesPerView={6}
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

MoviesRecommendedForYou.displayName = MoviesRecommendedForYou;
export default MoviesRecommendedForYou;
