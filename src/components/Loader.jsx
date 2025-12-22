import { Fragment, memo } from "react";

// ORIGINAL CODE - Uncomment when animation gif is ready
// const LoaderGif = `${import.meta.env.VITE_APP_IMAGE_PATH}images/loader.gif`;

const Loader = memo(() => {
  return (
    <Fragment>
      <div
        className="loader simple-loader animate__animated"
        style={{ background: "rgba(31, 31, 31, 1)" }}
      >
        {/* ORIGINAL CODE - Uncomment when animation gif is ready */}
        {/* <div className="loader-body">
          <img src={LoaderGif} alt="loader" className="img-fluid" width="200" />
        </div> */}

        {/* TEMPORARY - ARY Plus Logo */}
        <div className="loader-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <img 
            src="https://images.aryzap.com/images/ARYPlus-light-logo.png" 
            alt="ARY Plus Logo" 
            width="120" 
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
            }
          `}</style>
        </div>
      </div>
    </Fragment>
  );
});

Loader.displayName = "Loader";
export default Loader;
