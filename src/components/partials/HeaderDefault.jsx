import {
  memo,
  Fragment,
  useState,
  useEffect,
  useRef,
  createContext,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore, useUIStore, useRoyaltyStore } from "../../stores";

// react-bootstrap
import {
  Button,
  Nav,
  Collapse,
  Navbar,
  Offcanvas,
  Container,
  Dropdown,
  Modal,
  Spinner,
} from "react-bootstrap";

// react-router
import { Link, useNavigate, useLocation } from "react-router-dom";
import sessionService from "../../services/session";

// components
import Logo from "../logo";
import CustomToggle from "../CustomToggle";
import api from "../../services/api";
import { isFeatureEnabled } from "../../../config";
import { isTvodEnabled } from "../../utilities/tvodHelper";

// img
// import user_img from "/assets/images/user/user1.webp";
const user_img = `${import.meta.env.VITE_APP_IMAGE_PATH}images/user/user2.png`;
const ott = `${import.meta.env.VITE_APP_IMAGE_PATH}images/mega-menu/new-home.webp`;
const home = `${import.meta.env.VITE_APP_IMAGE_PATH}images/mega-menu/home.webp`;
const movie = `${import.meta.env.VITE_APP_IMAGE_PATH}images/mega-menu/movie.webp`;
const tvshow = `${import.meta.env.VITE_APP_IMAGE_PATH}images/mega-menu/tv-show.webp`;
const video = `${import.meta.env.VITE_APP_IMAGE_PATH}images/mega-menu/video.webp`;
const shop = `${import.meta.env.VITE_APP_IMAGE_PATH}images/mega-menu/shop-home.webp`;

const AuthContext = createContext();

