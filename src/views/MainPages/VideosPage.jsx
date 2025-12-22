import { Fragment } from "react";
import VideoHeroSlider from "../../components/slider/VideoHeroSlider";
import PopularVideos from "../../components/sections/PopularVideos";
import SpecialsLatestVideos from "../../components/sections/Specials&LatestVideos";
import VideosRecommendedForYou from "../../components/sections/VideosRecommendedForYou";

const VideosPage = () => {
  return (
    <Fragment>
      <VideoHeroSlider />
      <PopularVideos />
      <SpecialsLatestVideos />
      <VideosRecommendedForYou />
    </Fragment>
  );
};

VideosPage.DisplayName = VideosPage;
export default VideosPage;
