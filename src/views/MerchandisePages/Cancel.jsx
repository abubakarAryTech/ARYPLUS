import React, { memo, Fragment } from "react";

// react-bootstrap
import { Container, Table, Row, Col } from "react-bootstrap";

// Components
import BreadCrumbWidget from "../../components/BreadcrumbWidget";

const TrackOrder = memo(() => {
  return (
    <Fragment>
      <BreadCrumbWidget title="Payment Cancel" />
      <section className="section-padding">
        <Container>
          <div className="order">
            <p className="thank">
              Unfortunately, Your Payment Request is unsuccessfull.
            </p>
          </div>
        </Container>
      </section>
    </Fragment>
  );
});

TrackOrder.displayName = "TrackOrder";
export default TrackOrder;
