import React, { memo } from "react";

// import { ToastContainer, toast, Slide } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { Bling as GPT } from "react-gpt";
import { useWindowSize } from "../hooks/useWindowSize";
GPT.enableSingleRequest();

const Mrec = memo(() => {
  const { width, height } = useWindowSize();
  // const closeAfter8 = () => toast(
  //   <GPT
  //     adUnitPath="/67551462/ARYDigital-3rdfold_Lrec"
  //     slotSize={[[300, 250], [336, 280]]}
  //   />
  // );

  // useEffect(() => {

  //   closeAfter8();

  // })

  return (
    <>
      <div className="mtb-8">
        {width > 768 ? (
          <>
            {/* <h1>Dektop</h1> */}
            <center>
              {/* <img src="https://tpc.googlesyndication.com/simgad/1282282443567809860"/> */}
              {/* <GPT
                            adUnitPath="/67551462/aryzap-mrec"
                            slotSize={[[300, 600], [120, 600], [160, 600], [300, 250], 'fluid']}
                        /> */}
            </center>
          </>
        ) : (
          <>
            {/* <h1>Mobile</h1> */}
            <center>
              {/* <GPT
                            adUnitPath="/67551462/aryzap-mrec"
                            slotSize={[[250, 250], [300, 250], 'fluid', [320, 50]]}
                        /> */}
            </center>
          </>
        )}
      </div>
    </>
  );
});

Mrec.displayName = "Mrec";
export default Mrec;
