import asyncio

from aiomqtt import Client
from app.handlers import handle_text_message
from app.settings import MQTT_HOST, MQTT_PORT


async def main():
    async with Client(MQTT_HOST, MQTT_PORT) as client:
        await client.subscribe("msh/2/json/#")
        async for message in client.messages:
            await handle_text_message(message.topic, message.payload.decode())


asyncio.run(main())
