from datetime import datetime, timedelta
from traceback import print_exc
from typing import Optional

import bcrypt
from app import schema
from app.database import Connection
from app.settings import settings
from fastapi import Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from rethinkdb import query as r

JWT_ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        password=plain_password.encode("utf-8"),
        hashed_password=hashed_password.encode("utf-8"),
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(
    authentication: str = Header(...),
) -> schema.user.User:
    try:
        payload = jwt.decode(
            authentication, settings.jwt_secret, algorithms=[JWT_ALGORITHM]
        )
        return schema.user.User(**payload)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    except ValidationError as e:
        print_exc(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credentials invalid",
        )
    except Exception as e:
        print_exc(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Fatal error while validating credentials",
        )


def authenticate_user(user: schema.user.User, password: str):
    if user is None:
        return False
    return verify_password(password, user.password)


async def get_user_by_email(email: str, conn: Connection) -> Optional[schema.user.User]:
    res = await r.table("users").filter({"email": email}).run(conn)
    users = list(res.items)
    if not users:
        return None
    return schema.user.User(**users[0])


async def create_user(
    payload: schema.user.UserSignupIn, conn: Connection
) -> schema.user.User:
    user = schema.user.UserSignupIn(
        **payload.model_dump(exclude={"password"}),
        password=hash_password(payload.password)
    )
    res = await r.table("users").insert(user.model_dump()).run(conn)
    return schema.user.User(id=res["generated_keys"][0], **user.model_dump())
