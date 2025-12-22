import FrontendLayout from "../layouts/FrontendLayout";
import OTTPage from "../views/MainPages/OTTPage";
import TvShowsList from "../views/MainPages/TvShowsPage";
import TvShowsDetail from "../views/TvShows/DetailPage";
import LatestEpisodes from "../views/TvShows/EpisodePage";
import MoviePage from "../views/MainPages/MoviesPage";
import MovieDetail from "../views/Movies/DetailPage";
import VideoList from "../views/MainPages/VideosPage";
import Playlist from "../views/Playlist";
import GenresPage from "../views/GenresPage";
import TagsPage from "../views/TagsPage";
import MyList from "../views/MyList";
import CastList from "../views/Cast/ListPage";
import DetailPage from "../views/Cast/DetailPage";
import CastViewAll from "../views/Cast/ViewAll";
import BlogList from "../views/BlogPages/ListPage";
import BlogDetail from "../views/BlogPages/DetailPage";
import BlogGrid from "../views/BlogPages/GridList";
import Blogtemplate from "../views/BlogPages/Blogtemplate";
import BlogSingle from "../views/BlogPages/BlogSingle";
import SidebarList from "../views/BlogPages/SidebarListPage";
import AboutPage from "../views/ExtraPages/AboutPage";
import ContactPage from "../views/ExtraPages/ContactPage";
import FAQPage from "../views/ExtraPages/FAQPage";
import PrivacyPolicy from "../views/ExtraPages/PrivacyPolicy";
import PrivacyPolicy2 from "../views/ExtraPages/PrivacyPolicy2";
import TermsofUse from "../views/ExtraPages/TermsofUse";
import PricingPage from "../views/PricingPage";
// import Subscriptions from "../views/Subscriptions";
import ErrorPage1 from "../views/ExtraPages/ErrorPage1";
import ErrorPage2 from "../views/ExtraPages/ErrorPage2";
import LoginPage from "../views/AuthPages/LoginPage";
import SignUpPage from "../views/AuthPages/SignUpPage";
import LostPassword from "../views/AuthPages/LostPassword";
import IndexPage from "../views/MerchandisePages/IndexPage";
import ShopCategoryPage from "../views/MerchandisePages/ShopCategoryPage";
import CartPage from "../views/MerchandisePages/CartPage";
import CheckOutPage from "../views/MerchandisePages/CheckoutPage";
import WishlistPage from "../views/MerchandisePages/WishlistPage";
import TrackOrder from "../views/MerchandisePages/TrackOrder";
import Success from "../views/MerchandisePages/Success";
import Cancel from "../views/MerchandisePages/Cancel";
import MyAccount from "../views/MerchandisePages/my-account";
import MyAccountv2 from "../views/MerchandisePages/my-accountv2";
import ViewAll from "../views/ViewAll";
import ViewAllByGenre from "../views/ViewAllByGenre";
import CommingSoonPage from "../views/ExtraPages/CommingSoonPage";
import HomePage from "../views/MainPages/IndexPage";
import HomePageZap from "../views/MainPages/IndexPageZap";
import RestrictedPage from "../views/Movies/RestictedPage";
import RelatedMerchandisePage from "../views/Movies/ReletedMerchandiesPage";
import VideoDetail from "../views/VideosPage/DetailPage";
import ProductDetail from "../views/MerchandisePages/ProductDetailPage";
import WatchlistDetail from "../views/WatchlistDetail";
import AllGenres from "../views/AllGenres";
import AllProduct from "../views/MerchandisePages/AllProduct";
import Shorts from "../views/Shorts/Shorts";
import ShortsSingle from "../views/Shorts/ShortsSingle";
import LikedShorts from "../views/Shorts/LikedShorts";
import SingleVideo from "../views/SingleVideo";
import SingleVideoNew from "../views/SingleVideoNew";
import SingleVideoNewV1 from "../views/SingleVideoNewV1";
import PlayNow from "../views/PlayNow";
import SingleVideoTwo from "../views/SingleVideoTwo";
import SingleVideoLivev1 from "../views/SingleVideoLivev1";
import SingleVideoLivev2 from "../views/SingleVideoLivev2";
import SingleVideoLiveEventv1 from "../views/SingleVideoLiveEventv1";
import SingleVideoLiveEventv2 from "../views/SingleVideoLiveEventv2";
import SingleVideoMoviev2 from "../views/SingleVideoMoviev2";
import SingleVideoMoviev1 from "../views/SingleVideoMoviev1";
import SeriesDM from "../views/SeriesDM";
import SeriesYT from "../views/SeriesYT";
import SeriesCDN from "../views/SeriesCDN";
import { useParams } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import SearchPage from "../views/SearchPageZap";
import GetStarted from "../views/AuthPagesv2/GetStarted";
import SignUp from "../views/AuthPagesv2/SignUp";
import VerifyEmail from "../views/AuthPagesv2/VerifyEmail";
import SearchPagev2 from "../views/SearchPageZapv2";
import SearchPagev3 from "../views/SearchPageZapv3";
// import SearchPagev3 from "../views/SearchPageZapv3";
import AnimatedRoutes from "../components/AnimatedRoutes";
import DemoSingleVideoMoviev1 from "../views/DemoSingleVideoMoviev1";
import DemoSingleVideoNewV1 from "../views/DemoSingleVideoNewV1";
import DemoSingleVideoTwo from "../views/DemoSingleVideoLivev1";
import PackagesPage from "../views/PackagesPage";
import CallbackHandler from "../views/CallbackHandler";
import CheckoutPage from "../views/CheckoutPage";
import MerchandiseCheckoutPage from "../views/MerchandisePages/CheckoutPage";
import SubscriptionStatusPage from "../views/SubscriptionStatusPage";
import DownloadApps from "../views/ExtraPages/DownloadApps";

