from unittest.mock import patch

import pytest
from app.fastapi import app
from app.schema.user import User, UserLoginIn, UserSignupIn
from app.security import create_access_token, decode_jwt, hash_password
from fastapi.testclient import TestClient

client = TestClient(app)


@patch("app.security.get_user_by_email")
def test_login(mock_get_user_by_email):
    mock_get_user_by_email.return_value = User(
        id="testid",
        email="test@test.com",
        password=hash_password("test123"),
        name="Test User",
    )

    # Assuming a user with this email and password exists in the database
    response = client.post(
        "/users/login",
        json=UserLoginIn(email="test@test.com", password="test123").model_dump(),
    )

    assert response.status_code == 200
    data = response.json()

    assert "tokenType" in data
    assert data["tokenType"] == "bearer"

    assert "accessToken" in data
    assert decode_jwt(data["accessToken"])

    assert "user" in data


@patch("app.security.get_user_by_email")
def test_login_invalid_password(mock_get_user_by_email):
    mock_get_user_by_email.return_value = User(
        id="testid",
        email="test@test.com",
        password=hash_password("test123"),
        name="Test User",
    )

    response = client.post(
        "/users/login",
        json=UserLoginIn(email="test@test.com", password="wrongpassword").model_dump(),
    )

    assert response.status_code == 404


@patch("app.security.get_user_by_email")
def test_login_nonexistent_user(mock_get_user_by_email):
    mock_get_user_by_email.return_value = None

    response = client.post(
        "/users/login",
        json=UserLoginIn(email="nonexistent@test.com", password="test123").model_dump(),
    )

    assert response.status_code == 404


@patch("app.security.create_user")
def test_signup(mock_create_user):
    mock_create_user.return_value = User(
        id="newuserid",
        email="newuser@test.com",
        password=hash_password("newpassword"),
        name="New User",
    )

    response = client.post(
        "/users/signup",
        json=UserSignupIn(
            name="New User", email="newuser@test.com", password="newpassword"
        ).model_dump(),
    )

    mock_create_user.assert_called_once()

    assert response.status_code == 200

    data = response.json()

    assert "tokenType" in data
    assert data["tokenType"] == "bearer"

    assert "accessToken" in data
    assert "user" in data


@patch("app.security.get_user_by_email")
def test_signup_existing_user(mock_get_user_by_email):
    mock_get_user_by_email.return_value = User(
        id="testid",
        email="test@test.com",
        password=hash_password("test123"),
        name="Test User",
    )

    response = client.post(
        "/users/signup",
        json=UserSignupIn(
            email="test@test.com", password="test123", name="Test User"
        ).model_dump(),
    )

    assert response.status_code == 400


def test_get_user():
    # Assuming a user with id "testid" exists in the database
    user = User(
        id="newuserid",
        email="newuser@test.com",
        password=hash_password("newpassword"),
        name="New User",
    )
    token = create_access_token(user)
    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert data == user.model_dump(exclude={"password"})


# def test_get_users():
#     response = client.get("/users/")
#     assert response.status_code == 200
#     data = response.json()
#     assert isinstance(data, list)
