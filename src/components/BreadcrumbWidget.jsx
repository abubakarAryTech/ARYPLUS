import { Fragment, memo, useState } from "react";

//react bootstrap
import { Breadcrumb, Container, Row, Col } from "react-bootstrap";

// Title taglines
import { getTaglineByTitle } from '../constants/titleTaglines';

// Define the image paths
// const defaultImagePath = generateImgPath("/assets/images/pages/01.webp");
const defaultImagePath = `${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/01-new.webp`;
const islamicProgramsImagePath = `${import.meta.env.VITE_APP_IMAGE_PATH}images/banners/qtv-banner.webp`;
const newsTalkShowsImagePath = `${import.meta.env.VITE_APP_IMAGE_PATH}images/banners/news-banner.webp`;

const BreadCrumbWidget = memo((props) => {
  // this is for cast view all page only
  const [imgExists, setImgExists] = useState(true);
  const imgSrc = `${import.meta.env.VITE_APP_IMAGE_PATH}images/cast/${props.title}.png`;
  // ---

  // Helper function to format title for display
  const getDisplayTitle = (title) => {
    if (title === "Tvod%20Exclusives" || title === "Tvod Exclusives") {
      return "Exclusive";
    }
    return title;
  };

  // Determine which imagePath to use
  const imagePath =
    props.title === "ISLAMIC PROGRAMS"
      ? islamicProgramsImagePath
      : props.title === "NEWS TALK SHOWS"
        ? newsTalkShowsImagePath
        : defaultImagePath;

  return (
    <Fragment>
      <div
        className="iq-breadcrumb"
        // style={{ backgroundImage: `url(${imagePath})` }}
      >
        <Container fluid>
          <div className="section-paddingv2">
            <Row className="align-items-center">
              <Col sm="12">
                {props.cast ? (
                  <nav className="d-flex align-items-center gap-4">
                    {imgExists && (
                      <img
                        src={imgSrc}
                        alt="personality"
                        className="img-fluid rounded-circle"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                        onError={() => setImgExists(false)} // hide image if loading fails
                      />
                    )}
                    <h2 className="title text-capitalize mb-0">
                      {getDisplayTitle(props.title)}
                    </h2>
                  </nav>
                ) : (
                  <nav className="text-center">
                    <h2 className="title text-capitalize">{getDisplayTitle(props.title)}</h2>
                    {getTaglineByTitle(props.title) && (
                      <p className="section-subtitle">
                        {getTaglineByTitle(props.title)}
                      </p>
                    )}
                    {/* <h2 className="title text-capitalize">{props.title}</h2> */}
                    {/* <Breadcrumb
                  className="main-bg"
                  listProps={{
                    className: "text-center justify-content-center",
                  }}
                >
                  <Breadcrumb.Item>Home</Breadcrumb.Item>
                  <Breadcrumb.Item active>{props.title}</Breadcrumb.Item>
                </Breadcrumb> */}
                  </nav>
                )}
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

BreadCrumbWidget.displayName = "BreadCrumbWidget";
export default BreadCrumbWidget;
