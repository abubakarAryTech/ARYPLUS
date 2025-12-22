import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function SharePopup({ url, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500); // Matches animation duration
  };

  const handleShareClick = (e, shareUrl) => {
    e.preventDefault();
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    handleClose(); // Auto-close after click
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      // alert("Link copied to clipboard!");
      handleClose(); // Auto-close after copy
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1049,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`modern-share-popup ${isClosing ? "animate-out" : "animate-in"} share-popup-center`}
      >
        <div className="right mb-2 d-flex justify-content-end">
          <button
            onClick={handleClose}
            className="btn-close btn-sm text-black"
            aria-label="Close"
          ></button>
        </div>

        <h6
          className="text-center mb-4"
          style={{ fontSize: "22px", fontWeight: "600" }}
        >
          Share Using...
        </h6>

        {/* Share Icons */}

        <div className="d-flex flex-wrap gap-3 mb-3 justify-content-center">
          <Link
            href={`https://twitter.com/intent/tweet?url=${url}`}
            onClick={(e) =>
              handleShareClick(e, `https://twitter.com/intent/tweet?url=${url}`)
            }
            className="share-icon text-center"
          >
            <img
              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/share/twitter.svg`}
              alt="Twitter"
              width="30"
            />
            {/* <div className="small mt-1">Twitter</div> */}
          </Link>

          <Link
            href={`https://wa.me/?text=${url}`}
            onClick={(e) => handleShareClick(e, `https://wa.me/?text=${url}`)}
            className="share-icon text-center"
          >
            <img
              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/share/whatsapp.svg`}
              alt="WhatsApp"
              width="30"
            />
            {/* <div className="small mt-1">WhatsApp</div> */}
          </Link>

          <Link
            href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
            onClick={(e) =>
              handleShareClick(
                e,
                `https://www.facebook.com/sharer/sharer.php?u=${url}`,
              )
            }
            className="share-icon text-center"
          >
            <img
              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/share/facebook.svg`}
              alt="Facebook"
              width="30"
            />
            {/* <div className="small mt-1">Facebook</div> */}
          </Link>

          {/* <div onClick={copyToClipboard} className="share-icon text-center" style={{ cursor: "pointer" }}>
        <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/social/copy.svg`} alt="Copy" width="40" />
        <div className="small mt-1">Copy</div>
      </div> */}
        </div>

        {/* Copy Link Box */}
        <div
          className="input-group"
          style={{ border: "1px solid rgba(0, 0, 0, 0.2)" }}
        >
          <input
            type="text"
            className="form-control form-control-sm border-0"
            value={url}
            readOnly
            style={{ fontSize: "14px", background: "white", color: "black" }}
          />
          <button
            className="btn btn-sm"
            type="button"
            onClick={copyToClipboard}
          >
            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/share/copyv2.svg`} alt="Copy" width="16" />
          </button>
        </div>
      </div>
    </div>
  );
}
