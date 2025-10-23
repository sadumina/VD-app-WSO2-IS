import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "#2E7D32",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          FuelTracker System
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="body1"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            {user?.name || "User"}
          </Typography>
          <Avatar
            sx={{ bgcolor: "orange", cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </Avatar>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
