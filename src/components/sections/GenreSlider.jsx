import React, { Fragment, memo } from "react";

//data
import { geners } from "../../StaticData/data";

//components
import SectionSlider from "../slider/SectionSlider";
import GenersCard from "../cards/GanresCard";

const GenreSlider = memo(() => {
  return (
    <Fragment>
      <SectionSlider
        className="movie-geners-block"
        title="Movie Geners"
        list={geners}
        slidesPerView={6}
        link="/all-genres"
      >
        {(data) => (
          <GenersCard
            slug={data.slug}
            title={data.title}
            image={data.thumbnail}
            type={data.type}
          />
        )}
      </SectionSlider>
    </Fragment>
  );
});

GenreSlider.displayName = "GenreSlider";
export default GenreSlider;
