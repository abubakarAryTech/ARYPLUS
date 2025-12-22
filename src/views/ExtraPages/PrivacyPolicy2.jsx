import React, { Fragment, memo, useState } from "react";
import { Container } from "react-bootstrap";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";
import { Helmet } from "react-helmet";

const TermsofUse = memo(() => {
  const [title, setTitle] = useState("ARY PLUS - Privacy Policy");
  return (
    <Fragment>
      <Helmet>
        <title>{`${title}`}</title>
      </Helmet>
      <BreadCrumbWidget title="Privacy Policy" />
      <div className="section-padding paddingLeftRight">
        <Container>
          <div className="title-box text-block">
            {/* <h4 className="mb-4">Privacy Policy</h4>  */}
            <p>
              This privacy policy covers the information about ARY PLUS; all the
              personal information of the users is collected if the users
              register with the website for any of the programs. The information
              is saved and only used for the registration purpose.
            </p>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

export default TermsofUse;
