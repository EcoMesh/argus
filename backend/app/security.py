from datetime import UTC, datetime, timedelta
from traceback import print_exc
from typing import Optional

from app import schema
from app.database import Connection
from app.settings import settings
from app.utils.security import decode_jwt, encode_jwt, hash_password, verify_password
from fastapi import Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError
from pydantic import ValidationError

from rethinkdb import query as r

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def sanitize_user(user: schema.user.User):
    return user.model_dump(exclude={"password"})


def create_access_token(user: schema.user.User):
    return encode_jwt(
        sanitize_user(user),
        datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes),
    )


async def get_current_user(
    authorization: str = Header(None),
) -> schema.user.User:
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )
    try:
        header_parts = authorization.split(maxsplit=1)
        if len(header_parts) != 2:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header",
            )
        token_type, access_token = header_parts

        if token_type.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header",
            )
        payload = decode_jwt(access_token)
        del payload["exp"]
        return schema.user.UserOut(**payload)
    except ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        ) from e
    except JWTError as e:
        print_exc(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from e
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
