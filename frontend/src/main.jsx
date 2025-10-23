import React from "react";
import ReactDOM from "react-dom/client";
import AuthProvider from "./auth/AuthProvider.jsx"; // ✅ WSO2 OIDC provider
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme"; // ✅ Haycarb theme

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Wrap the entire app with OIDC AuthProvider FIRST */}
    <AuthProvider>
      {/* Then apply your MUI theme globally */}
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* resets default MUI background and typography */}
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
