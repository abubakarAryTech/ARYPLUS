import React, { memo } from "react";
import { useWindowSize } from "../hooks/useWindowSize";
import { Bling as GPT } from "react-gpt";

// import { Bling as GPT } from "react-gpt";

const MrecHome = memo(() => {
  const { width, height } = useWindowSize();

  return (
    <>
      <div className="mtb-8">
        {width > 768 ? (
          <>
            <center>
              {/* <h1>Dektop</h1> */}
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

MrecHome.displayName = "MrecHome";
export default MrecHome;
