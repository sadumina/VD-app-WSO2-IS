import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />; // redirect to login
  }

  try {
    const decoded = jwtDecode(token);

    // If route requires admin but user is not admin → block
    if (role && decoded.role !== role) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/" replace />;
  }
}

export default ProtectedRoute;
