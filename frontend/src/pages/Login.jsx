// ✅ Login.jsx (WSO2 IS Integrated Version)
// --------------------------------------------------------------
// This version removes manual password login
// and adds "Sign in with Haycarb Account" using WSO2 OIDC.
// It relies on react-oidc-context for authentication state.

import React from "react";
import {
  Box,
  Container,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { LocalShipping } from "@mui/icons-material";
import { useAuth } from "react-oidc-context"; // 🔐 Provides OIDC login state and actions

function Login() {
  // Hook to access current authentication state
  const auth = useAuth();

  // ✅ Handle login
  const handleLogin = () => {
    // Redirects user to WSO2 login page (https://localhost:9443/login)
    auth.signinRedirect();
  };

  // ✅ Handle logout (optional for debugging)
  const handleLogout = () => {
    auth.signoutRedirect();
  };

  // --------------------------------------------------------------
  // ⚙️ Render logic based on authentication state
  if (auth.isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1B5E20 0%, #4ba24fff 100%)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    );
  }

  if (auth.error) {
    return (
      <Alert severity="error">
        Authentication Error: {auth.error.message}
      </Alert>
    );
  }

  // --------------------------------------------------------------
  // 🌿 If user is already authenticated, show welcome state
  if (auth.isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1B5E20 0%, #4ba24fff 100%)",
          flexDirection: "column",
        }}
      >
        <Paper elevation={24} sx={{ padding: 5, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Welcome, {auth.user?.profile?.email || "Haycarb User"} 🎉
          </Typography>

          <Typography variant="body1" sx={{ mb: 4 }}>
            You are successfully authenticated through WSO2 Identity Server.
          </Typography>

          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              px: 4,
              py: 1,
              textTransform: "none",
              background: "linear-gradient(135deg, #1B5E20 0%, #4ba24fff 100%)",
            }}
          >
            Sign Out
          </Button>
        </Paper>
      </Box>
    );
  }

  // --------------------------------------------------------------
  // 🔐 Default: Not logged in → Show login card
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1B5E20 0%, #4ba24fff 100%)",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* 🌿 Logo and heading */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: "0 auto",
              mb: 2,
              bgcolor: "white",
              boxShadow: 4,
            }}
          >
            <LocalShipping sx={{ fontSize: 40, color: "#66ea78ff" }} />
          </Avatar>
          <Typography variant="h3" sx={{ fontWeight: 700, color: "white", mb: 1 }}>
            FuelTrack
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)" }}>
            Fuel Tracking System for HayCarb PLC
          </Typography>
        </Box>

        {/* 🔐 Login Card */}
        <Paper elevation={24} sx={{ padding: 4, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Sign in securely with your Haycarb Account
          </Typography>

          {/* 🟩 Sign In with WSO2 Identity Server */}
          <Button
            onClick={handleLogin}
            variant="contained"
            size="large"
            fullWidth
            sx={{
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(135deg, #1B5E20 0%, #4ba24fff 100%)",
              boxShadow: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #1B5E20 0%, #4ba24fff 100%)",
                boxShadow: 6,
              },
            }}
          >
            Sign in with Haycarb Account
          </Button>
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: "rgba(255,255,255,0.9)" }}
        >
          © 2025 HayCarb. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Login;
