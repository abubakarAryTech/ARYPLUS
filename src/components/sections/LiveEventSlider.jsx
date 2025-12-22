import { Fragment, useState, useEffect } from "react";
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";

const LiveEventSlider = (props) => {
  const types = props.type;
  //   alert(types);
  const [title, setTitle] = useState(props.title);
  const [videos, setVideos] = useState(null);
  const [isloading, setisloading] = useState(false);
  useEffect(() => {
    if (videos == null) {
      fetch("https://aryzap.com/api/livechannels2.php").then((resp) => {
        //  fetch('https://api.arynews.tv/dailymotion/api.php?id='+id+'&limit=4').then((resp) => {

        resp.json().then((result) => {
          setVideos(result[types]);
          // alert(result[types]);
          // setTitle(result.videosData[playlistid].title);
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
              image={data.image}
              type="livetv"
              // title={data.name}
              // movieTime={data.movieTime}
              watchlistLink="/playlist"
              link={"/live/" + data.channel}
            />
          )}
        </SectionSlider>
      ) : null}
    </Fragment>
  );
};

LiveEventSlider.DisplayName = LiveEventSlider;
export default LiveEventSlider;
