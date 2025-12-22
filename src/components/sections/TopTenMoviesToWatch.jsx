import React, { memo, Fragment, useState, useEffect } from "react";
// react-bootsrap
import { Row, Col, Placeholder } from "react-bootstrap";

import SectionSlider from "../slider/SectionSlider";
import TopTenCard from "../../components/cards/TopTenCard";
// import { generateImgPath } from "../../StaticData/data";
const TopTenMoviesToWatch = memo(() => {
  const shimmerCardStyle = {
    // backgroundColor: "#1e1e1e",
    height: "10.5rem",
    padding: "1rem",
    width: "100%",
  };

  const [title] = useState("top ten movies to watch");

  const [playlist, setPlaylist] = useState(null);
  const [isloading, setisloading] = useState(false);
  useEffect(() => {
    if (playlist == null) {
      fetch(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/series`).then(
        (resp) => {
          //  fetch('https://api.arynews.tv/dailymotion/api.php?id='+id+'&limit=4').then((resp) => {

          resp.json().then((result) => {
            setPlaylist(result.series);
            // setPage(2);
            // setPrevPage(1);
            setisloading(true);
            // setPrevPage(prevPage + 1);
          });
        },
      );
    }
  });

  const [topTen] = useState([
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/01.webp`,
      count: 1,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/02.webp`,
      count: 2,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/03.webp`,
      count: 3,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/04.webp`,
      count: 4,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/05.webp`,
      count: 5,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/06.webp`,
      count: 6,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/07.webp`,
      count: 7,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/08.webp`,
      count: 8,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/09.webp`,
      count: 9,
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/top-ten-number/10.webp`,
      count: 10,
    },
  ]);
  var count = 1;
  let fin = 0;
  return (
    <Fragment>
      {isloading == true ? (
        <SectionSlider title={title} list={playlist} className="top-ten-block">
          {(data) => (
            <TopTenCard
              imagePath={
                data.imagePoster.includes("https://")
                  ? data.imagePoster
                  : `${import.meta.env.VITE_APP_IMAGE_PATH}` + data.imagePoster
              }
              // countValue={data.count}
              // index
              // countValues={count = count + 1}
              countValue={count - 10}
              link="/movies-detail"
            />
          )}
        </SectionSlider>
      ) : (
        <>
          <Row>
            <Col>
              <div style={shimmerCardStyle}>
                <Placeholder as="p" animation="glow mb-2">
                  <Placeholder
                    style={{
                      height: 20,
                      width: "100%",
                    }}
                  />
                </Placeholder>
                <Placeholder as="p" animation="glow mb-2">
                  <Placeholder
                    style={{
                      height: 20,
                      width: "90%",
                    }}
                  />
                </Placeholder>
                <Placeholder as="p" animation="glow mb-2">
                  <Placeholder
                    style={{
                      height: 20,
                      width: "80%",
                    }}
                  />
                </Placeholder>

                <Placeholder as="p" animation="glow mb-2">
                  <Placeholder
                    style={{
                      height: 20,
                      width: "90%",
                    }}
                  />
                </Placeholder>

                <Placeholder as="p" animation="glow mb-2">
                  <Placeholder
                    style={{
                      height: 20,
                      width: "100%",
                    }}
                  />
                </Placeholder>
              </div>
            </Col>
          </Row>
        </>
      )}
    </Fragment>
  );
});

TopTenMoviesToWatch.displayName = "TopTenMoviesToWatch";
export default TopTenMoviesToWatch;
