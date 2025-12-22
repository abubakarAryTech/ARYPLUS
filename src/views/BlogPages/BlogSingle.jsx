import React, { Fragment, memo } from "react";

//react bootstrap
import { Col, Container, Row } from "react-bootstrap";

//react router-dom
import { useParams, Link } from "react-router-dom";

//static Data
import { blogs } from "../../StaticData/blogs";

//components
import FormWidget from "../../components/blog/FormWidget";
import DetailMetaList from "../../components/blog/DetailMetaList";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";
import VideoJS from "../../components/plugins/VideoJs";

// import { generateImgPath } from "../../StaticData/data";

const AudioBlog = memo(() => {
  let title;
  const { type } = useParams();
  const slug = "the-most-anticipated-movies";
  const blog = blogs.find((item) => item.slug === slug);
  switch (type) {
    case "audio":
      title = "My streaming Black Pearl";
      break;
    case "video":
      title = "Cookies and Web Beacons";
      break;
    case "link":
      title = "Birds Of Prey Star Says She’s Definitely Open To A Ghost Return";
      break;
    case "quote":
      title =
        "Saturday Night Live’ Re-Enacts Biden and Harris’ Victory Speeches";
      break;
    case "gallery":
      title = "Gillian Anderson Shares the Photos From The Crown";
      break;
    default:
      break;
  }
  const gallery = [
    {
      img: `${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/blog1.webp`,
      class: "mb-4",
    },
    {
      img: `${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/blog2.webp`,
      class: "mb-4",
    },
    {
      img: `${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/blog3.webp`,
      class: "mb-4",
    },
    {
      img: `${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/blog4.webp`,
      class: "mb-4 mb-md-0",
    },
    {
      img: `${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/blog5.webp`,
      class: "mb-4 mb-md-0",
    },
    {
      img: `${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/Fantacy.webp`,
      class: "",
    },
  ];

  const playerRef = React.useRef(null);

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    techOrder: ["youtube"],
    sources: [
      {
        src: "https://www.youtube.com/watch?v=QCGq1epI9pQ",
        type: "video/youtube",
      },
    ],
    youtube: { iv_load_policy: 1 },
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <Fragment>
      <BreadCrumbWidget title={title} />
      <div className="section-padding">
        <Container>
          <Row>
            <Col xl="8">
              <div className="iq-blog blog-detail">
                {type === "audio" ? (
                  <div>
                    <iframe
                      height="200"
                      className="w-100"
                      frameBorder="no"
                      src="https://w.soundcloud.com/player/?visual=false&amp;url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F36701924&amp;show_artwork=true&amp;maxheight=750&amp;maxwidth=720&amp;auto_play=false&amp;buying=true&amp;liking=true&amp;download=true&amp;sharing=true&amp;show_comments=true&amp;show_playcount=true&amp;show_user=true&amp;color"
                    ></iframe>
                  </div>
                ) : type === "video" ? (
                  <div>
                    <VideoJS
                      options={videoJsOptions}
                      onReady={handlePlayerReady}
                    />
                  </div>
                ) : type === "gallery" ? (
                  <Row className="row-cols-xl-3 row-cols-md-2 row-cols-1">
                    {gallery.map((item, index) => {
                      return (
                        <Col className={item.class} key={index}>
                          <Link to="">
                            <img src={item.img} alt={index} />
                          </Link>
                        </Col>
                      );
                    })}
                  </Row>
                ) : (
                  ""
                )}
                <div className="iq-blog-box pt-4">
                  <div className="iq-blog-meta d-flex mb-3">
                    <ul className="iq-blogtag list-inline">
                      <li className="border-gredient-left">
                        <Link to="">
                          <i
                            className="far fa-user me-1"
                            aria-hidden="true"
                          ></i>{" "}
                          {blog.username}
                        </Link>
                      </li>
                    </ul>
                    <ul className="list-inline mb-0 ms-2">
                      <li className="border-gredient-left">
                        <Link to="">
                          <i
                            className="far fa-calendar-alt me-1"
                            aria-hidden="true"
                          ></i>{" "}
                          {blog.blogDate}
                        </Link>
                      </li>
                    </ul>
                  </div>
                  {type === "link" ? (
                    <div className="mb-4">
                      <Link to="https://iqonic.design/">
                        <i className="fas fa-link text-primary quote-icon"></i>
                      </Link>
                    </div>
                  ) : type === "quote" ? (
                    <div className="blockquote text-center mb-3">
                      <div className="blockquote-icon">
                        <i
                          aria-hidden="true"
                          className="fas fa-quote-right"
                        ></i>
                      </div>
                      <p>
                        “ Movies can and do have tremendous influence in shaping
                        young lives in the realm of entertainment towards the
                        ideals and objectives of normal adulthood.{" "}
                      </p>
                      <div className="my-4">
                        <h6 className="border-gredient-left d-inline-block ps-2 fw-normal py-1">
                          {" "}
                          Walt Disney{" "}
                        </h6>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <div
                    dangerouslySetInnerHTML={{ __html: blog.longDescription }}
                  ></div>
                  <div className="iq-blog-tag">
                    <FormWidget />
                  </div>
                </div>
              </div>
              <div></div>
            </Col>
            <Col xl="4" className="mt-5 mt-xl-0">
              <DetailMetaList />
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

export default AudioBlog;
