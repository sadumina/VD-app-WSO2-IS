from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, travels, admin
from app.database import db
from app.wso2_oidc import exchange_code_for_token, get_userinfo
import ssl
import urllib3

# Disable SSL warnings for self-signed certs (WSO2 default)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = FastAPI(title="FuelTrackr API")

# ✅ Allow frontend and cloud origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://localhost:5173",
        "http://127.0.0.1:5173",
        "https://www.yourcompanydomain.com",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # ✅ allow all vercel.app subdomains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include Routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(travels.router, prefix="/api/travels", tags=["Travels"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# ✅ MongoDB check
@app.on_event("startup")
async def startup_db_client():
    try:
        await db.command("ping")
        print("✅ MongoDB connection established successfully")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)


# ✅ Root endpoint
@app.get("/")
async def root():
    return {"msg": "🚀 FuelTrackr API running successfully"}


## ---------------------------------------------------------------------
# 🔐 WSO2 OIDC Callback
# ---------------------------------------------------------------------
@app.get("/api/auth/callback")
async def oidc_callback(code: str, request: Request):
    """
    Handles redirect from WSO2 IS.
    Example redirect: http://localhost:5173/callback?code=abc123
    """
    try:
        # 🧱 Block reuse of authorization codes
        if code in used_codes:
            raise HTTPException(status_code=400, detail="Authorization code already used")
        used_codes.add(code)

        # ✅ Must match exactly as in WSO2 Authorized Redirect URLs
        redirect_uri = "http://localhost:5173/callback"

        # 🔁 Exchange the authorization code for access & ID tokens
        token_data = exchange_code_for_token(code, redirect_uri)

        if "access_token" not in token_data:
            raise HTTPException(status_code=401, detail="Invalid token response from WSO2")

        # 🧩 Fetch user info using access token
        user_info = get_userinfo(token_data["access_token"])

        # 🧠 Debug logs
        print("✅ Token exchange successful.")
        print("Access Token:", token_data.get("access_token")[:30], "...")
        print("👤 User Info:", user_info)

        # ✅ Send response to frontend
        return {
            "status": "success",
            "access_token": token_data.get("access_token"),
            "id_token": token_data.get("id_token"),
            "user": user_info,
        }

    except Exception as e:
        print("❌ OIDC callback error:", e)
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")
