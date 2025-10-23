import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

// 🔹 Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Travels from "./pages/Travels";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// 🔹 Add this new import
import AuthCallback from "./pages/AuthCallback"; // ✅ New callback page

function App() {
  // Local token storage check (for dashboard rendering)
  const loggedIn = localStorage.getItem("token") || localStorage.getItem("access_token");

  return (
    <Router>
      {loggedIn ? (
        // ✅ Logged-in layout (Navbar + Sidebar)
        <Box sx={{ display: "flex" }}>
          <Navbar />
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar /> {/* keeps content below navbar */}
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Travels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      ) : (
        // ✅ Public routes (login, register, forgot, etc.)
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 🆕 NEW: Handle WSO2 redirect callback */}
          <Route path="/callback" element={<AuthCallback />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
