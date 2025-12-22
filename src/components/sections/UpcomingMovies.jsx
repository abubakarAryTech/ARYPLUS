import { Fragment, useState, useEffect } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../../components/cards/CardStyle";
import { upcommingMovie } from "../../StaticData/data";

const UpcomingMovies = (props) => {
  const playlistid = props.playlistid;
  const [title, setTitle] = useState(null);
  const [upcommingMovie2] = useState(upcommingMovie);
  const [videos, setVideos] = useState(null);
  const [isloading, setisloading] = useState(false);
  useEffect(() => {
    if (videos == null) {
      fetch("https://aryzap.com/api/playlists.php").then((resp) => {
        //  fetch('https://api.arynews.tv/dailymotion/api.php?id='+id+'&limit=4').then((resp) => {

        resp.json().then((result) => {
          setVideos(result.videosData[playlistid]);
          setTitle(result.videosData[playlistid].title);
          //alert(result.videosData[0]);
          // setPage(2);
          // setPrevPage(1);
          setisloading(true);
          // setPrevPage(prevPage + 1);
        });
      });
    }
  });

  return (
    <Fragment>
      {isloading == true ? (
        <SectionSlider
          title={title}
          list={videos.videos}
          className="upcomimg-block streamit-block"
          slidesPerView="6"
        >
          {/* {(data) => (
          <CardStyle
            image={data.imagePoster.includes('https://') ? data.imagePoster : "https://zapi.aryzap.com/public/" + data.imagePoster}
            title={data.title}
            // movieTime={data.movieTime}
            watchlistLink="/playlist"
            link={"/series/" + data._id}
          />
        )} */}

          {(data) => (
            <CardStyle
              image={data.poster_urltv}
              title={data.name}
              // movieTime={data.movieTime}
              watchlistLink="/playlist"
              link={"/series/" + data.link}
            />
          )}
        </SectionSlider>
      ) : null}
    </Fragment>
  );
};

upcommingMovie.DisplayName = upcommingMovie;
export default UpcomingMovies;
