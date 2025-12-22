import { Fragment, useState } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../../components/cards/CardStyle";
import { topPics } from "../../StaticData/data";

function TopPicsForYou() {
  const [title] = useState("Top Pics For You");
  const [topTen] = useState(topPics);

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={topTen}
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

TopPicsForYou.displayName = TopPicsForYou;
export default TopPicsForYou;
