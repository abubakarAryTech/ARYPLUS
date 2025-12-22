import { memo, useState } from "react";
import ProfileCard2 from "../../../components/cards/ProfileCard2";
// import { generateImgPath } from "../../../StaticData/data";
const TeamSection = memo(() => {
  const [lists] = useState([
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/team1.webp`,
      designation: "ceo",
      name: "Tonny Smith",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/team2.webp`,
      designation: "Designer",
      name: "Barry Tech",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/team3.webp`,
      designation: "Developer",
      name: "kep John",
    },
    {
      image: `${import.meta.env.VITE_APP_IMAGE_PATH}images/pages/team4.webp`,
      designation: "Designer",
      name: "Monty Rock",
    },
  ]);
  return (
    <section className="section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-sm-12">
            <div className="title-box text-center">
              <h2>Masterminds Team</h2>
              <p className="mb-0">
                Your ARY PLUS is build by one of the best and well experienced
                web developers.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row about-us-detail">
          {lists.map((data, index) => (
            <div key={index} className="col-md-3">
              <ProfileCard2
                name={data.name}
                designation={data.designation}
                image={data.image}
              ></ProfileCard2>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

TeamSection.displayName = "TeamSection";
export default TeamSection;
