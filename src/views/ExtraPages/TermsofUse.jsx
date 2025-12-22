import React, { Fragment, memo, useState } from "react";
import { Container } from "react-bootstrap";
import BreadCrumbWidget from "../../components/BreadcrumbWidget";
import { Helmet } from "react-helmet";

const TermsofUse = memo(() => {
  const [title] = useState("ARY PLUS - Terms & Conditions");

  return (
    <Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <BreadCrumbWidget title="Terms & Conditions" />
      <div className="section-padding paddingLeftRight">
        <Container>
          <div className="title-box text-block">
            <ul className="ps-3">
              <li className="mb-3">
                <strong>User Registration:</strong> To access the services of
                ARY PLUS, users must register on the ARY PLUS platform.
                Registration is mandatory to enjoy the full range of features
                and streaming services.
              </li>
              <li className="mb-3">
                <strong>Age Restrictions:</strong> ARY PLUS services are not
                recommended for use by children without the involvement and
                approval of a parent or guardian. By using the platform, users
                confirm they meet the age requirements or have appropriate
                supervision.
              </li>
              <li className="mb-3">
                <strong>Intellectual Property and Copyright:</strong> All
                content on ARY PLUS, including but not limited to videos,
                graphics, logos, scripts, and sounds, is the exclusive property
                of ARY PLUS. These materials are protected by copyright and
                trademark laws. Copying, downloading, reproducing, or
                distributing any part of this content without permission is
                strictly prohibited.
              </li>
              <li className="mb-3">
                <strong>Legal Agreement:</strong> This document is an electronic
                record governed by the applicable information and rules for
                users. It does not require a physical or digital signature and
                constitutes a legal agreement between you (the user) and ARY
                Plus. If you do not agree to these terms and conditions, you are
                not entitled to use the services provided on this website.
              </li>
              <li className="mb-3">
                <strong>Acceptance of Terms:</strong> By visiting the ARY PLUS
                website or using any of its services, you are agreeing to these
                terms and conditions. All content viewed on the website is
                copyrighted material, and may not be used by anyone without
                explicit permission from ARY PLUS.
              </li>
              <li className="mb-3">
                <strong>Prohibited Use of Content:</strong> Users acknowledge
                and agree not to use ARY PLUS's content (in video or text form)
                in the following ways, directly or indirectly:
                <ul className="ps-4 pt-2">
                  <li className="mb-1">Download</li>
                  <li className="mb-1">Capture</li>
                  <li className="mb-1">Reproduce</li>
                  <li className="mb-1">Duplicate</li>
                  <li className="mb-1">Archive</li>
                  <li className="mb-1">Distribute</li>
                  <li className="mb-1">Upload</li>
                  <li className="mb-1">Publish</li>
                  <li className="mb-1">Modify</li>
                  <li className="mb-1">Translate</li>
                  <li className="mb-1">Broadcast</li>
                  <li className="mb-1">Perform</li>
                  <li className="mb-1">Display</li>
                  <li className="mb-1">Sell</li>
                  <li className="mb-1">Transmit or retransmit</li>
                  <li className="mb-1">Create derivative works or materials</li>
                </ul>
                <div className="pt-2">
                  Any such action is strictly prohibited.
                </div>
              </li>
              <li className="mb-3">
                <strong>User Interaction and Content Sharing:</strong> Users may
                have the opportunity to:
                <ul className="ps-4 pt-2">
                  <li className="mb-1">View content</li>
                  <li className="mb-1">Share content</li>
                  <li className="mb-1">Post comments</li>
                  <li className="mb-1">
                    Engage with other features as permitted
                  </li>
                </ul>
                <div className="pt-2">
                  However, you agree not to misuse the content. If any content
                  is allowed to be streamed or downloaded, it must not be sold,
                  transferred, or uploaded to any other platform or software.
                </div>
              </li>
              <li className="mb-3">
                <strong>Comment Moderation:</strong> Users may post comments
                where allowed, but ARY PLUS reserves the right to moderate or
                remove any comment at its discretion. If you wish to raise a
                concern or file a complaint regarding content posted on the
                website, please contact:
                <br />
                <strong>Email:</strong>{" "}
                <a href="mailto:web@aryservices.com">web@aryservices.com</a>
                <br />
                Include your full name and a detailed description of the
                objectionable content.
              </li>
              <li className="mb-3">
                <strong>Contact Information:</strong> If you have any questions
                or concerns regarding these Terms & Conditions, please contact
                us at:
                <br />
                <strong>Email:</strong>{" "}
                <a href="mailto:support@aryplus.com">support@aryplus.com</a>
              </li>
            </ul>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

export default TermsofUse;
