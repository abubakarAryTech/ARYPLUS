import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../../components/cards/CardStyle";
import { Fragment, useState } from "react";
import { recommendedforYou } from "../../StaticData/data";
function RecommendedForYou() {
  const [title] = useState("Recommended For You");

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
}

RecommendedForYou.displayName = RecommendedForYou;
export default RecommendedForYou;
