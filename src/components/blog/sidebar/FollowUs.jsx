import React, { Fragment, memo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

import { getConfig } from "../../../../config.js";

const FollowUs = memo((props) => {
  const config = getConfig();
  const heading = props.heading;
  const seriesId = props.seriesId;
  const currentURL = window.location.href;
  const baseLink = window.location.origin;

  const shareLink = config.sharingURI + seriesId;
  const copyLinkToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Copied!");
  };
  return (
    <Fragment>
      <div className="widget">
        <h5 className="widget-title position-relative"> {heading}</h5>
        <ul className="p-0 m-0 list-unstyled widget_social_media">
          {shareLink ? (
            <>
              <li>
                <FacebookShareButton url={shareLink}>
                  <FacebookIcon size={37} round={true} />
                </FacebookShareButton>
              </li>
              {/* <li> */}
              {/* <Link to={shareLink} className='position-relative'>
                    <i className="fab fa-facebook"></i>
                    </Link> */}
              {/* </li> */}
              <li>
                <TwitterShareButton url={shareLink}>
                  <TwitterIcon size={37} round={true} />
                </TwitterShareButton>
                {/* <Link to={shareLink} className='position-relative'>
                    <i className="fab fa-twitter"></i>
                        </Link> */}
              </li>

              <li>
                {/* <Link to={shareLink} className='position-relative'>
                    <i className="fab fa-whatsapp"></i>
                        </Link> */}
                <WhatsappShareButton url={shareLink}>
                  <WhatsappIcon size={37} round={true} />
                </WhatsappShareButton>
              </li>

              <li>
                {/* <a onClick={() => copyLinkToClipboard(shareLink)} className='position-relative'>
                            <i className="fas fa-link"></i>
                        </a> */}
                <Link onClick={() => copyLinkToClipboard(shareLink)}>
                  <i className="fas fa-link"></i>
                </Link>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    </Fragment>
  );
});

export default FollowUs;
