import { Triangle } from "react-loader-spinner";
import { Fragment, memo } from "react";

const Loader = memo(() => {
  return (
    <Fragment>
      {/* <div className="spinner-overlay">
      <Triangle
        visible={true}
        height="80"
        width="80"
        color="#6BFE12"
        ariaLabel="triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
        />
        
    </div> */}
    </Fragment>
  );
});

Loader.displayName = "Loader";
export default Loader;
