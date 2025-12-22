import { Fragment, memo, useState } from "react";
import TeamSection from "./AboutSections/TeamSection";
import AboutSection from "./AboutSections/AboutSection";
import ContactUs from "./AboutSections/ContactUs";
import WorkSection from "./AboutSections/WorkSection";
import BreadcrumbWidget from "../../components/BreadcrumbWidget";
import { Helmet } from "react-helmet";

const DownloadApps = memo(() => {
  const [title, setTitle] = useState("ARY PLUS - About Us");
  return (
    <Fragment>
      <Helmet>
        <title>{`${title}`}</title>
      </Helmet>
      <BreadcrumbWidget title="Download ARY ZAP on" />

      {/* <AboutSection></AboutSection> */}
      <div className="download-apps-page">
        
        <div className="download-apps-badges">
          <a href="https://play.google.com/store/apps/details?id=com.release.arylive" target="_blank" rel="noopener noreferrer">
            <img
              src={"/assets/images/download-playstore.png"}
              alt="Get it on Google Play"
              className="download-apps-badge-img"
            />
          </a>
          <a href="https://apps.apple.com/cy/app/ary-zap/id1475260911" target="_blank" rel="noopener noreferrer">
            <img
              src={"assets/images/download-appstore.png"}
              alt="Download on the App Store"
              className="download-apps-badge-img"
            />
          </a>
        </div>
        {/* <img
          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
          alt="ARYZAP Logo"
          className="download-apps-logo"
          style={{ marginBottom: '2rem', width: '160px', height: 'auto', display: 'block' }}
        /> */}
      </div>
      {/* <TeamSection></TeamSection>
      <ContactUs></ContactUs> */}
      {/* <WorkSection></WorkSection> */}
    </Fragment>
  );
});

DownloadApps.displayName = "DownloadApps";
export default DownloadApps;