const HeaderDefault = memo(({ children }) => {
  const [isMega, setIsMega] = useState(true);
  const location = useLocation();
  const [show1, setShow1] = useState(false);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const [open5, setOpen5] = useState(false);
  const [open6, setOpen6] = useState(false);
  const [open7, setOpen7] = useState(false);
  const [open8, setOpen8] = useState(false);

  // Zustand stores
  const user = useAuthStore(state => state.user);
  const displayName = useAuthStore(state => state.displayName);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const fetchUserInfo = useAuthStore(state => state.fetchUserInfo);
  const initializeAuth = useAuthStore(state => state.initialize);

  const logout = async () => {

    await sessionService.logoutSession();
    useAuthStore.getState().logout();
  };
  

  
  const dailyBonusLoading = useRoyaltyStore(state => state.isLoading);
  const dailyBonusAvailable = useRoyaltyStore(state => state.bonusAvailable);
  const showDailyBonusModal = useRoyaltyStore(state => state.showDailyBonusModal);
  const dailyBonusData = useRoyaltyStore(state => state.dailyBonusData);
  const claimDailyBonus = useRoyaltyStore(state => state.claimDailyBonus);
  const setShowDailyBonusModal = useRoyaltyStore(state => state.setShowDailyBonusModal);
  const calculateExpectedBonus = useRoyaltyStore(state => state.calculateExpectedBonus);
  const fetchRoyaltyData = useRoyaltyStore(state => state.fetchRoyaltyData);
  
  const navigate = useNavigate();



  useEffect(() => {
    if (user?.uid && isFeatureEnabled('royaltyPointsEnabled')) {
      // Fetch royalty data in background without blocking render
      setTimeout(() => fetchRoyaltyData(user.uid), 0);
    }
  }, [user?.uid]);







  const handleDailyLoginBonus = async () => {
    if (user?.uid) {
      await claimDailyBonus(user.uid);
    }
  };



  useEffect(() => {
    // Initialize auth store only once
    initializeAuth();
  }, []); // Empty dependency array to run only once
  
  useEffect(() => {
    // Fetch user info when user changes
    if (user?.uid) {
      fetchUserInfo(user.uid);
    }
  }, [user?.uid, fetchUserInfo]);

  useEffect(() => {
    setShow(false);
    
    const loadAnalyticsScript = () => {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag("js", new Date());
        gtag("config", `${import.meta.env.VITE_APP_GOOGLE_TAG_MANAGER}`);
      };
    };

    loadAnalyticsScript();

    if (isAuthenticated && user?.uid) {
      const updateTitle = () => {
        const pageTitle = document.title;
        if (window.gtag) {
          gtag("set", { user_id: user.uid, screen_name: pageTitle });
        }
      };
      setTimeout(updateTitle, 3000);
    }

    const handleScroll = () => {
      const headerSticky = document.querySelector(".header-sticky");
      if (headerSticky) {
        if (window.scrollY > 1) {
          headerSticky.classList.add("sticky");
        } else {
          headerSticky.classList.remove("sticky");
        }
      }
    };

    setIsMega(location.pathname === "/");
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location, isAuthenticated, user]); // Add location as a dependency

  return (
    <>
      <AuthContext.Provider value={{ user, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
      <Fragment>
        <Toaster />
        <header
          className={`header-center-home header-default header-sticky ${location.pathname.startsWith("/shorts") ? "header-blur" : ""}`}
        >
          <Navbar
            expand="xl"
            className="nav navbar-light iq-navbar header-hover-menu py-xl-0"
          >
            <Container fluid className="navbar-inner">
              <div className="d-flex align-items-center justify-content-between w-100 landing-header">
                <div className="d-flex gap-3 gap-xl-0 align-items-center">
                  <div>
                    <button
                      type="button"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#navbar_main"
                      aria-controls="navbar_main"
                      className="d-xl-none btn btn-primary rounded-pill p-1 pt-0 toggle-rounded-btn"
                      onClick={() => setShow1(!show1)}
                    >
                      <svg width="20px" className="icon-20" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <Logo></Logo>
                </div>
                <Navbar
                  expand="xl"
                  className={`offcanvas mobile-offcanvas nav hover-nav horizontal-nav py-xl-0 ${
                    show1 === true ? "show" : ""
                  } ${isMega ? "mega-menu-content" : ""}`}
                  style={{
                    visibility: `${show1 === true ? "visible" : "hidden"}`,
                  }}
                  id="navbar_main"
                >
                  <Container fluid className="container-fluid p-lg-0">
                    <Offcanvas.Header className="px-0" closeButton>
                      <div className="navbar-brand ms-3">
                        <Logo></Logo>
                      </div>
                    </Offcanvas.Header>
                    <ul
                      className="navbar-nav iq-nav-menu list-unstyled"
                      id="header-menu"
                    >
                      {/* <Nav.Item as="li">
                      <Link 
                        href="/"
                        aria-expanded={open}
                        onClick={() => setOpen(!open)}
                        className={`${location.pathname === "/" ||
                            location.pathname === "/home" ||
                            location.pathname === "/movies" ||
                            location.pathname === "/tv-shows" ||
                            location.pathname === "/videos" ||
                            location.pathname === "/merchandise-store"
                            ? "active"
                            : ""
                          }`}
                      >
                        <span className="item-name">Home</span>
                      </Link>
                    </Nav.Item> */}

                      <Nav.Item as="li">
                        <Link
                          to="/view-all/Category/dramas"
                          className={`nav-link ${
                            location.pathname === "/view-all/Category/dramas"
                              ? "active"
                              : ""
                          }`}
                          aria-expanded={open}
                          onClick={() => setOpen(!open)}
                        >
                          <span className="item-name">Dramas</span>
                        </Link>
                      </Nav.Item>

                      <Nav.Item as="li">
                        <Link
                          to="/view-all/Category/Telefilms"
                          aria-expanded={open}
                          className={`nav-link ${
                            location.pathname === "/view-all/Category/Telefilms"
                              ? "active"
                              : ""
                          }`}
                          onClick={() => setOpen(!open)}
                        >
                          <span className="item-name">Telefilms</span>
                        </Link>
                      </Nav.Item>

                      <Nav.Item as="li">
                        <Link
                          to="/shorts"
                          aria-expanded={open}
                          className={`nav-link ${
                            location.pathname === "/shorts" ? "active" : ""
                          }`}
                          onClick={() => setOpen(!open)}
                        >
                          <span className="item-name">Snips</span>
                        </Link>
                      </Nav.Item>

                      <Nav.Item as="li">
                        <Link
                          to="/view-all/Category/tv shows"
                          aria-expanded={open}
                          className={`nav-link ${
                            location.pathname ===
                            "/view-all/Category/tv%20shows"
                              ? "active"
                              : ""
                          }`}
                          onClick={() => setOpen(!open)}
                        >
                          <span className="item-name">Shows</span>
                        </Link>
                      </Nav.Item>

                      {/* <Nav.Item as="li">
                      <Link 
                        href="/"
                        aria-expanded={open}
                        onClick={() => setOpen(!open)}
                      >
                        <span className="item-name">News</span>
                      </Link>
                    </Nav.Item> */}

                      {/* <Nav.Item as="li">
                      <Link
                        aria-expanded={open1}
                        href="/view-all/Category/ARY%20ZAP%20EXCLUSIVE"
                        onClick={() => setOpen1(!open1)}
                        className={`${
                          location.pathname === "/related-merchandise" ||
                          location.pathname === "/restricted-content" ||
                          location.pathname === "/playlist" ||
                          location.pathname === "/geners" ||
                          location.pathname === "/cast" ||
                          location.pathname === "/tags"
                            ? "active"
                            : ""
                        }`}
                      >
                        <span className="item-name">EXCLUSIVE</span>
                         <span className="menu-icon ms-2">
                          <i
                            className="fa fa-caret-down toggledrop-desktop right-icon"
                            aria-hidden="true"
                          ></i>
                          <span className="toggle-menu">
                            <i
                              className="fa fa-plus  arrow-active text-white"
                              aria-hidden="true"
                            ></i>
                            <i
                              className="fa fa-minus  arrow-hover text-white"
                              aria-hidden="true"
                            ></i>
                          </span>
                        </span> 
                      </Link>
                      
                    </Nav.Item> */}
                      <Nav.Item as="li">
                        <Link
                          aria-expanded={open2}
                          to="/view-all/Category/live%20streaming"
                          onClick={() => setOpen2(!open2)}
                          className={`nav-link ${
                            location.pathname ===
                            "/view-all/Category/live%20streaming"
                              ? "active"
                              : ""
                          }`}
                        >
                          <span className="item-name">Streams</span>
                          {/* <span className="menu-icon ms-2">
                          <i
                            className="fa fa-caret-down toggledrop-desktop right-icon"
                            aria-hidden="true"
                          ></i>
                          <span className="toggle-menu">
                            <i
                              className="fa fa-plus  arrow-active text-white"
                              aria-hidden="true"
                            ></i>
                            <i
                              className="fa fa-minus  arrow-hover text-white"
                              aria-hidden="true"
                            ></i>
                          </span>
                        </span> */}
                        </Link>
                        {/* <Collapse in={open2} className="sub-nav list-unstyled">
                        <ul>
                          <Nav.Item as="li">
                            <Link
                              to="/about-us"
                              className={`${
                                location.pathname === "/about-us"
                                  ? "active"
                                  : ""
                              } nav-link`}
                            >
                              {" "}
                              About Us{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/contact-us"
                              className={`${
                                location.pathname === "/contact-us"
                                  ? "active"
                                  : ""
                              } nav-link`}
                            >
                              {" "}
                              Contact Us{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/faq"
                              className={`${
                                location.pathname === "/faq" ? "active" : ""
                              } nav-link`}
                            >
                              {" "}
                              FAQ{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/PrivacyPolicy"
                              className={`${
                                location.pathname === "/PrivacyPolicy"
                                  ? "active"
                                  : ""
                              } nav-link`}
                            >
                              {" "}
                              Privacy Policy{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/pricing"
                              className={`${
                                location.pathname === "/pricing" ? "active" : ""
                              } nav-link`}
                            >
                              {" "}
                              Pricing Plan{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/coming-soon"
                              className={`${
                                location.pathname === "/coming-soon"
                                  ? "active"
                                  : ""
                              } nav-link`}
                            >
                              {" "}
                              Coming Soon{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              aria-expanded={open3}
                              href="#homePages"
                              onClick={() => setOpen3(!open3)}
                              className={`${
                                location.pathname === "/error-page-one" ||
                                location.pathname === "/error-page-two"
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <span className="item-name">Error Pages</span>
                              <span className="menu-icon">
                                <i
                                  className="fa fa-caret-right toggledrop-desktop right-icon"
                                  aria-hidden="true"
                                ></i>
                                <span className="toggle-menu">
                                  <i
                                    className="fa fa-plus  arrow-active text-white"
                                    aria-hidden="true"
                                  ></i>
                                  <i
                                    className="fa fa-minus  arrow-hover text-white"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                              </span>
                            </Link>
                            <Collapse
                              in={open3}
                              className="sub-nav list-unstyled"
                            >
                              <ul>
                                <Nav.Item as="li">
                                  <Link
                                    to="/error-page-one"
                                    className={`${
                                      location.pathname === "/error-page-one"
                                        ? "active"
                                        : ""
                                    } nav-link`}
                                  >
                                    {" "}
                                    Error Page 1{" "}
                                  </Link>
                                </Nav.Item>
                                <Nav.Item as="li">
                                  <Link
                                    to="/error-page-two"
                                    className={`${
                                      location.pathname === "/error-page-two"
                                        ? "active"
                                        : ""
                                    } nav-link`}
                                  >
                                    {" "}
                                    Error Page 2{" "}
                                  </Link>
                                </Nav.Item>
                              </ul>
                            </Collapse>
                          </Nav.Item>
                        </ul>
                      </Collapse> */}
                      </Nav.Item>

                      

                     

                      {user && (
                        <Nav.Item as="li">
                          <Link
                            to="/my-list"
                            aria-expanded={open}
                            className={`nav-link ${
                              location.pathname === "/my-list" ? "active" : ""
                            }`}
                            onClick={() => setOpen(!open)}
                          >
                            <span className="item-name">My Library</span>
                          </Link>
                        </Nav.Item>
                      )}

                      {isTvodEnabled() && (
                        <Nav.Item as="li">
                          <Link
                            to="/view-all/Category/Tvod%20Exclusives"
                            aria-expanded={open}
                            className={`nav-link ${
                              location.pathname === "/view-all/Category/Tvod%20Exclusives"
                                ? "active"
                                : ""
                            }`}
                            onClick={() => setOpen(!open)}
                          >
                            <span className="item-name">Exclusive</span>
                          </Link>
                        </Nav.Item>
                      )}

                      {/* <Nav.Item as="li">
                      <Link
                        aria-expanded={open8}
                        href="#homePages"
                        onClick={() => setOpen8(!open8)}
                        className={`${
                          location.pathname === "/shop" ||
                          location.pathname === "/account" ||
                          location.pathname === "/cart" ||
                          location.pathname === "/wishlist" ||
                          location.pathname === "/checkout" ||
                          location.pathname === "/track-order"
                            ? "active"
                            : ""
                        }`}
                      >
                        <span className="item-name">Shop</span>
                        <span className="menu-icon ms-2">
                          <i
                            className="fa fa-caret-down toggledrop-desktop right-icon"
                            aria-hidden="true"
                          ></i>
                          <span className="toggle-menu">
                            <i
                              className="fa fa-plus arrow-active text-white"
                              aria-hidden="true"
                            ></i>
                            <i
                              className="fa fa-minus arrow-hover text-white"
                              aria-hidden="true"
                            ></i>
                          </span>
                        </span>
                      </Link>
                      <Collapse in={open8} className="sub-nav list-unstyled">
                        <ul>
                          <Nav.Item as="li">
                            <Link
                              to="/shop"
                              className={`${
                                location.pathname === "/shop" ? "active" : ""
                              } nav-link`}
                            >
                              {" "}
                              Shop{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/account"
                              className={`${
                                location.pathname === "/account" ? "active" : ""
                              } nav-link`}
                            >
                              {" "}
                              My Account Page{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/cart"
                              className={`${
                                location.pathname === "/cart" ? "active" : ""
                              } nav-link`}
                            >
                              {" "}
                              Cart Page{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/wishlist"
                              className={`${
                                location.pathname === "/wishlist"
                                  ? "active"
                                  : ""
                              } nav-link`}
                            >
                              {" "}
                              Wishlist Page{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/checkout"
                              className={`${
                                location.pathname === "/checkout"
                                  ? "active"
                                  : ""
                              } nav-link`}
                            >
                              {" "}
                              Checkout Page{" "}
                            </Link>
                          </Nav.Item>
                          <Nav.Item as="li">
                            <Link
                              to="/track-order"
                              className={`${
                                location.pathname === "/track-order"
                                  ? "active"
                                  : ""
                              } nav-link`}
                            >
                              {" "}
                              Order Tracking{" "}
                            </Link>
                          </Nav.Item>
                        </ul>
                      </Collapse>
                    </Nav.Item> */}
                    </ul>
                  </Container>
                </Navbar>
                <div className="right-panel">
                  <Button
                    id="navbar-toggle"
                    bsPrefix="navbar-toggler"
                    type="button"
                    aria-expanded={show}
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    onClick={() => setShow(!show)}
                  >
                    <span className="navbar-toggler-btn">
                      <span className="navbar-toggler-icon"></span>
                    </span>
                  </Button>
                  <div
                    className={`navbar-collapse ${
                      show === true ? "collapse show" : "collapse"
                    }`}
                    id="navbarSupportedContent"
                  >
                    <div className="other-menu-items mt-3">
                      <ul className="list-unstyled">
                        <li>
                          <Link
                            to="/view-all/Category/dramas"
                            className="iq-sub-card d-flex align-items-center gap-3"
                          >
                            Dramas
                          </Link>
                        </li>
                        
                        <li>
                          <Link
                            to="/view-all/Category/Telefilms"
                            className="iq-sub-card d-flex align-items-center gap-3"
                          >
                            Telefilms
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/shorts"
                            className="iq-sub-card d-flex align-items-center gap-3"
                          >
                            Snips
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/view-all/Category/tv%20shows"
                            className="iq-sub-card d-flex align-items-center gap-3"
                          >
                            Shows
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/view-all/Category/live%20streaming"
                            className="iq-sub-card d-flex align-items-center gap-3"
                          >
                            Streams
                          </Link>
                        </li>

                        {user && (
                          <>
                            <li>
                              <Link
                                to="/my-list"
                                className="iq-sub-card d-flex align-items-center gap-3"
                                onClick={() => setOpen(!open)}
                              >
                                <span className="item-name">My Library</span>
                              </Link>
                            </li>

                            <li>
                              <Link
                                to={`/shorts/liked/${user.uid}`}
                                className="iq-sub-card d-flex align-items-center gap-3"
                                onClick={() => setOpen(!open)}
                              >
                                <span className="item-name">My Snips</span>
                              </Link>
                            </li>
                          </>
                        )}
                        {isTvodEnabled() && (
                          <li>
                            <Link
                              to="/view-all/Category/Tvod%20Exclusives"
                              className="iq-sub-card d-flex align-items-center gap-3"
                            >
                              Exclusive
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                    <ul className="navbar-nav align-items-center ms-auto mb-2 mb-xl-0">
                      <li className="nav-item">
                        <button
                          onClick={() => navigate('/search')}
                          className="nav-link p-0 btn btn-link"
                          style={{ border: 'none', background: 'transparent' }}
                        >
                          <div className="btn-icon btn-sm rounded-pill btn-action">
                            <span className="btn-inner">
                              <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/search.svg`} alt="Search" />
                            </span>
                          </div>
                        </button>
                      </li>

                      {/* Daily Login Bonus Diamond Button */}
                      {user && isFeatureEnabled('royaltyPointsEnabled') && (
                        <li className="nav-item">
                          <div className="nav-link p-0">
                            <button
                              onClick={handleDailyLoginBonus}
                              disabled={dailyBonusLoading || !dailyBonusAvailable}
                              className="btn-icon btn-sm rounded-pill btn-action position-relative"
                              style={{
                                background: dailyBonusAvailable ? '#ffd700' : '#6c757d',
                                border: '2px solid #dee2e6',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <span className="btn-inner d-flex align-items-center justify-content-center">
                                {dailyBonusLoading ? (
                                  <div className="spinner-border spinner-border-sm text-white" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '1.2em' }}>
                                    💎
                                  </span>
                                )}
                              </span>
                              
                              {/* Notification badge */}
                              {dailyBonusAvailable && (
                                <span 
                                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                  style={{ fontSize: '0.6em', transform: 'translate(-50%, -50%)' }}
                                >
                                  
                                </span>
                              )}
                            </button>
                          </div>
                        </li>
                      )}

                      {user ? (
                        // ✅ Logged-in User View
                        <li className="nav-item dropdown">
                          <Dropdown>
                            <Dropdown.Toggle
                              as={CustomToggle}
                              className="nav-link d-flex align-items-center text-white gap-1"
                              style={{ background: 'transparent', border: 'none' }}
                            >
                              <div className="btn-icon">
                                <span className="btn-inner">
                                  {user.photoURL ? (
                                    <img
                                      className="avatar-img img-fluid"
                                      src={user.photoURL}
                                      alt="User Avatar"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          `${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/default-avatar.svg`;
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/default-avatar.svg`}
                                      className="user-img"
                                      alt="Default Avatar"
                                    />
                                  )}
                                </span>
                              </div>
                              <span className="avatar-text text-capitalize text-white">
                                {(() => {
                                  const name = user.displayName || displayName;
                                  return name?.length > 20 ? `${name.slice(0, 20)}...` : name;
                                })()}
                              </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="user-dropdown-menu">
                              <Dropdown.Item as={Link} to="/my-account" className="d-flex align-items-center gap-2">
                                <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/user.svg`} alt="Account" width="16" height="16" />
                                Account
                              </Dropdown.Item>
                              <Dropdown.Item onClick={logout} className="d-flex align-items-center gap-2">
                                <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/LogOut.svg`} alt="Logout" width="16" height="16" />
                                Logout
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                      ) : (
                        // ✅ Guest View
                        <li className="nav-item login headerlogin">
                          <Link
                            to="/login"
                            className="nav-link d-flex align-items-center"
                          >
                            {/* <div className="btn-icon">
                              <span className="btn-inner">
                                <img src=`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/user.svg` className="default-avatar-img" alt="Default Avatar" />
                              </span>
                            </div> */}
                            <span className="font-size-14 btn newbtn fw-500 d-inline-flex align-items-center gap-2">
  Sign In
  <i className="fas fa-chevron-right"></i>
</span>
                          </Link>
                        </li>

                        // <li className="nav-item d-flex align-items-center loginSignupLinks">
                        //   <Link to="/login?signin=true" className="nav-link d-flex align-items-center text-white p-0">
                        //     <div className="btn-icon me-1">
                        //       <span className="btn-inner">
                        //         <img src=`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/user.svg` className="default-avatar-img" alt="Default Avatar" />
                        //       </span>
                        //     </div>
                        //     <span className="font-size-14 fw-500 text-white">Login</span>
                        //   </Link>

                        //   <span className="text-white mx-1">/</span>

                        //   <Link to="/login?signup=true" className="nav-link d-flex align-items-center text-white p-0">
                        //     <span className="font-size-14 fw-500 text-white">Signup</span>
                        //   </Link>
                        // </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </Container>
          </Navbar>
        </header>

        {/* Daily Bonus Modal */}
        <Modal show={showDailyBonusModal} onHide={() => setShowDailyBonusModal(false)} size="md">
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>
              <span style={{ fontSize: '1.5em' }}>💎</span>
              <span className="ms-2">Daily Bonus Claimed!</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            {dailyBonusData && (
              <div>
                <div className="mb-4">
                  <h2 className="text-success mb-2">
                    +{dailyBonusData.bonus || dailyBonusData.baseBonus || 50} Points!
                  </h2>
                  <p className="text-muted">
                    {dailyBonusData.message || 'Daily bonus claimed successfully!'}
                  </p>
                </div>
                
                <div className="row text-center">
                  <div className="col-6">
                    <div className="p-3 border rounded">
                      <h5 className="text-primary">Base Bonus</h5>
                      <h3 className="text-primary">+{dailyBonusData.baseBonus || 50}</h3>
                      <small className="text-muted">Daily login reward</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 border rounded">
                      <h5 className="text-warning">Streak Bonus</h5>
                      <h3 className="text-warning">+{dailyBonusData.streakBonus || 0}</h3>
                      <small className="text-muted">
                        {dailyBonusData.newStreak ? `${dailyBonusData.newStreak} day streak` : 'No streak yet'}
                      </small>
                    </div>
                  </div>
                </div>
                
                {/* Show current streak info from user data */}
                <div className="mt-4 p-3 bg-primary bg-opacity-10 border border-primary rounded">
                  <h6 className="text-primary mb-2">📊 Current Streak Status</h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <strong>Current Streak:</strong><br/>
                      <span className="h5 text-primary">{dailyBonusData.currentStreak || 'N/A'} days</span>
                    </div>
                    <div className="col-6">
                      <strong>Longest Streak:</strong><br/>
                      <span className="h5 text-success">{dailyBonusData.longestStreak || 'N/A'} days</span>
                    </div>
                  </div>
                  
                  {/* Show expected streak bonus calculation */}
                  {dailyBonusData.currentStreak && (
                    <div className="mt-3 p-2 bg-info bg-opacity-10 border border-info rounded">
                      <small className="text-info">
                        <strong>Expected Streak Bonus:</strong> +{calculateExpectedBonus(dailyBonusData.currentStreak)} points
                        {dailyBonusData.currentStreak > 7 && (
                          <span> (Day {(dailyBonusData.currentStreak - 1) % 7 + 1} of 7-day cycle)</span>
                        )}
                      </small>
                    </div>
                  )}
                </div>
                
                {dailyBonusData.newStreak && dailyBonusData.newStreak > 1 && (
                  <div className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                    <h6 className="text-warning mb-2">🔥 Streak Extended!</h6>
                    <p className="mb-0">You're on a {dailyBonusData.newStreak} day streak!</p>
                  </div>
                )}
                
                {(!dailyBonusData.newStreak || dailyBonusData.newStreak <= 1) && (
                  <div className="mt-4 p-3 bg-info bg-opacity-10 border border-info rounded">
                    <h6 className="text-info mb-2">🌟 Start Your Streak!</h6>
                    <p className="mb-0">Come back tomorrow to start building your streak!</p>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => setShowDailyBonusModal(false)}>
              Awesome! 🎉
            </Button>
          </Modal.Footer>
        </Modal>
      </Fragment>
    </>
  );
});

HeaderDefault.displayName = "HeaderDefault";
export default HeaderDefault;
