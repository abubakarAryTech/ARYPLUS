import React, { Fragment, memo } from "react";

//react bootstrap
import { Container, Row, Col } from "react-bootstrap";

//components
import CardBlogList from "../../components/cards/CardBlogList";
import DetailMetaList from "../../components/blog/DetailMetaList";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";

import { blogs } from "../../StaticData/blogs";

const BlogList = memo((props) => {
  return (
    <Fragment>
      <BreadCrumbWidget title={props.title} />
      <div className="section-padding">
        <Container>
          <Row>
            <Col lg="8" sm="12">
              {blogs.slice(0, 7).map((item, index) => {
                return (
                  <CardBlogList
                    key={index}
                    slug={item.slug}
                    title={item.title}
                    thumbnail={item.thumbnail}
                    blogDate={item.blogDate}
                    username={item.username}
                    categories={item.categories}
                    tags={item.tags}
                    description={item.description}
                  />
                );
              })}
            </Col>
            <Col lg="4" sm="12">
              <DetailMetaList></DetailMetaList>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

BlogList.displayName = "BlogList";
export default BlogList;
