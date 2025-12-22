import React from "react";
import styles from "../../views/Shorts/Shorts.module.css";
import { Link, useLocation } from "react-router-dom";

const ShortsSidebar = ({ user }) => {
  const location = useLocation();
  const userId = user?.uid || "";

  return (
    <aside>
      <ul className={styles["user-nav"]}>
        <Link to="/shorts">
          <li
            className={`${location.pathname === "/shorts" ? styles.active : ""}`}
          >
            <ion-icon name="planet-outline"></ion-icon>
            <span>Explore</span>
          </li>
        </Link>

        <Link to={userId ? `/shorts/liked/${userId}` : `/login`}>
          <li
            className={`${location.pathname.startsWith("/shorts/liked") ? styles.active : ""}`}
          >
            <img
              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/like-shorts.svg`}
              style={{ width: "20px", marginRight: "12px" }}
              alt={"Liked"}
            />
            <span>Liked</span>
          </li>
        </Link>
      </ul>

      <footer>
        <small>© 2025 aryzap</small>
      </footer>
    </aside>
  );
};

export default ShortsSidebar;
