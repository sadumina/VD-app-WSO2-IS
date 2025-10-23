from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import users_collection
from app.utils import hash_password, verify_password, create_reset_token, verify_reset_token
from jose import jwt
from datetime import datetime, timedelta
import os, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from app.auth import get_current_user, role_required

# Load environment
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "supersecret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Outlook config
SMTP_SERVER = "smtp.office365.com"
SMTP_PORT = 587
OUTLOOK_EMAIL = os.getenv("OUTLOOK_EMAIL")
OUTLOOK_PASSWORD = os.getenv("OUTLOOK_PASSWORD")

router = APIRouter()

# -------------------------
# Schemas
# -------------------------
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    fuel_card_no: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    fuel_card_no: Optional[str] = None

class AdminUpdateUserRequest(BaseModel):
    name: Optional[str] = None
    fuel_card_no: Optional[str] = None
    role: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# -------------------------
# Helper: Send reset email
# -------------------------
def send_reset_email(email: str, reset_link: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "LogiTrack - Password Reset"
    msg["From"] = OUTLOOK_EMAIL
    msg["To"] = email

    html = f"""
    <html>
      <body>
        <p>Hello,<br><br>
           Click the link below to reset your password:<br>
           <a href="{reset_link}">{reset_link}</a><br><br>
           If you did not request this, ignore this email.
        </p>
      </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(OUTLOOK_EMAIL, OUTLOOK_PASSWORD)
        server.sendmail(OUTLOOK_EMAIL, email, msg.as_string())

# -------------------------
# Register
# -------------------------
@router.post("/register")
async def register_user(req: RegisterRequest):
    existing = await users_collection.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = {
        "name": req.name,
        "email": req.email,
        "password": hash_password(req.password),
        "fuel_card_no": req.fuel_card_no,
        "role": "employee",
        "created_at": datetime.utcnow(),
    }
    result = await users_collection.insert_one(user)
    return {"msg": "User registered successfully", "id": str(result.inserted_id)}

# -------------------------
# Login
# -------------------------
@router.post("/login", response_model=TokenResponse)
async def login_user(req: LoginRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    to_encode = {
        "sub": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

# -------------------------
# Forgot Password
# -------------------------
@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_reset_token(req.email)
    reset_link = f"http://localhost:5173/reset-password?token={token}"

    try:
        send_reset_email(req.email, reset_link)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")

    return {"message": "Password reset link sent to your email"}

# -------------------------
# Reset Password
# -------------------------
@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    email = verify_reset_token(req.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    hashed_pw = hash_password(req.new_password)
    await users_collection.update_one(
        {"email": email},
        {"$set": {"password": hashed_pw}}
    )

    return {"message": "Password reset successful"}

# -------------------------
# Get Current User
# -------------------------
@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    db_user = await users_collection.find_one({"email": user["sub"]}, {"_id": 0, "password": 0})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# -------------------------
# Update My Profile
# -------------------------
@router.put("/me")
async def update_profile(req: UpdateProfileRequest, user=Depends(get_current_user)):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No changes provided")

    result = await users_collection.update_one(
        {"email": user["sub"]},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="No changes applied")

    return {"msg": "✅ Profile updated successfully"}

# -------------------------
# Admin: Get All Users
# -------------------------
@router.get("/all")
async def get_all_users(user=Depends(role_required("admin"))):
    users = await users_collection.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

# -------------------------
# Admin: Update User
# -------------------------
@router.put("/{email}")
async def admin_update_user(email: str, req: AdminUpdateUserRequest, user=Depends(role_required("admin"))):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No changes provided")

    result = await users_collection.update_one(
        {"email": email},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"msg": f"✅ User {email} updated successfully"}

# -------------------------
# Admin: Delete User
# -------------------------
@router.delete("/{email}")
async def delete_user(email: str, user=Depends(role_required("admin"))):
    if email == user["sub"]:
        raise HTTPException(status_code=403, detail="Admins cannot delete themselves")

    result = await users_collection.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"msg": f"🗑️ User {email} deleted successfully"}
