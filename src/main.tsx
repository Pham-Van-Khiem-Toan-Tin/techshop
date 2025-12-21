import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Inter
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// Bootstrap (CSS build sẵn => không dính warning sass)
import "bootstrap/dist/css/bootstrap.min.css";


// App styles
import "./styles/main.scss";

import { Provider } from "react-redux"
import { store } from "./store/store"
import { createBrowserRouter, Navigate } from "react-router"
import { RouterProvider } from "react-router/dom"
import Dashboard from "./pages/Dashboard/Dashboard";
import Role from "./pages/Role/Role";
import Product from "./pages/Product/Product";
import Order from "./pages/Order/Order";
import Category from "./pages/Category/Category";
import Login from "./pages/Login/Login";
import AppBootstrap from "./AppBootstrap";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import RoleCreate from "./pages/Role/RoleCreate";

const router = createBrowserRouter([
  {
    element: (
      <AppBootstrap>
        <PublicRoute />
      </AppBootstrap>
    ),
    children: [
      { path: "/login", element: <Login /> }
    ]
  },
  {
    element: (
      <AppBootstrap>
        <ProtectedRoute />
      </AppBootstrap>
    ),
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "roles", element: <Role /> },
          { path: "roles/create", element: <RoleCreate /> },
          { path: "products", element: <Product /> },
          { path: "orders", element: <Order /> },
          { path: "categories", element: <Category /> }
        ]
      }
    ],
  },
  { path: "*", element: <div className="p-4">404 Not Found</div> },
])


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);