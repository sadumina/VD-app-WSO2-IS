import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  EmailOutlined,
  CreditCard,
  LockOutlined,
} from "@mui/icons-material";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fuelCardNo, setFuelCardNo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Enforce haycarb.com email
    if (!email.endsWith("@haycarb.com")) {
      setError("Only Haycarb employees can register with @haycarb.com email.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/users/register", {
        name,
        email,
        password,
        fuel_card_no: fuelCardNo,
      });

      alert("✅ Registered successfully. Please login.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1B5E20 0%, #388E3C 50%, #66BB6A 100%)", 
        // 👆 Unique 3-tone green gradient
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 3,
            background: "white",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #2E7D32, #1B5E20)",
              color: "white",
              py: 5,
              px: 4,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2,
              }}
            >
              <PersonOutline sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Join us to manage your fuel expenses efficiently
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleRegister} noValidate>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><PersonOutline /></InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><EmailOutlined /></InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helperText="Minimum 8 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><LockOutlined /></InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Fuel Card Number"
                  value={fuelCardNo}
                  onChange={(e) => setFuelCardNo(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><CreditCard /></InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #1B5E20, #43A047)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2E7D32, #1B5E20)",
                    },
                  }}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link component="button" onClick={() => navigate("/")} sx={{ fontWeight: 600 }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
