import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

useEffect(() => {
  const code = params.get("code");
  if (!code) return;

  if (sessionStorage.getItem("usedCode") === code) return;
  sessionStorage.setItem("usedCode", code);

  fetch(`http://localhost:8000/api/auth/callback?code=${code}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("✅ Token Response:", data);
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        alert("Authentication failed. Please try again.");
        navigate("/");
      }
    })
    .catch((err) => {
      console.error("❌ Token fetch failed", err);
      navigate("/");
    });
}, [params, navigate]);


  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Authenticating with WSO2...</p>;
}
