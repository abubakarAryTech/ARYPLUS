import { Fragment, memo, useState } from "react";

import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

import { Col, Row } from "react-bootstrap";

import { Link } from "react-router-dom";

import RatingStar from "../rating-star";
import ProductModal from "../merchandise/ProductModal";

const CardShopListView = memo((props) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const cartSwal = () => {
    Swal.fire({
      title: "Added!",
      text: "Your item has been added to the cart.",
      icon: "success",
      confirmButtonText: "Ok",
      background: "#141314",
      color: "#ffffff",
    });
  };
  const wishlistSwal = () => {
    Swal.fire({
      title: "Added!",
      text: "Your item has been added to the wishlist.",
      icon: "success",
      confirmButtonText: "Ok",
      background: "#141314",
      color: "#ffffff",
    });
  };
  const isSale = props.is_sale;
  const isNew = props.is_new;

  return (
    <Fragment>
      <Col>
        <div className="product-block product-list">
          <Row>
            <Col md="4" className="ps-0">
              {isSale ? (
                <span className="onsale bg-primary">Sale!</span>
              ) : isNew ? (
                <span className="onsale bg-dark">New!</span>
              ) : (
                ""
              )}
              <div className="image-wrap">
                <Link to="/product-detail">
                  <div className="product-image">
                    <img
                      src={props.thumbnail}
                      className="img-fluid w-100"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="buttons-holder">
                  <ul className="list-unstyled m-0 p-0">
                    <li>
                      <Link className="sq-btn" to="#}" onClick={handleShow}>
                        <i className="fa fa-eye" aria-hidden="true"></i>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </Col>
            <Col lg="8" md="8">
              <div className="product-caption">
                <h5 className="product__title">
                  <Link to="/product-detail" className="product-title-link">
                    {props.product_name}
                  </Link>
                </h5>
                <div className="price-detail">
                  <span className="price">
                    <del>{props.price}</del> {props.final_price}
                  </span>
                </div>
                <div className="container-rating">
                  <div className="star-rating text-primary">
                    <RatingStar
                      count={props.rating}
                      count1={props.count1}
                      starColor="text-warning"
                    />
                  </div>
                </div>
                <ul className="iq-button-holder list-inline d-flex flex-wrap gap-3">
                  <li>
                    <div className="iq-button">
                      <Link
                        to="#"
                        className="btn btn-sm cart-btn text-uppercase position-relative"
                        onClick={cartSwal}
                      >
                        <span className="button-text">add to cart</span>
                        <i className="fa-solid fa-play"></i>
                      </Link>
                    </div>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="add_to_wishlist wishlist-btn"
                      onClick={wishlistSwal}
                    >
                      <i className="far fa-heart"></i>
                    </Link>
                  </li>
                </ul>
                <p className="blog-desc line-count-2">
                  There are many variations of passages of Lorem Ipsum
                  available, but the majority have suffered alteration in some
                  form, by injected humour, or randomised words which don’t look
                  even slightly believable.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </Col>
      <ProductModal show={show} handleClose={handleClose} />
    </Fragment>
  );
});

CardShopListView.displayName = "CardShopListView";
export default CardShopListView;
