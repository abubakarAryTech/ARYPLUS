import {
  memo,
  Fragment,
  Suspense,
  useState,
  useEffect,
  useRef,
  lazy,
} from "react";
import { Outlet, useLocation } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";

// Import header directly (critical component - no lazy loading)
import HeaderDefault from "../components/partials/HeaderDefault";
import HeaderMerchandise from "../components/merchandise/partials/HeaderDefault";

// Lazy load footer components only (less critical)
const FooterDefault = lazy(
  () => import("../components/partials/FooterDefault"),
);
const MerchandiseFooter = lazy(
  () => import("../components/merchandise/partials/FooterDefault"),
);

// Utility for debouncing scroll events
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const FrontendLayout = memo((props) => {
  const [animationClass, setAnimationClass] = useState("animate__fadeIn");
  const loadingBarRef = useRef(null);
  const location = useLocation();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Debounced scroll handler
  const handleScroll = debounce(() => {
    if (document.documentElement.scrollTop > 250) {
      setAnimationClass("animate__fadeIn");
    } else {
      setAnimationClass("animate__fadeOut");
    }
  }, 100);



  // Scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Loading bar effect on route change
  useEffect(() => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart();
      const timer = setTimeout(() => {
        loadingBarRef.current.complete();
      }, 300); // Reduced timing for faster completion
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <Fragment>
      <LoadingBar
        className="custom-loading-bar"
        ref={loadingBarRef}
        height={3}
      />
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {props.HeaderMega === "true" && <HeaderDefault />}
        {props.HeaderMerchandise === "true" && <HeaderMerchandise />}

        <main className="main-content" style={{ flexGrow: 1 }}>
          <Suspense fallback={<div className="react-load"></div>}>
            <div key={location.pathname}>
              <Outlet />
            </div>
          </Suspense>
        </main>

        <Suspense fallback={<div className="react-load"></div>}>
          {props.FooterMerchandise === "true" ? (
            <MerchandiseFooter />
          ) : (
            <FooterDefault />
          )}
        </Suspense>
      </div>
    </Fragment>
  );
});

FrontendLayout.displayName = "FrontendLayout";
export default FrontendLayout;
