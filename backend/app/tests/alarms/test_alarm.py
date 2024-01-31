import csv
from datetime import datetime
from unittest.mock import patch

import pytest
from app.tasks.alarm_identification import cronjob

ALARMS = [
    {
        "condition": {
            "tests": [
                {
                    "rule": {
                        "control_window": {
                            "column": "ground_distance",
                            "timeframe": 86400,
                        },
                        "resolution": 300,
                        "test_window": {"column": "ground_distance", "timeframe": 3600},
                        "threshold": 0.09,
                        "type": "ground_distance",
                    },
                    "type": "rule",
                }
            ],
            "type": "and",
        },
        "event": None,
        "id": "c5b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d4d",
        "interaction_required": False,
        "name": "Test",
        "subscribers": ["noahcardoza@gmail.com"],
    }
]

with open("app/tests/fixtures/ground_level_sensor_readings.833c2233.csv") as f:
    reader = csv.DictReader(f)
    SENSOR_READINGS = [
        {
            "node_id": row["node_id"],
            "timestamp": datetime.fromtimestamp(int(row["timestamp"])),
            "temperature": float(row["temperature"]),
            "humidity": float(row["humidity"]),
            "moisture": float(row["moisture"]),
            "ground_distance": float(row["ground_distance"]),
        }
        for row in reader
    ]

SENSORS = [
    {
        "coordinates": {"lat": 1, "lon": 2},
        "id": "4df86a94-dac5-499e-95b1-9ee7b8f65963",
        "node_id": "!833c2233",
        "readings": SENSOR_READINGS,
        "uplink": True,
    },
]


@patch("app.tasks.alarm_identification.send_notification")
@patch("app.tasks.alarm_identification.create_alarm_event")
@patch("app.tasks.alarm_identification.create_alarm_event_record")
@patch("app.tasks.alarm_identification.set_alarm_event_record_end")
@patch("app.tasks.alarm_identification.set_alarm_event_end")
@patch("app.tasks.alarm_identification.get_sensors_with_readings", return_value=SENSORS)
@patch("app.tasks.alarm_identification.get_alarms", return_value=ALARMS)
@patch("app.tasks.alarm_identification._get_database_async")
@pytest.mark.asyncio
async def test_cronjob(
    get_database_async,
    get_alarms,
    get_sensors_with_readings,
    set_alarm_event_end,
    set_alarm_event_record_end,
    create_alarm_event_record,
    create_alarm_event,
    send_notification,
):
    create_alarm_event.return_value = {"generated_keys": ["123"]}
    await cronjob()
    get_database_async.assert_called_once()
    send_notification.assert_called_once_with(ALARMS[0], SENSORS)
    create_alarm_event.assert_called_once_with(
        get_database_async.return_value,
        ALARMS[0]["id"],
        SENSOR_READINGS[-1]["timestamp"],
    )
    create_alarm_event_record.assert_called_once_with(
        get_database_async.return_value,
        "123",
        SENSOR_READINGS[0]["node_id"],
        SENSOR_READINGS[-1]["timestamp"],
    )
