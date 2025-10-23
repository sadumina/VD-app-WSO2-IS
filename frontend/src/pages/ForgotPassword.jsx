import { useState } from "react";
import { TextField, Button, Alert } from "@mui/material";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await API.post("/users/forgot-password", { email });
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button onClick={handleSubmit}>Send Reset Link</Button>
      {msg && <Alert>{msg}</Alert>}
    </div>
  );
}
