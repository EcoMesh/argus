from typing import List

from app import security
from app.database import Connection, get_database
from app.schema.user import (
    UserLoginIn,
    UserLoginOut,
    UserOut,
    UserSignupIn,
    UserSignupOut,
)
from app.security import get_current_user
from app.utils.security import verify_password
from fastapi import APIRouter, Depends, HTTPException, Path

from rethinkdb import query as r

router = APIRouter(prefix="/users", tags=["users"])
protected = APIRouter(dependencies=[Depends(get_current_user)])
public = APIRouter()


@public.post("/login", response_model=UserLoginOut)
async def login(payload: UserLoginIn, conn: Connection = Depends(get_database)):
    user = await security.get_user_by_email(payload.email, conn)
    if not user:
        raise HTTPException(status_code=404, detail="Wrong email or password")

    if not verify_password(payload.password, user.password):
        raise HTTPException(status_code=404, detail="Wrong email or password")

    token = security.create_access_token(user)

    return UserLoginOut(
        access_token=token, user=UserOut(**security.sanitize_user(user))
    )


@public.post("/signup", response_model=UserSignupOut)
async def signup(payload: UserSignupIn, conn: Connection = Depends(get_database)):
    user = await security.get_user_by_email(payload.email, conn)
    if user:
        raise HTTPException(status_code=400, detail="User email already exists")

    user = await security.create_user(payload, conn)
    token = security.create_access_token(user)
    return UserSignupOut(
        access_token=token, user=UserOut(**security.sanitize_user(user))
    )


@protected.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str = Path(
        ...,
        description='The UUID of a user or "me" to return the currently logged in user.',
        examples=["me"],
    ),
    user: UserOut = Depends(security.get_current_user),
):
    """Retrieve a user by id."""
    if user_id == "me":
        return user

    raise HTTPException(
        status_code=400, detail="Arbitrary user lookups have not been implemented yet."
    )


@protected.get("/", response_model=List[UserOut])
async def get_users(conn: Connection = Depends(get_database)):
    return (await r.table("users").without("password").run(conn)).items


router.include_router(public)
router.include_router(protected)
