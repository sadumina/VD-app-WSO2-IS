import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from "@mui/material";
import {
  People,
  DirectionsCar,
  BarChart,
  Dashboard,
  Download,
  ExpandMore,
  FiberNew,
  Search,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import API from "../services/api";
import Travels from "./Travels";

// 📦 PDF library
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

// ✅ Utility: CSV/JSON download
const downloadFile = (data, filename, type = "csv") => {
  if (!data || data.length === 0) {
    alert("No data available to download.");
    return;
  }

  let blob;
  if (type === "json") {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  } else {
    const headers = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    blob = new Blob([headers + rows], { type: "text/csv" });
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ✅ Utility: Enhanced PDF download
const downloadPDF = (data, filename, title) => {
  if (!data || data.length === 0) {
    alert("No data to download.");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text("Haycarb PLC - FuelTracker Report", 14, 15);

  doc.setFontSize(12).setFont("helvetica", "normal");
  doc.text(title, 14, 23);

  autoTable(doc, {
    head: [Object.keys(data[0])],
    body: data.map((row) => Object.values(row)),
    startY: 30,
    theme: "striped",
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255], halign: "center" },
    bodyStyles: { halign: "center", valign: "middle" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: (dataArg) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height || pageSize.getHeight();
      const today = new Date();

      doc.setFontSize(10).setTextColor(100);
      doc.text(
        `Exported on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`,
        dataArg.settings.margin.left,
        pageHeight - 10
      );
      doc.text(
        `Page ${dataArg.pageNumber} of ${pageCount}`,
        pageSize.width - dataArg.settings.margin.right - 40,
        pageHeight - 10
      );
    },
  });

  doc.save(filename);
};

function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [search, setSearch] = useState("");
  // eslint-disable-next-line no-unused-vars

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await API.get("/users/all");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  // Fetch travel logs
  const fetchLogs = async () => {
    try {
      const res = await API.get("/travels/all");
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  // Role update
  const updateRole = async (email, role) => {
    try {
      setLoading(true);
      await API.put(`/users/${email}`, { role });
      setSnackbar({ open: true, message: `✅ Updated ${email} to ${role}`, severity: "success" });
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to update role",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      setLoading(true);
      await API.delete(`/users/${email}`);
      setSnackbar({ open: true, message: `🗑️ Deleted ${email}`, severity: "success" });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || "Delete failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Analytics data
  const officialTotal = logs.reduce((sum, l) => sum + (l.official_km || 0), 0);
  const privateTotal = logs.reduce((sum, l) => sum + (l.private_km || 0), 0);
  const distanceByUser = users.map((u) => ({
    name: u.name,
    total: logs.filter((l) => l.user_email === u.email).reduce((s, l) => s + (l.total_km || 0), 0),
  }));

  // ✅ Group logs by user
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.user_email]) acc[log.user_email] = [];
    acc[log.user_email].push(log);
    return acc;
  }, {});

  // ✅ Filtered users
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
        p: 3,
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700} color="primary">
          Haycarb PLC – Admin Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button variant="outlined" color="primary">Export All</Button>
          <Chip label="Admin" color="success" />
        </Box>
      </Paper>

      {/* KPI Section */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="body2" color="text.secondary">Total Employees</Typography>
            <Typography variant="h4" fontWeight={700}>{users.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="body2" color="text.secondary">Official KM</Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">{officialTotal}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="body2" color="text.secondary">Private KM</Typography>
            <Typography variant="h4" fontWeight={700} color="error.main">{privateTotal}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": { fontWeight: 600 },
          }}
        >
          <Tab icon={<People />} label="Users" />
          <Tab icon={<DirectionsCar />} label="Travel Logs" />
          <Tab icon={<BarChart />} label="Analytics" />
          <Tab icon={<Dashboard />} label="User Functions" />
        </Tabs>

        {/* Users */}
        <TabPanel value={tab} index={0}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" startIcon={<Download />} onClick={() => downloadFile(users, "users.csv")}>
                CSV
              </Button>
              <Button variant="contained" startIcon={<Download />} onClick={() => downloadPDF(users, "users.pdf", "User List")}>
                PDF
              </Button>
            </Box>
          </Box>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "grey.100" }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={u.role} color={u.role === "admin" ? "success" : "default"} size="small" />
                      </TableCell>
                      <TableCell>
                        {u.role !== "admin" && (
                          <Button size="small" onClick={() => updateRole(u.email, "admin")}>Make Admin</Button>
                        )}
                        {u.role !== "employee" && (
                          <Button size="small" variant="outlined" onClick={() => updateRole(u.email, "employee")}>Make Employee</Button>
                        )}
                        <Button size="small" color="error" onClick={() => deleteUser(u.email)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Travel Logs */}
       <TabPanel value={tab} index={1}>
  {Object.keys(groupedLogs).map((userEmail, idx) => {
    const userLogs = groupedLogs[userEmail].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return (
      <Accordion key={idx} defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={700}>{userEmail}</Typography>
          <Chip
            label={`${userLogs.length} entries`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
          {/* 📥 Export Buttons per user */}
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Download />}
              onClick={() => downloadFile(userLogs, `${userEmail}_logs.csv`)}
            >
              CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Download />}
              onClick={() => downloadPDF(userLogs, `${userEmail}_logs.pdf`, `${userEmail} Travel Logs`)}
            >
              PDF
            </Button>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Official KM</TableCell>
                <TableCell>Private KM</TableCell>
                <TableCell>Total KM</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userLogs.map((log, i) => {
                const totalKm =
                  log.meter_end && log.meter_start
                    ? log.meter_end - log.meter_start
                    : log.total_km;

                return (
                  <TableRow
                    key={i}
                    hover
                    sx={{ bgcolor: i === 0 ? "rgba(76, 175, 80, 0.08)" : "inherit" }}
                  >
                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell>{log.meter_start?.toLocaleString()}</TableCell>
                    <TableCell>{log.meter_end?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={`${log.official_km} km`} color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${log.private_km} km`} color="secondary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${totalKm || 0} km`} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      {log.remarks || "—"}
                      {i === 0 && (
                        <Chip icon={<FiberNew />} label="NEW" color="success" size="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    );
  })}
</TabPanel>


        {/* Analytics */}
        <TabPanel value={tab} index={2}>
          <Typography variant="h6" gutterBottom>Analytics Overview</Typography>
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <ResponsiveContainer width="45%" height={300}>
              <PieChart>
                <Pie data={[{ name: "Official KM", value: officialTotal }, { name: "Private KM", value: privateTotal }]} dataKey="value" outerRadius={100} label>
                  <Cell fill="#2E7D32" />
                  <Cell fill="#c62828" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="45%" height={300}>
              <RBarChart data={distanceByUser}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#1976d2" />
              </RBarChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        {/* User Functions */}
        <TabPanel value={tab} index={3}>
          <Travels />
        </TabPanel>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box sx={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

export default AdminDashboard;
