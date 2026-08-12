import { StrictMode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Problems from "./pages/Problems.jsx";
import Analytics from "./pages/Analytics.jsx";
import Patterns from "./pages/Patterns.jsx";
import Collections from "./pages/Collections.jsx";
import Settings from "./pages/Settings.jsx";
import Revision from "./pages/Revision.jsx";
import Home from "./pages/Home.jsx";
import App from "./App.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },

  {
    element: <App />,

    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "problems",
        element: <Problems />,
      },
      {
        path: "revision",
        element: <Revision />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "patterns",
        element: <Patterns />,
      },
      {
        path: "collections",
        element: <Collections />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
