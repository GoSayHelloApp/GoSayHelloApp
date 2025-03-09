import { RouteObject } from "react-router-dom";
import Auth from "../pages/auth/auth";
import PrivateRoutes from "./privateRoutes";
import Preferences from "../pages/preferences/preferences";
import Main from "../ui/layout/main";
import Home from "../pages/home/home";
import EventDetails from "../pages/events/eventDetails";
import Middle from "../ui/layout/middle/middle";
import PublicEventDetails from "../pages/events/publicEventDetails";


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
    // All Private Routes listed here
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
        ],
      },
    ],
  },
];

export default routes;