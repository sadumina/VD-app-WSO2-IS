// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2E7D32",   // Haycarb Green
      dark: "#1B5E20",   // Darker green
      light: "#66BB6A",  // Lighter green
    },
    secondary: {
      main: "#424242",   // Neutral gray
    },
    background: {
      default: "#F5F5F5", // App background
      paper: "#FFFFFF",   // Cards, tables
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12, // Global rounded corners
  },
});

export default theme;
