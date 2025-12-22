import React, { memo, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bling as GPT } from "react-gpt";

export default function Catfish() {
  const closeAfter15 = () =>
    toast(
      <GPT
        adUnitPath="/67551462/Catfish-Videos-Digital_728x90"
        slotSize={[
          [728, 90],
          [468, 60],
        ]}
      />,
    );

  useEffect(() => {
    // const count = 0;

    closeAfter15();
  });

  return (
    <>
      <div>
        {/* <button onload={closeAfter15}>Close after 15 seconds</button>
      <button onClick={closeAfter7}>Close after 7 seconds</button> */}

        <ToastContainer
          position="bottom-center"
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          autoClose={5000}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={1}
        />
      </div>
    </>
  );
}
