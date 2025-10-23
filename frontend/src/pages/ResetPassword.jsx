import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TextField, Button, Alert } from "@mui/material";
import API from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await API.post("/users/reset-password", { token, new_password: password });
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <TextField type="password" label="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleSubmit}>Reset</Button>
      {msg && <Alert>{msg}</Alert>}
    </div>
  );
}
