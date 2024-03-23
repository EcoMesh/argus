import asyncio
import logging

from aiomqtt import Client
from app.handlers import handle_protobuf_message, handle_text_message
from app.settings import MQTT_HOST, MQTT_PORT, MQTT_TOPIC

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    logging.info("Starting MQTT client")
    async with Client(MQTT_HOST, MQTT_PORT) as client:
        await client.subscribe(MQTT_TOPIC)
        logging.info('Subscribed "%s"', MQTT_TOPIC)
        async for message in client.messages:
            logging.debug("Received message: %s", message)
            try:
                if "/json/" in message.topic:
                    await handle_text_message(message.topic, message.payload.decode())
                else:
                    await handle_protobuf_message(message.topic, message.payload)
            except Exception:
                logger.exception(
                    "An unknown error occurred while handling an incoming message."
                )


asyncio.run(main())
