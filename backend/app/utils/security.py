from datetime import datetime, timedelta, timezone
import hashlib
from typing import Any

from jose import JWTError, jwt
import bcrypt

from app.config import get_settings


settings = get_settings()


def _bcrypt_input(password: str) -> bytes:
    # bcrypt 5 rejects inputs over 72 bytes; SHA-256 prehashing keeps behavior stable.
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_bcrypt_input(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(_bcrypt_input(plain_password), hashed_password.encode("utf-8"))


def create_access_token(data: dict[str, Any]) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {**data, "exp": expires}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