import CheckoutTest from "../views/CheckoutTest";
import CompletePayment from "../views/CompletePayment";
import Tvod from "../views/Tvod";
import StripeSuccess from "../views/StripeSuccess";
import StripeCancel from "../views/StripeCancel";
import TVActivation from "../views/TVActivation";

const Series = () => {
  const { platform, seriesid } = useParams();

  return (
    <>
      {platform === "v2" && (
        <ErrorBoundary>
          <SeriesDM seriesId={seriesid} />
        </ErrorBoundary>
      )}
      {platform === "v1" && (
        <ErrorBoundary>
          <SeriesYT seriesId={seriesid} />
        </ErrorBoundary>
      )}
      {platform === "v3" && (
        <ErrorBoundary>
          <SeriesCDN seriesId={seriesid} />
        </ErrorBoundary>
      )}
      {platform !== "v1" && platform !== "v2" && platform !== "v3" && (
        <ErrorBoundary>
          <ErrorPage2 />
        </ErrorBoundary>
      )}
    </>
  );
};

export const LandingpageRouter = [
  {
    path: "/search/:query?",
    element: (
      <ErrorBoundary>
        <SearchPagev3 />
      </ErrorBoundary>
    ),
  },
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <FrontendLayout HeaderMega="true" FooterCompact="true" />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "",
        element: (
          <ErrorBoundary>
            <HomePageZap />
          </ErrorBoundary>
        ),
      },
      {
        path: "/shorts",
        element: (
          <ErrorBoundary>
            <Shorts />
          </ErrorBoundary>
        ),
      },
      {
        path: "/shorts/:id",
        element: (
          <ErrorBoundary>
            <ShortsSingle />
          </ErrorBoundary>
        ),
      },
      {
        path: "/shorts/liked/:id",
        element: (
          <ErrorBoundary>
            <LikedShorts />
          </ErrorBoundary>
        ),
      },
      {
        path: "/live-event/v2/:channel",
        element: (
          <ErrorBoundary>
            <SingleVideoLiveEventv2 />
          </ErrorBoundary>
        ),
      },
      {
        path: "/watch/v2/:channel",
        element: (
          <ErrorBoundary>
            <SingleVideoMoviev2 />
          </ErrorBoundary>
        ),
      },
      {
        path: "/live/v2/:channel",
        element: (
          <ErrorBoundary>
            <SingleVideoLivev2 />
          </ErrorBoundary>
        ),
      },
      // {
      //   path: "/movies",
      //   element: (
      //     <ErrorBoundary>
      //       <MoviePage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/movies-detail",
      //   element: (
      //     <ErrorBoundary>
      //       <MovieDetail />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/tv-shows",
      //   element: (
      //     <ErrorBoundary>
      //       <TvShowsList />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/shows-details",
      //   element: (
      //     <ErrorBoundary>
      //       <TvShowsDetail />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/episodes",
      //   element: (
      //     <ErrorBoundary>
      //       <LatestEpisodes />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/videos",
      //   element: (
      //     <ErrorBoundary>
      //       <VideoList />
      //     </ErrorBoundary>
      //   ),
      // },
      {
        path: "/videos-detail",
        element: (
          <ErrorBoundary>
            <VideoDetail />
          </ErrorBoundary>
        ),
      },
      {
        path: "/video/:platformid/:videoid/:seriesid",
        element: (
          <ErrorBoundary>
            <SingleVideoNew />
          </ErrorBoundary>
        ),
      },

      // {
      //   path: "/restricted-content",
      //   element: (
      //     <ErrorBoundary>
      //       <RestrictedPage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/related-merchandise",
      //   element: (
      //     <ErrorBoundary>
      //       <RelatedMerchandisePage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/playlist",
      //   element: (
      //     <ErrorBoundary>
      //       <Playlist />
      //     </ErrorBoundary>
      //   ),
      // },
      {
        path: "/series/:platform/:seriesid",
        element: (
          <ErrorBoundary>
            <Series />
          </ErrorBoundary>
        ),
      },
      
      // {
      //   path: "/watchlist-detail",
      //   element: (
      //     <ErrorBoundary>
      //       <WatchlistDetail />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/geners",
      //   element: (
      //     <ErrorBoundary>
      //       <GenresPage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/all-genres",
      //   element: (
      //     <ErrorBoundary>
      //       <AllGenres />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/tags",
      //   element: (
      //     <ErrorBoundary>
      //       <TagsPage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/cast",
      //   element: (
      //     <ErrorBoundary>
      //       <CastList />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/cast-detail",
      //   element: (
      //     <ErrorBoundary>
      //       <DetailPage />
      //     </ErrorBoundary>
      //   ),
      // },
      {
        path: "/cast-view-all/:name",
        element: (
          <ErrorBoundary>
            <CastViewAll />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs",
        element: (
          <ErrorBoundary>
            <BlogList title="Blog Listing" />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs-tag",
        element: (
          <ErrorBoundary>
            <BlogList title="Comedy" />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs-category",
        element: (
          <ErrorBoundary>
            <BlogList title="Drama" />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs-date",
        element: (
          <ErrorBoundary>
            <BlogList title="Day: September 23, 2022" />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs-author",
        element: (
          <ErrorBoundary>
            <BlogList title="Author: Goldenmace" />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs/:grid",
        element: (
          <ErrorBoundary>
            <BlogGrid />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs-sidebar/:position",
        element: (
          <ErrorBoundary>
            <SidebarList />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blogs-detail/:slug",
        element: (
          <ErrorBoundary>
            <BlogDetail />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blog-template/:slug",
        element: (
          <ErrorBoundary>
            <Blogtemplate />
          </ErrorBoundary>
        ),
      },
      {
        path: "/blog-single/:type",
        element: (
          <ErrorBoundary>
            <BlogSingle />
          </ErrorBoundary>
        ),
      },
      {
        path: "/pricing",
        element: (
          <ErrorBoundary>
            <PricingPage />
          </ErrorBoundary>
        ),
      },
      // {
      //   path: "/subscriptions/:seriesId",
      //   element: (
      //     <ErrorBoundary>
      //       <Subscriptions />
      //     </ErrorBoundary>
      //   ),
      // },
      {
        path: "/tvod/:seriesId",
        element: (
          <ErrorBoundary>
            <Tvod />
          </ErrorBoundary>
        ),
      },

      {
        path: "/stripe/success",
        element: (
          <ErrorBoundary>
            <StripeSuccess />
          </ErrorBoundary>
        ),
      },

      {
        path: "/stripe/cancel",
        element: (
          <ErrorBoundary>
            <StripeCancel />
          </ErrorBoundary>
        ),
      },

      {
        path: "/subscriptions/status/:sessionId",
        element: (
          <ErrorBoundary>
            <SubscriptionStatusPage />
          </ErrorBoundary>
        ),
      },

      {
        path: "/about-us",
        element: (
          <ErrorBoundary>
            <AboutPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "/contact-us",
        element: (
          <ErrorBoundary>
            <ContactPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "/PrivacyPolicy",
        element: (
          <ErrorBoundary>
            <PrivacyPolicy2 />
          </ErrorBoundary>
        ),
      },
      {
        path: "/download-apps",
        element: (
          <ErrorBoundary>
            <DownloadApps />
          </ErrorBoundary>
        ),
      },
      {
        path: "/terms-of-use",
        element: (
          <ErrorBoundary>
            <TermsofUse />
          </ErrorBoundary>
        ),
      },
      {
        path: "/faq",
        element: (
          <ErrorBoundary>
            <FAQPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "/view-all/:type/:title",
        element: (
          <ErrorBoundary>
            <ViewAll />
          </ErrorBoundary>
        ),
      },
      {
        path: "/view-all-by-genre/:genreId/:title",
        element: (
          <ErrorBoundary>
            <ViewAllByGenre />
          </ErrorBoundary>
        ),
      },
      {
        path: "/my-list",
        element: (
          <ErrorBoundary>
            <MyList />
          </ErrorBoundary>
        ),
      },
      {
        path: "/checkout-test/:packageId",
        element: (

          <ErrorBoundary>
            <CheckoutTest />
          </ErrorBoundary>

        ),
      },
      // {
      //   path: "/all-products",
      //   element: (
      //     <ErrorBoundary>
      //       <AllProduct />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/product-detail",
      //   element: (
      //     <ErrorBoundary>
      //       <ProductDetail />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/checkout/:id/*",
      //   element: (
      //     <ErrorBoundary>
      //       <CheckoutPage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/merchandise-checkout/:id/*",
      //   element: (
      //     <ErrorBoundary>
      //       <MerchandiseCheckoutPage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/account",
      //   element: (
      //     <ErrorBoundary>
      //       <MyAccount />
      //     </ErrorBoundary>
      //   ),
      // },
      {
        path: "/my-account",
        element: (
          <ErrorBoundary>
            <MyAccountv2 />
          </ErrorBoundary>
        ),
      },
      {
        path: "/activate",
        element: (
          <ErrorBoundary>
            <TVActivation />
          </ErrorBoundary>
        ),
      },
      {
        path: "/complete-payment",
        element: (

          <ErrorBoundary>
            <CompletePayment />
          </ErrorBoundary>

        ),
      },
      // {
      //   path: "/packages",
      //   element: (
      //     <ErrorBoundary>
      //       <PackagesPage />
      //     </ErrorBoundary>
      //   ),
      // },
      // {
      //   path: "/callback",
      //   element: (
      //     <ErrorBoundary>
      //       <CallbackHandler />
      //     </ErrorBoundary>
      //   ),
      // },
      {
        path: "*",
        element: (
          <ErrorBoundary>
            <ErrorPage2 />
          </ErrorBoundary>
        ),
      },
    ],
  },
  // {
  //   path: "/",
  //   element: (
  //     <ErrorBoundary>
  //       <FrontendLayout HeaderMerchandise="true" FooterMerchandise="true" />
  //     </ErrorBoundary>
  //   ),
  //   children: [
  //     {
  //       path: "/merchandise-store",
  //       element: (
  //         <ErrorBoundary>
  //           <IndexPage />
  //         </ErrorBoundary>
  //       ),
  //     },
  //     {
  //       path: "/shop",
  //       element: (
  //         <ErrorBoundary>
  //           <ShopCategoryPage />
  //         </ErrorBoundary>
  //       ),
  //     },
  //     {
  //       path: "/cart",
  //       element: (
  //         <ErrorBoundary>
  //           <CartPage />
  //         </ErrorBoundary>
  //       ),
  //     },
  //     {
  //       path: "/checkout-old",
  //       element: (
  //         <ErrorBoundary>
  //           <CheckOutPage />
  //         </ErrorBoundary>
  //       ),
  //     },
  //     {
  //       path: "/wishlist",
  //       element: (
  //         <ErrorBoundary>
  //           <WishlistPage />
  //         </ErrorBoundary>
  //       ),
  //     },
  //     {
  //       path: "/track-order",
  //       element: (
  //         <ErrorBoundary>
  //           <TrackOrder />
  //         </ErrorBoundary>
  //       ),
  //     },
  //   ],
  // },
  // {
  //   path: "/coming-soon",
  //   element: (
  //     <ErrorBoundary>
  //       <CommingSoonPage />
  //     </ErrorBoundary>
  //   ),
  // },
  // {
  //   path: "/error-page-one",
  //   element: (
  //     <ErrorBoundary>
  //       <ErrorPage1 />
  //     </ErrorBoundary>
  //   ),
  // },
  // {
  //   path: "/error-page-two",
  //   element: (
  //     <ErrorBoundary>
  //       <ErrorPage2 />
  //     </ErrorBoundary>
  //   ),
  // },
  {
    path: "/login",
    element: (
      <ErrorBoundary>
        <GetStarted />
      </ErrorBoundary>
    ),
  },
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <FrontendLayout HeaderMega="true" FooterCompact="true" />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "/verify-email",
        element: (
          <ErrorBoundary>
            <VerifyEmail />
          </ErrorBoundary>
        ),
      },
    ],
  },
  // {
  //   path: "/register",
  //   element: (
  //     <ErrorBoundary>
  //       <SignUpPage />
  //     </ErrorBoundary>
  //   ),
  // },
  // {
  //   path: "/lost-password",
  //   element: (
  //     <ErrorBoundary>
  //       <LostPassword />
  //     </ErrorBoundary>
  //   ),
  // },
  {
    path: "/live-event/v1/:channel",
    element: (
      <ErrorBoundary>
        <SingleVideoLiveEventv1 />
      </ErrorBoundary>
    ),
  },
  {
    path: "/watch/v1/:channel",
    element: (
      <ErrorBoundary>
        <SingleVideoMoviev1 />
      </ErrorBoundary>
    ),
  },
  // {
  //   path: "/demo/watch/v1/:channel",
  //   element: (
  //     <ErrorBoundary>
  //       <DemoSingleVideoMoviev1 />
  //     </ErrorBoundary>
  //   ),
  // },
  {
    path: "/live/v1/:channel",
    element: (
      <ErrorBoundary>
        <SingleVideoLivev1 />
      </ErrorBoundary>
    ),
  },
  // {
  //   path: "/demo/live/v1/:channel",
  //   element: (
  //     <ErrorBoundary>
  //       <DemoSingleVideoTwo />
  //     </ErrorBoundary>
  //   ),
  // },
  {
    path: "/video/v1/:platformid/:videoid/:seriesid",
    element: (
      <ErrorBoundary>
        <SingleVideoNewV1 />
      </ErrorBoundary>
    ),
  },
  

  // {
  //   path: "/demo/video/v1/:platformid/:videoid/:seriesid",
  //   element: (
  //     <ErrorBoundary>
  //       <DemoSingleVideoNewV1 />
  //     </ErrorBoundary>
  //   ),
  // },
  {
    path: "/mobile-app/about-us",
    element: (
      <ErrorBoundary>
        <AboutPage />
      </ErrorBoundary>
    ),
  },
  {
    path: "/mobile-app/PrivacyPolicy",
    element: (
      <ErrorBoundary>
        <PrivacyPolicy2 />
      </ErrorBoundary>
    ),
  },
  {
    path: "/mobile-app/terms-of-use",
    element: (
      <ErrorBoundary>
        <TermsofUse />
      </ErrorBoundary>
    ),
  },
];