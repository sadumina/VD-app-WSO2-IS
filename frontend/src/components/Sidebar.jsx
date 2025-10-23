import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  DirectionsCar,
  Person,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Travels", icon: <DirectionsCar />, path: "/dashboard" },
    { text: "Profile", icon: <Person />, path: "/profile" },
    { text: "Admin", icon: <AdminPanelSettings />, path: "/admin" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg,#2E7D32 0%,#1B5E20 100%)",
          color: "#fff",
        },
      }}
    >
      <Toolbar sx={{ fontWeight: 700, fontSize: "1.2rem" }}>Haycarb PLC</Toolbar>
      <Divider />
      <List>
        {menu.map((item, index) => (
          <ListItemButton
            key={index}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.2)" },
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
