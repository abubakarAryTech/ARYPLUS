import React, { Fragment, memo, useEffect } from "react";

//react bootstrap
import { Row, Col, Container } from "react-bootstrap";

//react router
import { useParams } from "react-router-dom";

//component
import CardBlogGrid from "../../components/cards/CardBlogGrid";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";

//static data
import { blogsGrid } from "../../StaticData/blogs";

const BlogGrid = memo(() => {
  const { grid } = useParams();
  let _column, title;
  switch (grid) {
    case "single":
      _column = "12";
      title = "1 Column Grid";
      break;
    case "double":
      _column = "6";
      title = "2 Column Grid";
      break;
    case "large-grid":
      _column = "4";
      title = "3 Column Grid";
      break;
    case "small-grid":
      _column = "3";
      title = "4 Column Grid";
      break;
    default:
      break;
  }
  return (
    <Fragment>
      <BreadCrumbWidget title={title} />
      <div className="section-padding">
        <Container>
          <Row>
            {blogsGrid.slice(0, 10).map((item, index) => {
              return (
                <Col lg={_column} sm="12" key={index}>
                  <CardBlogGrid
                    title={item.title}
                    slug={item.slug}
                    thumbnail={item.thumbnail}
                    description={item.shortDescription}
                    username={item.username}
                    date={item.blogDate}
                    categories={item.categories}
                  ></CardBlogGrid>
                </Col>
              );
            })}
            ;
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

BlogGrid.displayName = "BlogGrid";
export default BlogGrid;
