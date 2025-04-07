import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("jwt"); // Ellenőrzés

  return token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
