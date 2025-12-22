import React, { memo } from "react";
import { Bling as GPT } from "react-gpt";
import { useWindowSize } from "../hooks/useWindowSize";

GPT.enableSingleRequest();

const Leaderboard = memo(() => {
  const { width } = useWindowSize();

  return (
    <div className="mtb-8">
      {width > 768 ? (
        <center>
          {/* <img src="https://tpc.googlesyndication.com/simgad/5923019651109879345"/> */}
          {/* <GPT
          adUnitPath="/67551462/ARYZAP-LB"
          slotSize={[[970, 90], [728, 90], [970, 250]]}
        /> */}
        </center>
      ) : (
        <center>
          {/* <GPT
          adUnitPath="/67551462/aryzap-mobile-LB"
          slotSize={[320, 100]}
        /> */}
        </center>
      )}
    </div>
  );
});

Leaderboard.displayName = "Leaderboard";

export default Leaderboard;
