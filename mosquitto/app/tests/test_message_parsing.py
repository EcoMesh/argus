from datetime import datetime

import pytest
from app.exceptions import InvalidMeshtasticPayload
from app.schema import SensorReading, SensorTelemetry


def test_from_text_message_success():
    message = {
        "from": 123456,
        "timestamp": 1633029442,
        "payload": {"text": "1.23|2.34|3.45|4.56"},
    }
    reading = SensorReading.from_text_message(message)
    # trunk-ignore(bandit/B101)
    assert reading == SensorReading(
        node_id="!1e240",
        timestamp=datetime.fromtimestamp(1633029442),
        temperature=1.23,
        humidity=2.34,
        moisture=3.45,
        ground_distance=4.56,
    )


def test_from_text_message_no_text():
    message = {"payload": {}}
    with pytest.raises(
        InvalidMeshtasticPayload, match="No text property in Meshtastic payload."
    ):
        SensorReading.from_text_message(message)


def test_from_text_message_wrong_parts():
    message = {"payload": {"text": "1.23|2.34"}}
    with pytest.raises(
        InvalidMeshtasticPayload, match="Expected 4 parts in Meshtastic payload."
    ):
        SensorReading.from_text_message(message)


def test_from_text_message_not_float():
    message = {
        "from": 123456,
        "timestamp": 1633029442,
        "payload": {"text": "1.23|2.34|abc|4.56"},
    }
    with pytest.raises(
        InvalidMeshtasticPayload,
        match="Error parsing Meshtastic message. Message part was not float.",
    ):
        SensorReading.from_text_message(message)


def test_missing_telemetry_property():
    message = {"payload": {}}
    with pytest.raises(
        InvalidMeshtasticPayload, match="Error parsing Meshtastic telemetry message."
    ):
        SensorTelemetry.from_telemetry_message(message)
