import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  Provider,
  createClient,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { SubscriptionClient } from "subscriptions-transport-ws";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import NewGame from "./NewGame.tsx";
import Game from "./Game.tsx";
import JoinGame from "./JoinGame.tsx";

const subscriptionClient = new SubscriptionClient(
  `ws${
    import.meta.env.PROD ? "s" : ""
  }://${import.meta.env.VITE_SERVER_URL.replace(/https?:\/\//, "")}/query`,
  {
    reconnect: true,
  }
);

const client = createClient({
  url: `${import.meta.env.VITE_SERVER_URL}/query`,
  fetchOptions: {
    credentials: "include",
  },
  exchanges: [
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (request) => subscriptionClient.request(request),
    }),
  ],
});

const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/new",
        element: <NewGame />,
      },
      {
        path: "/join/:gameId",
        element: <JoinGame />,
      },
      {
        path: "/game/:gameId",
        element: <Game />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fjalla+One&family=Titan+One&family=Inter&display=swap"
        rel="stylesheet"
      />
    </head>
    <Provider value={client}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

function PageLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className={`h-screen w-full bg-black ${
          location.pathname === "/" ? "bg-opacity-0" : "bg-opacity-40"
        } flex items-center justify-center duration-1000`}
      >
        <Outlet />
      </div>
    </div>
  );
}
