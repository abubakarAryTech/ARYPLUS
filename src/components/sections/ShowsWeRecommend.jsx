import { useState, Fragment } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { recommendedforYou } from "../../StaticData/data";

function ShowsWeRecommend() {
  const [title] = useState("Shows We Recommend");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={recommendedforYou}
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

ShowsWeRecommend.displayName = ShowsWeRecommend;
export default ShowsWeRecommend;
