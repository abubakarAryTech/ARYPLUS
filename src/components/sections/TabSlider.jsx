import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import { tabSlider } from "../../StaticData/data";
import { Nav, Tab } from "react-bootstrap";
import { Link } from "react-router-dom";
import React, { memo, Fragment, useState } from "react";

const TabSlider = memo((props) => {
  const videos = props.data;

  return (
    <>
      <div className="tab-slider">
        <div className="slider">
          {videos
            ? videos.map((data, index) => (
                <div className="block-images position-relative w-100">
                  <div className="container-fluid">
                    <div className="row align-items-center min-vh-100 h-100 my-4">
                      <div className="col-12  mt-5 mt-md-0">
                        <div className="tab-block">
                          <h4 className="tab-title text-capitalize mb-0">
                            All Episode
                          </h4>
                          <div className="tab-bottom-bordered border-0 trending-custom-tab">
                            <Tab.Container
                              id="left-tabs-example"
                              defaultActiveKey="0season"
                            >
                              <Nav
                                variant="pills"
                                className="nav nav-tabs nav-pills mb-3 overflow-x-scroll"
                              >
                                {data.seasons.map((episodes, index) => (
                                  <Nav.Item key={"nav" + index}>
                                    <Nav.Link eventKey={index + "season"}>
                                      {episodes.title}
                                    </Nav.Link>
                                  </Nav.Item>
                                ))}
                              </Nav>
                              <Tab.Content className="tab-content trending-content">
                                {data.list.map((episode, index) => (
                                  <Tab.Pane
                                    eventKey={index + "season"}
                                    key={index + "season"}
                                  >
                                    <ul className="list-inline m-0 p-0">
                                      {episodes.episodes.map((episode) => (
                                        <li
                                          className="d-flex align-items-center gap-3"
                                          key={episode.title + "ep"}
                                        >
                                          <div className="image-box flex-shrink-0">
                                            <img
                                              src={episode.image}
                                              alt="image-icon"
                                              className="img-fluid rounded"
                                            />
                                          </div>
                                          <div className="image-details">
                                            <h6 className="mb-1 text-capitalize">
                                              <span className="text-primary">
                                                E{index + 1}
                                              </span>{" "}
                                              - {episode.title}
                                            </h6>
                                            <small>45 minute</small>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </Tab.Pane>
                                ))}
                              </Tab.Content>
                            </Tab.Container>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
    </>
  );
});

TabSlider.displayName = "TabSlider";
export default TabSlider;
