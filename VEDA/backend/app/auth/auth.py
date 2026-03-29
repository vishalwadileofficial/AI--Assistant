"""
VEDA AI — Authentication Module
Demo credentials: admin@veda.ai / veda2024
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from jose import jwt
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/auth", tags=["auth"])

# Secret key for JWT — in production, use a secure env variable
SECRET_KEY = "veda-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Demo user database
DEMO_USERS = {
    "admin@veda.ai": {
        "password": "veda2024",
        "name": "VEDA Admin",
    }
}


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    name: str


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = DEMO_USERS.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": request.email, "name": user["name"]}
    )

    return LoginResponse(
        access_token=access_token,
        email=request.email,
        name=user["name"],
    )


@router.get("/verify")
async def verify(token: str):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"valid": True, "email": payload.get("sub"), "name": payload.get("name")}
