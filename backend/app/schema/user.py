from pydantic import BaseModel


class User(BaseModel):
    id: str
    email: str
    password: str
    name: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str


class UserLoginIn(BaseModel):
    email: str
    password: str


class UserLoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserSignupIn(BaseModel):
    email: str
    password: str
    name: str


class UserSignupOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
