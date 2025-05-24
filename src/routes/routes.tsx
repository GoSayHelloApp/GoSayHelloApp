import { RouteObject } from "react-router-dom";
import Auth from "../pages/auth/auth";
import PrivateRoutes from "./privateRoutes";
import Preferences from "../pages/preferences/preferences";
import Main from "../ui/layout/main";
import Home from "../pages/home/home";
import EventDetails from "../pages/events/eventDetails";
import Middle from "../ui/layout/middle/middle";
import PublicEventDetails from "../pages/events/publicEventDetails";
import NotFound from "../pages/notfound/NotFound";
import ChangePassword from "../pages/change-password/ChangePassword";
import Privacy from "../pages/privacy/Privacy";
import PremiumSubscription from "../pages/premium-subscription/premiumSubscription";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/event-details/:eventId",
    element: <PublicEventDetails />,
  },
  {
    element: <PrivateRoutes />,
    children: [
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
                path: "nearby",
                element: <Middle />,
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
            element: <NotFound />,
            index: true,
          },
          {
            path: "messages",
            element: <NotFound />,
            index: true,
          },
          {
            path: "waves",
            element: <NotFound />,
            index: true,
          },
          {
            path: "profile",
            element: <NotFound />,
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
            path: "premium",
            element: <PremiumSubscription />,
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
