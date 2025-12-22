import { memo } from "react";
import { Link } from "react-router-dom";
//react bootstrap
import {
  Col,
  Container,
  Row,
  Nav,
  Tab,
  Button,
  Modal,
  Form,
} from "react-bootstrap";

const CardStyleSingle = memo(
  ({
    title = "",
    movieTime = "",
    watchlistLink = "",
    link = "",
    image = "",
    rating = 3, // ✅ Correct way to default rating
    sectionTitle = "",
  }) => {
    var nf = new Intl.NumberFormat();
    return (
      <div className="">
        <Container fluid className="px-0">
          <div className="content-details iq-custom-tab-style-two">
            <div className="overflow-hidden animated fadeInUp">
              {/* <div className="d-flex align-items-center justify-content-between my-4">
                      <h5 className="main-title text-capitalize mb-0">
                        {title + " - All Episodes"}
                      </h5>
                    </div> */}
              <Row className="">
                <Col className="mb-4">
                  <div className="watchlist-warpper card-hover-style-two">
                    <div className="block-images position-relative w-100">
                      <div className="img-box">
                        <Link
                          to={link}
                          className="position-absolute top-0 bottom-0 start-0 end-0"
                        ></Link>
                        <img
                          src={
                            image &&
                            image.includes("_live") &&
                            sectionTitle == "HEADLINES"
                              ? "/assets/images/premier.webp"
                              : image || image
                          }
                          alt={title}
                          className="img-fluid object-cover w-100 d-block border-0"
                        />
                      </div>
                      {sectionTitle !== "Drama's OST" &&
                      sectionTitle !== "TELEFILMS" ? (
                        <div className="card-description pb-0">
                          <h5 className="text-capitalize fw-500">
                            <Link to={link}>{title}</Link>
                          </h5>
                          {/* <div className="d-flex align-items-center gap-3">
                                     <div className="d-flex align-items-center gap-1 font-size-12">
                                       <i className="fa-solid fa-earth-americas text-primary"></i>
                                       <span className="text-body fw-semibold text-capitalize">
                                       {item['owner.screenname']}
                                       </span>
                                     </div>
                                     <div className="d-flex align-items-center gap-1 font-size-12">
                                       <i className="fa-regular fa-eye text-primary"></i>
                                       <span className="text-body fw-semibold text-capitalize">
                                         {nf.format(item.views_total)}
                                       </span>
                                     </div>
                                   </div> */}

                          <div className="slider-ratting d-flex align-items-center">
                            {rating ? (
                              <span className="text-white mt-2">
                                <i
                                  className="fa fa-star text-warning"
                                  aria-hidden="true"
                                ></i>{" "}
                                {rating}{" "}
                                <span className="ms-1">Action . Thriller</span>
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Col>
              </Row>
              {/* <div className="text-center">
                      <div className="iq-button">
                        <Button
                          type="button"
                          className="btn text-uppercase position-relativ"
                          onClick={handleShow}
                        >
                          <span className="button-text">Create Playlist</span>
                          <i className="fa-solid fa-play"></i>
                        </Button>
                      </div>
                    </div> */}
            </div>
          </div>
        </Container>

        {/*  */}
      </div>
    );
  },
);

CardStyleSingle.displayName = "CardStyleSingle";
export default CardStyleSingle;
