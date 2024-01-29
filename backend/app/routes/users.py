from app import security
from app.database import Connection, get_database
from app.schema.user import (
    UserLoginIn,
    UserLoginOut,
    UserOut,
    UserSignupIn,
    UserSignupOut,
)
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/login", response_model=UserLoginOut)
async def login(payload: UserLoginIn, conn: Connection = Depends(get_database)):
    user = await security.get_user_by_email(payload.email, conn)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not security.verify_password(payload.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    token = security.create_access_token(user.model_dump(exclude={"password"}))

    return UserLoginOut(
        access_token=token, user=UserOut(**user.model_dump(exclude={"password"}))
    )


@router.post("/signup", response_model=UserSignupOut)
async def signup(payload: UserSignupIn, conn: Connection = Depends(get_database)):
    user = await security.get_user_by_email(payload.email, conn)
    if user:
        raise HTTPException(status_code=400, detail="User email already exists")

    user = await security.create_user(payload, conn)
    token = security.create_access_token(user.model_dump(exclude={"password"}))
    return UserSignupOut(
        access_token=token, user=UserOut(**user.model_dump(exclude={"password"}))
    )
