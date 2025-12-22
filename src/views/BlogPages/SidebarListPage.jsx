import React, { Fragment, memo, useEffect } from "react";

// import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

// react-bootstrap
import { Container, Row, Col } from "react-bootstrap";

//route
import { useParams } from "react-router-dom";

// Components
import DetailMetaList from "../../components/blog/DetailMetaList";
import CardBlogGrid from "../../components/cards/CardBlogGrid";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";

//static data
import { blogsGrid } from "../../StaticData/blogs";

const SidebarList = memo(() => {
  let _class, title;
  const { position } = useParams();

  switch (position) {
    case "left":
      _class = "flex-lg-row-reverse";
      title = "Left SideBar";
      break;
    case "right":
      _class = " ";
      title = "Right SideBar";
      break;

    default:
      break;
  }

  return (
    <Fragment>
      <BreadCrumbWidget title={title} />
      <div className="section-padding">
        <Container>
          <Row className={_class}>
            <Col lg="8" sm="12">
              {blogsGrid.slice(0, 10).map((item, index) => {
                return (
                  <CardBlogGrid
                    key={index}
                    title={item.title}
                    slug={item.slug}
                    thumbnail={item.thumbnail}
                    tags={item.tags}
                    username={item.username}
                    description={item.description}
                    date={item.blogDate}
                    categories={item.categories}
                  ></CardBlogGrid>
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

SidebarList.displayName = "SidebarList";
export default SidebarList;
