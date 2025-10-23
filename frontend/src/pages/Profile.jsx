import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Skeleton,
} from "@mui/material";
import {
  Person,
  Email,
  CreditCard,
  Save,
  Edit,
  LocalGasStation,
} from "@mui/icons-material";
import API from "../services/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", fuel_card_no: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isEditing, setIsEditing] = useState(false);

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/me");
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          fuel_card_no: res.data.fuel_card_no || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
        setSnackbar({
          open: true,
          message: "Failed to load profile",
          severity: "error",
        });
      }
    };
    fetchProfile();
  }, []);

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put("/users/me", form);
      setProfile({ ...profile, ...form });
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      setIsEditing(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Update failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCancel = () => {
    setForm({
      name: profile.name || "",
      fuel_card_no: profile.fuel_card_no || "",
    });
    setIsEditing(false);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Skeleton variant="circular" width={100} height={100} sx={{ mr: 3 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Skeleton variant="rectangular" height={200} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Profile Header Card */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              fontSize: "2.5rem",
              fontWeight: 700,
              bgcolor: "primary.main",
              mr: 3,
            }}
          >
            {getInitials(profile.name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {profile.name || "User Profile"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Email fontSize="small" />
              {profile.email}
            </Typography>
          </Box>
          {!isEditing && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              sx={{ height: "fit-content" }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: "success.light",
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                  }}
                >
                  <LocalGasStation sx={{ fontSize: 30, color: "success.main" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Fuel Card Number
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profile.fuel_card_no || "Not Set"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: "info.light",
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                  }}
                >
                  <Person sx={{ fontSize: 30, color: "info.main" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
                    Active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profile Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Profile Information
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: "action.active" }} />,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={profile.email}
                disabled
                helperText="Email cannot be changed"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: "action.active" }} />,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fuel Card Number"
                value={form.fuel_card_no}
                onChange={(e) => setForm({ ...form, fuel_card_no: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter your fuel card number"
                InputProps={{
                  startAdornment: <CreditCard sx={{ mr: 1, color: "action.active" }} />,
                }}
              />
            </Grid>

            {isEditing && (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>

      {/* Additional Info */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: "info.lighter" }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "start", gap: 1 }}>
          <Person fontSize="small" sx={{ mt: 0.2 }} />
          Your profile information is used across the LogiTrack system. Keep it up to date for accurate record keeping.
        </Typography>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;