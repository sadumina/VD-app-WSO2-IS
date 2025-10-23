from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv



load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET", "supersecret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# -------------------------
# Password hashing helpers
# -------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# -------------------------
# JWT helpers
# -------------------------
def create_access_token(data: dict, expires_delta: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)



load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET", "supersecret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

RESET_SECRET = os.getenv("RESET_SECRET", "resetsecret")
RESET_EXPIRE_MINUTES = 15

# -------------------------
# Password hashing helpers
# -------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# -------------------------
# JWT helpers
# -------------------------
def create_access_token(data: dict, expires_delta: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# -------------------------
# Reset token helpers
# -------------------------
def create_reset_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=RESET_EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, RESET_SECRET, algorithm=ALGORITHM)

def verify_reset_token(token: str):
    try:
        payload = jwt.decode(token, RESET_SECRET, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
