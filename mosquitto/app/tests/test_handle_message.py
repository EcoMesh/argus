from datetime import datetime
from unittest.mock import patch

import pytest
from app.handlers import handle_text_message
from app.schema import SensorReading, SensorTelemetry


@pytest.mark.asyncio
async def test_sensor_reading_message():
    with patch("app.handlers.save_reading") as save_reading:
        await handle_text_message(
            "msh/2/json/MediumFast/!833c2233",
            '{"channel":0,"from":3818489127,"id":603466231,"payload":{"text":"75.56|62.2|0.0|4.27"},"rssi":-14,"sender":"!833c2233","snr":11.25,"timestamp":1705891140,"to":4294967295,"type":"text"}',
        )

    save_reading.assert_called_once_with(
        SensorReading(
            node_id="!833c2233",
            timestamp=datetime.fromtimestamp(1705891140),
            temperature=75.56,
            humidity=62.2,
            moisture=0.0,
            ground_distance=4.27,
        )
    )


@pytest.mark.asyncio
async def test_telemetry_message():
    with patch("app.handlers.save_telemetry") as save_telemetry:
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
