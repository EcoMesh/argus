from datetime import datetime, timedelta

import bcrypt
import freezegun
import pytest
from app.settings import settings
from app.utils.security import decode_jwt, encode_jwt, hash_password, verify_password
from jose import jwt


def test_hash_password_and_verify_password():
    # Test password
    password = "test123"

    # Hash the password
    hashed_password = hash_password(password)

    # Verify the password
    assert verify_password(password, hashed_password)


def test_verify_password_with_empty_string():
    # Test that the function returns False for empty password
    assert not verify_password("", "")


def test_encode_and_decode_jwt():
    # Test data
    data = {"user_id": 1, "username": "test"}

    # Encode the data into a JWT
    token = encode_jwt(data)

    # Decode the JWT
    decoded_data = decode_jwt(token)

    # Check that the decoded data matches the original data
    assert decoded_data == data


@freezegun.freeze_time("2022-01-01 00:00")
def test_encode_jwt_with_expiration():
    # Test data
    data = {"user_id": 1, "username": "test"}

    # Encode the data into a JWT with an expiration time
    expires = datetime.now() + timedelta(minutes=30)
    token = encode_jwt(data, expires)
    data["exp"] = int(expires.timestamp())

    # Decode the JWT
    decoded_data = decode_jwt(token)

    # Check that the decoded data matches the original data
    assert decoded_data == data

    # Check that the JWT cannot be decoded after the expiration time
    with freezegun.freeze_time("2022-01-01 01:00"):
        with pytest.raises(jwt.ExpiredSignatureError):
            decode_jwt(token)
