import { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";
import ShareLink from "react-facebook-share-link";

import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";

import { FacebookIcon, TwitterIcon, WhatsappIcon } from "react-share";


import { useWatchlist } from "../../hooks/useWatchlist";

import axios from "axios";

const CardStyleWithRemove = memo(
  ({ title, movieTime, watchlistLink, link, image, seriesType, id }) => {

    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const baseLink = window.location.origin;
    const { remove } = useWatchlist();

    const copyLinkToClipboard = (link) => {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Copied!");
    };

    const removeFavourite = useCallback(async () => {
      if (isLoading) return;
      setIsLoading(true);
      await remove(id);
      setIsLoading(false);
    }, [id, isLoading, remove]);
    return (
      <>
        <div className="iq-card card-hover">
          <div className="block-images position-relative w-100">
            <div className="img-box w-100">
              <Link
                to={link}
                className="position-absolute top-0 bottom-0 start-0 end-0"
              ></Link>
              <img
                src={image}
                alt={title}
                className="img-fluid object-cover w-100 d-block border-0"
              />
            </div>
            {/* <div className="card-description with-transition">
          <div className="cart-content">
            <div className="content-left">
              <h5 className="iq-title text-capitalize">
                <Link to={link}>{title}</Link>
              </h5>
              <div className="movie-time d-flex align-items-center my-2">
                <span className="movie-time-text font-normal">{movieTime}</span>
              </div>
            </div>
            <div className="watchlist">
              <Link className="watch-list-not" to={watchlistLink}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-10"
                >
                  <path
                    d="M12 4V20M20 12H4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                <span className="watchlist-label">Watchlist</span>
              </Link>
            </div>
          </div>
        </div> */}
            <div className="block-social-info align-items-center">
              <ul className="p-0 m-0 d-flex gap-2 music-play-lists">
                <li className="share position-relative d-flex align-items-center text-center mb-0">
                  <span className="w-100 h-100 d-inline-block bg-transparent">
                    <i className="fas fa-share-alt"></i>
                  </span>
                  <div className="share-wrapper">
                    <div className="share-boxs d-inline-block">
                      <svg
                        width="15"
                        height="40"
                        className="share-shape"
                        viewBox="0 0 15 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14.8842 40C6.82983 37.2868 1 29.3582 1 20C1 10.6418 6.82983 2.71323 14.8842 0H0V40H14.8842Z"
                          fill="#191919"
                        ></path>
                      </svg>
                      <div className="overflow-hidden">
                        <FacebookShareButton url={baseLink + link}>
                          <FacebookIcon size={22} round={true} />
                        </FacebookShareButton>
                        <TwitterShareButton url={baseLink + link}>
                          <TwitterIcon size={22} round={true} />
                        </TwitterShareButton>
                        <WhatsappShareButton url={baseLink + link}>
                          <WhatsappIcon size={22} round={true} />
                        </WhatsappShareButton>
                        <Link
                          onClick={() => copyLinkToClipboard(baseLink + link)}
                        >
                          <i className="fas fa-link"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="share position-relative d-flex align-items-center text-center mb-0">
                  <span
                    className="w-100 h-100 d-inline-block bg-transparent remove-icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop event bubbling
                      removeFavourite();
                    }}
                  >
                    <i className="fa-solid fa-xmark text-white"></i>
                  </span>
                </li>
              </ul>
              <div className="iq-button">
                <Link
                  to={link}
                  className="btn text-uppercase position-relative rounded-circle"
                >
                  <i className="fa-solid fa-play ms-0"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
);

CardStyleWithRemove.displayName = "CardStyleWithRemove";
export default CardStyleWithRemove;
