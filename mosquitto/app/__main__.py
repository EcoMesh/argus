import asyncio

from aiomqtt import Client
from app.handlers import handle_text_message


async def main():
    async with Client("localhost") as client:
        async with client.messages() as messages:
            await client.subscribe("msh/2/json/#")
            async for message in messages:
                await handle_text_message(message.topic, message.payload.decode())


asyncio.run(main())
