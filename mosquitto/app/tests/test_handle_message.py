from datetime import datetime
from unittest.mock import patch

import pytest
import pytz
from app.handlers import handle_text_message
from app.schema import SensorReading, SensorTelemetry

local_tz = pytz.timezone("America/Los_Angeles")


@pytest.mark.asyncio
@patch("app.handlers.save_reading")
async def test_sensor_reading_message(save_reading):
    await handle_text_message(
        "msh/2/json/MediumFast/!833c2233",
        '{"channel":0,"from":3818489127,"id":603466231,"payload":{"text":"75.56|62.2|0.0|4.27"},"rssi":-14,"sender":"!833c2233","snr":11.25,"timestamp":1705891140,"to":4294967295,"type":"text"}',
    )

    save_reading.assert_called_once_with(
        603466231,
        SensorReading(
            node_id="!e3998527",
            timestamp=datetime.fromtimestamp(1705891140),
            temperature=75.56,
            humidity=62.2,
            moisture=0.0,
            ground_distance=4.27,
        ),
    )


@pytest.mark.asyncio
@patch("app.handlers.save_telemetry")
async def test_telemetry_message(save_telemetry):
    await handle_text_message(
        "msh/2/json/MediumFast/!833c2233",
        '{"channel":0,"from":3818489127,"id":603466238,"payload":{"air_util_tx":0.0176666676998138,"battery_level":94,"channel_utilization":2.44166660308838,"voltage":4.14499998092651},"rssi":-14,"sender":"!833c2233","snr":11,"timestamp":1705891168,"to":4294967295,"type":"telemetry"}',
    )

    save_telemetry.assert_called_once_with(
        SensorTelemetry(
            node_id="!833c2233",
            timestamp=datetime.fromtimestamp(1705891168),
            battery_level=94,
            voltage=4.14499998092651,
        )
    )


@pytest.mark.asyncio
@patch("app.handlers.save_reading")
async def test_invalid_message_payload(save_reading):
    await handle_text_message(
        "msh/2/json/MediumFast/!833c2233",
        '{"channel":0,"from":3818489127,"id":603466231,"payload":{"text":""},"rssi":-14,"sender":"!833c2233","snr":11.25,"timestamp":1705891140,"to":4294967295,"type":"text"}',
    )

    save_reading.assert_not_called()


@pytest.mark.asyncio
@patch("app.handlers.save_telemetry")
async def test_invalid_telemetry_payload(save_telemetry):
    await handle_text_message(
        "msh/2/json/MediumFast/!833c2233",
        '{"channel":0,"from":3818489127,"id":603466231,"payload":{},"rssi":-14,"sender":"!833c2233","snr":11.25,"timestamp":1705891140,"to":4294967295,"type":"telemetry"}',
    )

    save_telemetry.assert_not_called()
