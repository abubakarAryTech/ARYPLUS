import React, { memo } from "react";
import { useWindowSize } from "../hooks/useWindowSize";
import { Bling as GPT } from "react-gpt";

// import { Bling as GPT } from "react-gpt";

export default function LeaderboardInner() {
  const { width, height } = useWindowSize();

  return (
    <>
      <div className="mtb-8">
        {width > 768 ? (
          <>
            <center>
              {/* <img src="https://tpc.googlesyndication.com/simgad/5923019651109879345"/> */}
              {/* <h1>Dektop</h1> */}
              {/* <GPT
              adUnitPath="/67551462/ARYZAP-RoS-LB"
              slotSize={[[460, 60], [728, 90], [970, 90], [970, 250]]}
            /> */}
            </center>
            {/* <div style={{ width: '100%', margin: 0, padding: 0, textAlign: 'center', justifyContent: 'center center' }}>
      <iframe
        src="https://aryzap.com/ads/desktop.html"
        style={{
          width: '100%',
          minHeight: '270px',  // Set a minimum height to prevent cropping
          border: 'none',
          overflowY: 'auto',    // Allows vertical scrollbars if content overflows
          display: 'block',
          margin: '0 auto',
        }}
        title="Full-Screen Ad"
      />
      </div> */}
          </>
        ) : (
          <>
            {/* <h1>Mobile</h1> */}
            <center>
              {/* <GPT
                            adUnitPath="/67551462/ARYZAP-Mobile-RoS-LB"
                            slotSize={[[320, 100], [320, 50]]}
                        /> */}
            </center>
            {/* <div style={{ width: '100%', margin: 0, padding: 0, textAlign: 'center', justifyContent: 'center center', overflow: 'hidden' }}>
      <iframe
        src="https://aryzap.com/ads/mobile.html"
        style={{
          width: '100%',
          minHeight: '110px',  // Set a minimum height to prevent cropping
          border: '0',
          overflow: 'hidden',
          display: 'block',
          margin: '0 auto',
        }}
        title="Full-Screen Ad"
      />
    </div> */}
          </>
        )}
      </div>
    </>
  );
}
