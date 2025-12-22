import React, { memo, Fragment } from "react";

import { useParams, useLocation } from "react-router-dom";

import queryString from "query-string";

// react-bootstrap
import { Container, Table, Row, Col } from "react-bootstrap";

// Components
import BreadCrumbWidget from "../../components/BreadcrumbWidget";

const TrackOrder = memo(() => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { subscription_name, date, payment_mode, exp_date } = queryParams;
  return (
    <Fragment>
      <BreadCrumbWidget title="Thank You" />
      <section className="section-padding">
        <Container>
          <div className="order">
            <p className="thank">
              Thank you. Your Subscription Payment has been Successfull.
            </p>
            {subscription_name && date && payment_mode && exp_date && (
              <ul className="details list-inline">
                <li className="detail">
                  EMAIL:<strong>jondoe@gmail.com</strong>
                </li>
                <li className="detail">
                  SUBSCRIPTION NAME:<strong>{subscription_name}</strong>
                </li>
                <li className="detail">
                  SUBSCRIPTION DATE:<strong>{date}</strong>
                </li>
                <li className="detail">
                  EXPIRY DATE:<strong>{exp_date}</strong>
                </li>
                <li className="detail">
                  PAYMENT METHOD:<strong>{payment_mode}</strong>
                </li>
              </ul>
            )}
          </div>
        </Container>
      </section>
    </Fragment>
  );
});

TrackOrder.displayName = "TrackOrder";
export default TrackOrder;
