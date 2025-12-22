import React, { memo, Fragment, useState } from "react";

import SectionSlider from "../slider/SectionSlider";
import PersonalityCard from "../cards/PersonalityCard";
// import { generateImgPath } from "../../StaticData/data";

const YourFavouritePersonality = memo(() => {
  const [title] = useState("your favourite personality");
  const [personality] = useState([
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/01.webp`,
      title: "John Abraham",
      category: "actor",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/02.webp`,
      title: "Leena burton",
      category: "actress",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/03.webp`,
      title: "Lorina williams",
      category: "actress",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/04.webp`,
      title: "Davina decorous",
      category: "actress",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/05.webp`,
      title: "Thomas bailey",
      category: "producer",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/06.webp`,
      title: "Kelly Reilly",
      category: "actress",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/07.webp`,
      title: "smith Jonas",
      category: "director",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/08.webp`,
      title: "angel louis",
      category: "producer",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/09.webp`,
      title: "Millar joseph",
      category: "actor",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/10.webp`,
      title: "mark wilson",
      category: "actor",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/11.webp`,
      title: "Kelley walker",
      category: "director",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/12.webp`,
      title: "Amy Sedaris",
      category: "actor",
    },
  ]);
  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={personality}
        className="streamit-block"
        slidesPerView={11}
        link="/cast-view-all"
      >
        {(data) => (
          <PersonalityCard
            image={data.image}
            category={data.category}
            title={data.title}
            categoryLink="#"
            link="/cast-detail"
          />
        )}
      </SectionSlider>
    </Fragment>
  );
});

YourFavouritePersonality.displayName = "YourFavouritePersonality";
export default YourFavouritePersonality;
