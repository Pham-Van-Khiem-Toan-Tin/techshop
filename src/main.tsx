import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NuqsAdapter } from 'nuqs/adapters/react'
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
import RoleManagement from "./pages/Role/RoleManagement";
import Product from "./pages/Product/Product";
import Order from "./pages/Order/Order";
import Category from "./pages/Category/Category";
import Login from "./pages/Login/Login";
import AppBootstrap from "./AppBootstrap";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import RoleCreate from "./pages/Role/RoleCreate";
import FunctionManagement from "./pages/Function/FunctionManagement";
import SubFunctionManagement from "./pages/SubFunction/SubFunctionManagement";
import SubFunctionCreate from "./pages/SubFunction/SubFunctionCreate";
import { Bounce, ToastContainer } from "react-toastify";
import SubFunctionEdit from "./pages/SubFunction/SubFunctionEdit";
import SubFunctionDetail from "./pages/SubFunction/SubFunctionDetail ";
import FunctionCreate from "./pages/Function/FunctionCreate";
import FunctionEdit from "./pages/Function/FunctionEdit";
import FunctionDetail from "./pages/Function/FunctionDetail";

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
          { path: "roles", element: <RoleManagement /> },
          { path: "roles/create", element: <RoleCreate /> },
          { path: "functions", element: <FunctionManagement /> },
          { path: "functions/create", element: <FunctionCreate /> },
          { path: "functions/edit/:id", element: <FunctionEdit /> },
          { path: "functions/view/:id", element: <FunctionDetail /> },
          { path: "subfunctions", element: <SubFunctionManagement /> },
          { path: "subfunctions/edit/:id", element: <SubFunctionEdit /> },
          { path: "subfunctions/detail/:id", element: <SubFunctionDetail /> },
          { path: "subfunctions/create", element: <SubFunctionCreate /> },
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
      <NuqsAdapter>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
      </NuqsAdapter>
    </Provider>
  </React.StrictMode>
);