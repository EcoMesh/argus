from .base import BaseSchema


class User(BaseSchema):
    id: str
    email: str
    password: str
    name: str


class UserOut(BaseSchema):
    id: str
    email: str
    name: str


class UserLoginIn(BaseSchema):
    email: str
    password: str


class UserLoginOut(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserSignupIn(BaseSchema):
    email: str
    password: str
    name: str


class UserSignupOut(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
