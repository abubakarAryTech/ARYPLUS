import { Fragment, useState } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../../components/cards/CardStyle";
import { recommendedforYou } from "../../StaticData/data";

const RecommendedTVShow = () => {
  const [title] = useState("recommended TV Show");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={recommendedforYou}
        className="recommended-block streamit-block"
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

RecommendedTVShow.DisplayName = RecommendedTVShow;
export default RecommendedTVShow;
