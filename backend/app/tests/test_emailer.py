import asyncio
from unittest.mock import patch

import pytest
from aioresponses import aioresponses
from app.emailer import send_email, send_html_email
from app.settings import settings


@pytest.fixture
def mock_aioresponse():
    with aioresponses() as m:
        yield m


def test_send_email(mock_aioresponse):
    payload = {
        "to": [{"email": "test@gmail.com"}],
        "subject": "Test",
        "sender": {
            "name": "Test Sender",
            "email": "test@sender.com",
        },
    }

    mock_aioresponse.post(
        "https://api.brevo.com/v3/smtp/email", payload=payload, status=200
    )

    asyncio.run(send_email(payload))

    mock_aioresponse.assert_called_once_with(
        "https://api.brevo.com/v3/smtp/email",
        method="POST",
        json=payload,
        headers={
            "accept": "application/json",
            "api-key": settings.brevo_api_key,
            "content-type": "application/json",
        },
    )


@patch("app.emailer.send_email")
def test_send_html_email(send_mail):
    send_mail.return_value = None

    # Define sample parameters
    to = "test@testing.com"
    subject = "Test"
    html = "Test content"

    asyncio.run(send_html_email(to, subject, html))

    send_mail.assert_called_once_with(
        {
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html,
            "sender": {
                "name": "EcoMesh Alarm System",
                "email": "noreply@littlehiddengems.link",
            },
        }
    )
