from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_collection
from app.models.user_model import TokenResponse, UserLogin, UserOut, UserRegister
from app.services.auth_service import get_current_user
from app.utils.helpers import serialize_doc, utc_now
from app.utils.security import create_access_token, hash_password, verify_password


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    users = get_collection("users")
    existing_user = await users.find_one({"email": payload.email.lower()})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    await users.insert_one(
        {
            "name": payload.name.strip(),
            "email": payload.email.lower(),
            "password_hash": hash_password(payload.password),
            "created_at": utc_now(),
        }
    )
    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    users = get_collection("users")
    user = await users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    serialized = serialize_doc(user)
    token = create_access_token({"sub": serialized["id"], "email": serialized["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": serialized["id"], "name": serialized["name"], "email": serialized["email"]},
    }


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "name": current_user["name"], "email": current_user["email"]}
