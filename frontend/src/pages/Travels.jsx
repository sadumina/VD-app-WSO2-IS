import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  DriveEta,
  BusinessCenter,
  Home,
  Route,
  CalendarMonth,
  FiberNew,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { keyframes } from "@mui/system";
import API from "../services/api";

function Travels() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    meter_start: "",
    meter_end: "",
    official_km: "",
    private_km: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [totalKm, setTotalKm] = useState(0);

  const topRowRef = useRef(null); // ✅ ref for latest row

  // ✅ animation for latest row
  const highlightAnim = keyframes`
    from { background-color: #C8E6C9; }
    to { background-color: transparent; }
  `;

  // Calculate total KM when meter values change
  useEffect(() => {
    if (form.meter_start && form.meter_end) {
      const total = parseFloat(form.meter_end) - parseFloat(form.meter_start);
      setTotalKm(total >= 0 ? total : 0);
    } else {
      setTotalKm(0);
    }
  }, [form.meter_start, form.meter_end]);

  // Fetch my travel logs
  // Fetch my travel logs
const fetchLogs = async () => {
  try {
    const res = await API.get("/travels/me");

    // ✅ Sort logs: latest first
    const sortedLogs = res.data.sort((a, b) => {
      const aTime = a.created_at
        ? new Date(a.created_at)
        : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
      const bTime = b.created_at
        ? new Date(b.created_at)
        : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
      return bTime - aTime;
    });

    setLogs(sortedLogs);

    // ✅ Pre-fill start meter with last end meter
    if (sortedLogs.length > 0) {
      setForm((prev) => ({
        ...prev,
        meter_start: sortedLogs[0].meter_end, // latest end becomes new start
      }));
    }

    // ✅ Auto scroll to latest
    setTimeout(() => {
      if (topRowRef.current) {
        topRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 400);
  } catch (err) {
    console.error("Error fetching travel logs:", err.response?.data || err.message);
    setSnackbar({
      open: true,
      message: err.response?.data?.detail || "Failed to load travel logs.",
      severity: "error",
    });
  }
};


  useEffect(() => {
    fetchLogs();
  }, []);

  // Add new travel log
 const addLog = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await API.post("/travels", {
      date: form.date,
      meter_start: parseFloat(form.meter_start),
      meter_end: parseFloat(form.meter_end),
      official_km: parseFloat(form.official_km),
      private_km: parseFloat(form.private_km),
      remarks: form.remarks,
    });

    setSnackbar({
      open: true,
      message: "✅ Travel log added successfully!",
      severity: "success",
    });

    // ✅ After adding, fetch logs and pre-fill new start meter automatically
    await fetchLogs();

    setForm({
      date: dayjs().format("YYYY-MM-DD"),
      meter_start: res.data.meter_end, // latest end = new start
      meter_end: "",
      official_km: "",
      private_km: "",
      remarks: "",
    });
    setTotalKm(0);
  } catch (err) {
    console.error("Error adding travel log:", err.response?.data || err.message);
    setSnackbar({
      open: true,
      message: err.response?.data?.detail || "Failed to add travel log.",
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};


  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate statistics
  const totalOfficial = logs.reduce((sum, log) => sum + (log.official_km || 0), 0);
  const totalPrivate = logs.reduce((sum, log) => sum + (log.private_km || 0), 0);
  const totalDistance = logs.reduce((sum, log) => sum + (log.total_km || 0), 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <DriveEta color="primary" />
            Travel Log Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your official and private travel kilometers
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Distance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {totalDistance}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      kilometers
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "primary.light",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Route sx={{ fontSize: 40, color: "primary.main" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Official Travel
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "success.main" }}>
                      {totalOfficial}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      kilometers
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "success.light",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <BusinessCenter sx={{ fontSize: 40, color: "success.main" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Private Travel
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "secondary.main" }}>
                      {totalPrivate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      kilometers
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "secondary.light",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Home sx={{ fontSize: 40, color: "secondary.main" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Travel Form */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Add />
            Add New Travel Log
          </Typography>

          <form onSubmit={addLog}>
            <Grid container spacing={2}>
              {/* Date Picker */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Travel Date"
                  value={dayjs(form.date)}
                  onChange={(newValue) =>
                    setForm({ ...form, date: dayjs(newValue).format("YYYY-MM-DD") })
                  }
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Meter Start (km)"
                  type="number"
                  value={form.meter_start}
                  onChange={(e) => setForm({ ...form, meter_start: e.target.value })}
                  required
                  inputProps={{ step: "0.1" }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Meter End (km)"
                  type="number"
                  value={form.meter_end}
                  onChange={(e) => setForm({ ...form, meter_end: e.target.value })}
                  required
                  inputProps={{ step: "0.1" }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Official KM"
                  type="number"
                  value={form.official_km}
                  onChange={(e) => setForm({ ...form, official_km: e.target.value })}
                  required
                  inputProps={{ step: "0.1" }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Private KM"
                  type="number"
                  value={form.private_km}
                  onChange={(e) => setForm({ ...form, private_km: e.target.value })}
                  required
                  inputProps={{ step: "0.1" }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks (Optional)"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: "primary.light",
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Calculated Total Distance:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {totalKm} km
                    </Typography>
                  </Paper>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                    sx={{ minWidth: 180 }}
                  >
                    {loading ? "Adding..." : "Add Travel Log"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Travel Logs Table */}
        <Paper elevation={3}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
            >
              <CalendarMonth />
              Travel History ({logs.length} entries)
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Meter Start
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Meter End
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Official KM
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Private KM
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Total KM
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <DriveEta sx={{ fontSize: 60, color: "grey.300", mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No travel logs yet. Add your first travel log above!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, i) => {
                    const isLatest = i === 0;
                    return (
                      <TableRow
                        key={i}
                        ref={isLatest ? topRowRef : null}
                        hover
                        sx={{
                          backgroundColor: isLatest ? "rgba(76, 175, 80, 0.08)" : "transparent",
                          animation: isLatest ? `${highlightAnim} 2s ease-out` : "none",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Date(log.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{log.meter_start?.toLocaleString()}</TableCell>
                        <TableCell align="center">{log.meter_end?.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <Chip label={`${log.official_km} km`} color="success" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`${log.private_km} km`} color="secondary" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`${log.total_km} km`} color="primary" size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            {log.remarks || "—"}
                            {isLatest && (
                              <Chip
                                icon={<FiberNew />}
                                label="NEW"
                                color="success"
                                size="small"
                              />
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Snackbar */}
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
    </LocalizationProvider>
  );
}

export default Travels;
