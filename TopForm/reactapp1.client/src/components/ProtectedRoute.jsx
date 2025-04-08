import { Navigate, Outlet } from "react-router-dom";
import  AccessDeniedPage  from "../ErrorPages/AccessDeniedPage.jsx";

const ProtectedRoute = ({ showBodyguard = true }) => {
  const isLoggedIn = !!localStorage.getItem("jwt");

  if (!isLoggedIn) {
    return showBodyguard ? <AccessDeniedPage /> : <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;