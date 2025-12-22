import { memo, useState } from "react";
const AboutSection = memo(() => {
  return (
    <section className="section-padding paddingLeftRight">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-sm-12">
            <div className="px-2 text-block">
              {/* <h2>Masterminds Team</h2> */}
              <p className="mb-3 ">
                Ary PLUS is a video streaming platform where you can watch
                dramas, comedy shows, TV shows like Jeeto Pakistan, the latest
                sports news, video songs, and trailers of hit Pakistani movies —
                all in HD quality.
              </p>
              <p className="mb-3">
                Our mission is to provide top quality and fast streaming to our
                users. Enjoy streaming at home, outside, or while traveling with
                Ary PLUS. You no longer need to stay home for fast streaming like
                traditional TV — Ary PLUS is your online cinema.
              </p>
              <p className="mb-0">
                It's not just for desktop users — stream on your mobile, tablet,
                or iPad through our mobile app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";
export default AboutSection;
