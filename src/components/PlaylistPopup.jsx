import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function PlaylistPopup({
  videos,
  seriesid,
  onClose,
  episodeId,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const activeEpisodeRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  // Set scroll position to active episode on mount
  useEffect(() => {
    if (activeEpisodeRef.current && scrollContainerRef.current) {
      const offsetTop = activeEpisodeRef.current.offsetTop;
      scrollContainerRef.current.scrollTop = offsetTop;
    }
  }, [episodeId]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(31, 31, 31, 0.97)",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "80vh",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
      className={`playlist-share-popup ${isClosing ? "animate-out" : "animate-in"}`}
    >
      {/* Fixed Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          padding: "5px 25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
          backgroundColor: "rgba(31, 31, 31, 0.97)",
        }}
        className="playlistHead"
      >
        <h5 className="mb-0 text-white">Episodes</h5>
        <button
          onClick={handleClose}
          style={{
            fontSize: "1.5rem",
            fontWeight: "800",
            border: "none",
            background: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        style={{
          overflowY: "auto",
          padding: "0 16px 16px 16px",
          flexGrow: 1,
        }}
      >
        <Row>
          <Col xs={12}>
            <div className="overflow-hidden animated fadeInUp">
              <div className="block-images position-relative w-100">
                <div className="row align-items-center">
                  <div className="col-12">
                    <div className="bg-transparent">
                      <div className="tab-bottom-bordered border-0 trending-custom-tab">
                        {videos &&
                          videos.map((item, index) => (
                            <ul
                              className="list-inline m-0 p-0 my-2"
                              key={item.title + "ep"}
                              ref={
                                item._id === episodeId ? activeEpisodeRef : null
                              }
                            >
                              <li
                                className={`d-flex align-items-center mt-2 px-2 py-2 episode-card ${
                                  item._id === episodeId ? "active-episode" : ""
                                }`}
                                style={{
                                  backgroundColor:
                                    item._id === episodeId
                                      ? "rgba(255, 255, 255, 0.1)"
                                      : "transparent",
                                  borderRadius: "8px",
                                }}
                              >
                                {/* Index */}
                                <div className="episode-index d-none d-md-block pe-3">
                                  <h3
                                    className="big-font-3 letter-spacing-1 text-uppercase"
                                    style={{ width: "40px" }}
                                  >
                                    {item.videoEpNumber
                                      .toString()
                                      .padStart(2, "0")}
                                  </h3>
                                </div>

                                {/* Image */}
                                <div
                                  className="image-box me-1"
                                  style={{ width: "200px" }}
                                >
                                  <div className="block-images position-relative rounded-border">
                                    <div className="iq-image-box overly-images position-relative hover-wrapper">
                                      <Link
                                        to={`/video/v1/3/${item._id}/${seriesid}`}
                                        className="d-block"
                                        onClick={handleClose}
                                      >
                                        <img
                                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}${item.imagePath}`}
                                          alt="movie-card"
                                          className="img-fluid object-cover w-100 d-block border-0 episodeImage"
                                          style={{ aspectRatio: "16/9" }}
                                        />
                                      </Link>

                                      {/* Play button on hover */}
                                      <div className="btn-on-hover position-absolute top-50 start-50 translate-middle">
                                        <Link
                                          to={`/video/v1/3/${item._id}/${seriesid}`}
                                          className="btn text-uppercase position-relative d-flex justify-content-center align-items-center"
                                          onClick={handleClose}
                                        >
                                          <img
                                            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/play.svg`}
                                            alt="Watch Now"
                                            className="img-fluid"
                                            style={{ maxWidth: "50px" }} // Adjust size as needed
                                          />
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                <div className="image-details flex-grow-1">
                                  <Link
                                    to={`/video/v1/3/${item._id}/${seriesid}`}
                                    onClick={handleClose}
                                  >
                                    <h6 className="mb-1 font-weight-800 text-capitalize text-white">
                                      {item.title}
                                    </h6>
                                    <small
                                      className="line-clamp-2 text-white"
                                      style={{
                                        fontSize: "0.9rem",
                                        lineHeight: "1.4",
                                      }}
                                    >
                                      {item.description}
                                    </small>
                                    <div className="mt-1 duration d-md-none">
                                      <img
                                        src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/duration.svg`}
                                        alt="duration"
                                      />
                                      <span className="ms-1 text-white">
                                        {Math.round(item.videoLength / 60)} min
                                      </span>
                                    </div>
                                  </Link>
                                </div>

                                {/* Duration (Right Side) */}
                                <div
                                  className="gap-1 d-none d-md-flex align-items-center flex-nowrap"
                                  style={{ width: "120px" }}
                                >
                                  <Link
                                    to={`/video/v1/3/${item._id}/${seriesid}`}
                                    onClick={handleClose}
                                  >
                                    {item._id === episodeId ? (
                                      <span className="ms-1 text-white nowrap">
                                        Now Playing
                                      </span>
                                    ) : (
                                      <>
                                        <img
                                          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/duration.svg`}
                                          alt="duration"
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                          }}
                                        />
                                        <span className="ms-1 text-white nowrap">
                                          {Math.round(item.videoLength / 60)}{" "}
                                          min
                                        </span>
                                      </>
                                    )}
                                  </Link>
                                </div>
                              </li>
                            </ul>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
