import { Fragment, memo, useState } from "react";
import TeamSection from "./AboutSections/TeamSection";
import AboutSection from "./AboutSections/AboutSection";
import ContactUs from "./AboutSections/ContactUs";
import WorkSection from "./AboutSections/WorkSection";
import BreadcrumbWidget from "../../components/BreadcrumbWidget";
import { Helmet } from "react-helmet";

const AboutPage = memo(() => {
  const [title, setTitle] = useState("ARY PLUS - About Us");
  return (
    <Fragment>
      <Helmet>
        <title>{`${title}`}</title>
      </Helmet>
      <BreadcrumbWidget title="About Us" />

      <AboutSection></AboutSection>
      {/* <TeamSection></TeamSection>
      <ContactUs></ContactUs> */}
      {/* <WorkSection></WorkSection> */}
    </Fragment>
  );
});

AboutPage.displayName = "AboutPage";
export default AboutPage;
