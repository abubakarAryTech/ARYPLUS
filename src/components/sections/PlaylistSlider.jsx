import { Fragment, useState, useEffect } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";

const PlaylistSlider = (props) => {
  const playlistid = props.playlistid;
  const [title, setTitle] = useState(null);
  const [videos, setVideos] = useState(null);
  const [isloading, setisloading] = useState(false);
  useEffect(() => {
    if (videos == null) {
      // fetch('https://aryzap.com/api/playlists.php').then((resp) => {
      fetch(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/series/`).then(
        (resp) => {
          //  fetch('https://api.arynews.tv/dailymotion/api.php?id='+id+'&limit=4').then((resp) => {

          resp.json().then((result) => {
            setVideos(result.series);
            // setTitle(result.videosData[playlistid].title);
            //alert(result.videosData[0]);
            // setPage(2);
            // setPrevPage(1);
            setisloading(true);
            // setPrevPage(prevPage + 1);
          });
        },
      );
    }
  });

  return (
    <Fragment>
      {isloading == true ? (
        <SectionSlider
          title={title}
          list={videos}
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
              image={"https://zapi.aryzap.com/" + data.imagePoster}
              // title={data.name}
              // movieTime={data.movieTime}
              watchlistLink="/playlist"
              link={"/series/" + data._id}
            />
          )}
        </SectionSlider>
      ) : null}
    </Fragment>
  );
};

PlaylistSlider.DisplayName = PlaylistSlider;
export default PlaylistSlider;
