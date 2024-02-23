import json

import aiohttp
from app.settings import settings


# TODO: make async
async def send_email(payload):
    if payload["to"][0]["email"].endswith("@testing.com"):
        print("sendEmail: " + json.dumps(payload))
        return

    headers = {
        "accept": "application/json",
        "api-key": settings.brevo_api_key,
        "content-type": "application/json",
    }

    async with aiohttp.ClientSession(raise_for_status=True) as session:
        async with session.post(
            "https://api.brevo.com/v3/smtp/email", json=payload, headers=headers
        ) as response:
            return await response.json()


async def send_html_email(to, subject, html):
    payload = {
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html,
        "sender": {
            "name": "EcoMesh Alarm System",
            "email": "noreply@littlehiddengems.link",
        },
    }

    return await send_email(payload)


if __name__ == "__main__":
    import asyncio

    async def main():
        res = await send_html_email(
            "noahcardoza@gmail.com",
            "Test",
            "This is a test email from the Brevo API",
        )
        print(res)

    asyncio.run(main())
