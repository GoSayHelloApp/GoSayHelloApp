import { RouteObject } from "react-router-dom";
import Auth from "../pages/auth/auth";
import HomeTown from "../pages/home-town";
import School from "../pages/school";
import EducationLevel from "../pages/education-level";
import Work from "../pages/work";
import BusinessInfo from "../pages/business-info/businessInfo";
import PrivateRoutes from "./privateRoutes";
import Preferences from "../pages/preferences/preferences";
import Main from "../ui/layout/main";
import Home from "../pages/home/home";
import EventDetails from "../pages/events/eventDetails";
import EventAuthorizedScanners from "../pages/events/EventAuthorizedScanners";
import Middle from "../ui/layout/middle/middle";
import PublicEventDetails from "../pages/events/publicEventDetails";
import EventsListPage from "../pages/events/EventsListPage";
import EventScheduler from "../pages/events/EventScheduler";
import NotFound from "../pages/notfound/NotFound";
import ChangePassword from "../pages/change-password/ChangePassword";
import Privacy from "../pages/privacy/Privacy";
import PremiumSubscription from "../pages/premium-subscription/premiumSubscription";
import BlockUser from "../pages/block-user/BlockUser";
import UserProfile from "../pages/user-profile/userProfile";
import UserPostDetails from "../pages/user-profile/UserPostDetails";
import OtherUserProfile from "../pages/user-profile/otherUserProfile";
import UserListByLocation from "../pages/user-profile/UserListByLocation";
import ReportUser from "../pages/user-profile/ReportUser";
import CreatePost from "../pages/posts/CreatePost";
import DeleteAccount from "../pages/delete-account";
import Waves from "../pages/waves/waves";
import Messages from "../pages/messages";
import MessagesLayout from "../pages/messages/MessagesLayout";
import Wallet from "../pages/wallet";
import PurchasedTicketsPage from "../pages/tickets/PurchasedTicketsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import PublicEventsPage from "../pages/events/PublicEventsPage";
import PublicEventTicketsPage from "../pages/events/PublicEventTicketsPage";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/public/events",
    element: <PublicEventsPage />,
  },
  {
    path: "/event-details/:eventId",
    element: <PublicEventDetails />,
  },
  {
    path: "/event-details/:eventId/tickets",
    element: <PublicEventTicketsPage />,
  },
  {
    path: "/events-list",
    element: <EventsListPage />,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/home-town",
        element: <HomeTown />,
      },
      {
        path: "/school",
        element: <School />,
      },
      {
        path: "/education-level",
        element: <EducationLevel />,
      },
      {
        path: "/work",
        element: <Work />,
      },
      {
        path: "/business-info",
        element: <BusinessInfo />,
      },
      {
        path: "/preferences",
        element: <Preferences />,
      },
      {
        path: "/",
        element: <Main />,
        children: [
          {
            element: <Home />,
            children: [
              {
                path: "events/:eventId/details",
                element: <EventDetails />,
              },
              {
                path: "events/:eventId/authorized-scanners",
                element: <EventAuthorizedScanners />,
              },
              {
                path: "nearby",
                element: <Middle />,
                index: true,
              },
              {
                path: "event-scheduler",
                element: <EventScheduler />,
                index: true,
              },
              {
                path: "wallet",
                element: <Wallet />,
                index: true,
              },
              {
                path: "my-tickets",
                element: <PurchasedTicketsPage />,
              },
            ],
          },
          {
            path: "messages",
            element: <MessagesLayout />,
            children: [
              {
                path: "",
                element: <Messages />,
                index: true,
              },
            ],
          },
          {
            path: "search",
            element: <NotFound />,
            index: true,
          },
          {
            path: "wallet",
            element: <Wallet />,
            index: true,
          },

          {
            path: "waves",
            element: <Waves />,
            index: true,
          },
          {
            path: "profile",
            element: <UserProfile />,
            // index: true,
            children: [
              {
                path: "post-details",
                element: <UserPostDetails />,
                index: true,
              },
            ],
          },
          {
            path: "post-details",
            element: <UserPostDetails />,
            index: true,
          },
          {
            path: "settings",
            element: <SettingsPage />,
            index: true,
          },
          {
            path: "change-password",
            element: <ChangePassword />,
            index: true,
          },
          {
            path: "privacy",
            element: <Privacy />,
            index: true,
          },
          {
            path: "block-user",
            element: <BlockUser />,
            index: true,
          },
          {
            path: "premium",
            element: <PremiumSubscription />,
            index: true,
          },
          {
            path: "user-profile/:userId",
            element: <OtherUserProfile />,
          },
          {
            path: "users-by-location",
            element: <UserListByLocation />,
          },
          {
            path: "report-user/:userId",
            element: <ReportUser />,
          },
          {
            path: "create-post",
            element: <CreatePost />,
          },
          {
            path: "delete-account",
            element: <DeleteAccount />,
            index: true,
          },
          {
            path: "*",
            element: <NotFound />,
            index: true,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
        index: true,
      },
    ],
  },
];

export default routes;
