import logging
from datetime import datetime
from typing import List, Tuple

import aiostream
import pandas as pd
from aiohttp import ClientResponseError, ClientSession
from app import schema
from app.constants import TimeDelta
from app.database import Connection, _get_database_async, r_now
from app.emailer import send_html_email
from app.schema.alarm import ast, rules
from app.stubs.datetime import stubbed_datetime

from rethinkdb import query as r

logger = logging.getLogger(__name__)

# TODO: move to config and use same value in sensors, how do we make this configurable for demo?
RESOLUTION = 300  # 5 minutes - the resolution of the sensor readings


def test_rolling_deviation(df, config: rules.RollingDeviationRule):
    """
    Test if it's raining based on ground distance. This function uses a
    rolling window to compare the average ground distance over a control window
    and a test window.

    This method assumes that records are ordered by time and are relatively consistent.
    """
    control_avg = (
        df[config.control_window.column]
        .rolling(window=config.control_window.timeframe // RESOLUTION)
        .mean()
    )
    test_avg = (
        df[config.test_window.column]
        .rolling(window=config.test_window.timeframe // RESOLUTION)
        .mean()
    )
    deviation = (control_avg - test_avg) / control_avg

    # get last row and check deviation against threshold
    if pd.isna(deviation.iloc[-1]):
        return None

    return deviation.iloc[-1] > config.threshold


def evaluate_alert_logic_ast(df, node: ast.Node):
    match node:
        case ast.And(tests=tests):
            return all(evaluate_alert_logic_ast(df, test) for test in tests)
        case ast.Or(tests=tests):
            return any(evaluate_alert_logic_ast(df, test) for test in tests)
        case ast.Rule(rule=rule):
            match rule:
                case rules.RollingDeviationRule():
                    return test_rolling_deviation(df, rule)
                case rules.TestRule():
                    return rule.value == 1


async def get_sensors_with_readings(conn: Connection, region_id: str) -> List[dict]:
    return (
        await r.table("sensors")
        .filter({"region_id": region_id})
        .merge(
            lambda sensor: {
                "readings": r.table("sensor_readings")
                .get_all(sensor["node_id"], index="node_id")
                .filter(
                    lambda reading: reading["timestamp"]
                    > r_now(sub=TimeDelta.ONE_DAY * 2)
                )
                .order_by(r.asc("timestamp"))
                .coerce_to("array")
            }
        )
        .run(conn)
    )


async def get_alarms_by_region(conn: Connection) -> dict[dict]:
    result = (
        await r.table("alarms")
        .merge(
            lambda alarm: {
                "event": r.table("alarms_events")
                .get_all(alarm["id"], index="alarm_id")
                .filter(lambda event: event["end"].eq(None))
                .merge(
                    lambda event: {
                        "sensors": r.table("alarms_event_records")
                        .get_all(event["id"], index="alarm_event_id")
                        .filter(lambda record: record["end"].eq(None))
                        .group("node_id")
                        .ungroup()
                        .coerce_to("array")
                    }
                )
                .nth(0)
                .default(None)
            }
        )
        .group("region_id")
        .run(conn)
    )

    # clean up the result
    return {
        key: [
            {
                **value,
                "event": (
                    {
                        **value["event"],
                        "sensors": {
                            record["group"]: record["reduction"][0]
                            for record in value["event"]["sensors"]
                        },
                    }
                    if value["event"]
                    else None
                ),
            }
            for value in values
        ]
        for key, values in result.items()
    }


async def create_alarm_event(conn: Connection, alarm_id: str, start: int):
    return (
        await r.table("alarms_events")
        .insert(
            {
                "alarm_id": alarm_id,
                "start": start,
                "end": None,
            }
        )
        .run(conn)
    )


async def create_alarm_event_record(
    conn: Connection, alarm_event_id: str, node_id: str, start: int
):
    return (
        await r.table("alarms_event_records")
        .insert(
            {
                "alarm_event_id": alarm_event_id,
                "node_id": node_id,
                "start": start,
                "end": None,
            }
        )
        .run(conn)
    )


async def set_alarm_event_record_end(conn: Connection, record_id: str, end: datetime):
    await r.table("alarms_event_records").get(record_id).update({"end": end}).run(conn)


async def set_alarm_event_end(conn: Connection, event_id: str, end: int):
    await r.table("alarms_events").get(event_id).update({"end": end}).run(conn)


ALARM_NOTIFICATION_SENSOR_STATE_CHANGE_EMAIL_TEMPLATE = """
<p>The "{alarm_name}" event has {state} for "{node_id}" at {timestamp} in "{region_name}".</p>
"""

ALARM_NOTIFICATION_EVENT_STATE_CHNAGE_EMAIL_TEMPLATE = """
<p>The "{alarm_name}" event has {state} in "{region_name}".</p>
"""


async def send_webhook_notification(notification: dict):
    try:
        async with ClientSession() as session:
            await session.post(
                notification["value"],
                json=notification["payload"],
            )
    except ClientResponseError as e:
        logger.exception(e)


async def send_notification_on_sensor_state_start(
    conn: Connection,
    region: dict,
    alarm: dict,
    timestamped_sensors: List[Tuple[datetime, dict]],
):
    for subscriber in alarm["subscribers"]:
        if (
            subscriber["type"] == "email"
            and subscriber["notify_on"]["sensor_state_change"]
        ):
            await r.table("alarm_notification_history").insert(
                {
                    "type": "email",
                    "reason": "sensor_state_change",
                    "alarm_id": alarm["id"],
                    "value": subscriber["value"],
                    "timestamp": stubbed_datetime.now(),
                }
            ).run(conn)

            try:
                await send_html_email(
                    subscriber["value"],
                    f"Alarm {alarm['name']} Sensor State Changed In {region['name']}",
                    "<br>".join(
                        ALARM_NOTIFICATION_SENSOR_STATE_CHANGE_EMAIL_TEMPLATE.format(
                            alarm_name=alarm["name"],
                            node_id=sensor["node_id"],
                            state="started",
                            timestamp=timestamp.isoformat(),
                            region_name=region["name"],
                        )
                        for timestamp, sensor in timestamped_sensors
                    ),
                )
            except ClientResponseError as e:
                logger.exception(e)
        if (
            subscriber["type"] == "webhook"
            and subscriber["notify_on"]["sensor_state_change"]
        ):
            notification_record = {
                "type": "webhook",
                "reason": "sensor_state_change",
                "sent": not subscriber["interaction_required"],
                "awaiting_interaction": subscriber["interaction_required"],
                "alarm_id": alarm["id"],
                "value": subscriber["value"],
                "timestamp": stubbed_datetime.now(),
                "payload": {
                    "reason": "sensor_state_change",
                    "state": "started",
                    "alarm_id": alarm["id"],
                    "sensors": [
                        {
                            "node_id": sensor["node_id"],
                            "timestamp": timestamp.isoformat(),
                        }
                        for timestamp, sensor in timestamped_sensors
                    ],
                },
            }
            await r.table("alarm_notification_history").insert(notification_record).run(
                conn
            )

            if not subscriber["interaction_required"]:
                send_webhook_notification(notification_record)


async def send_notification_on_sensor_state_end(
    conn: Connection,
    region: dict,
    alarm: dict,
    timestamped_sensors: List[Tuple[datetime, dict]],
):
    logger.warning("Alarm %s ended", alarm["id"])

    for subscriber in alarm["subscribers"]:
        match subscriber:
            case {"type": "email", "notify_on": {"sensor_state_change": True}}:
                await r.table("alarm_notification_history").insert(
                    {
                        "type": "email",
                        "reason": "sensor_state_change",
                        "alarm_id": alarm["id"],
                        "value": subscriber["value"],
                        "timestamp": stubbed_datetime.now(),
                    }
                ).run(conn)

                try:
                    await send_html_email(
                        subscriber["value"],
                        f"Alarm {alarm['name']} Sensor State Changed In {region['name']}",
                        "<br>".join(
                            ALARM_NOTIFICATION_SENSOR_STATE_CHANGE_EMAIL_TEMPLATE.format(
                                alarm_name=alarm["name"],
                                node_id=sensor["node_id"],
                                state="ended",
                                timestamp=timestamp.isoformat(),
                                region_name=region["name"],
                            )
                            for timestamp, sensor in timestamped_sensors
                        ),
                    )
                except ClientResponseError as e:
                    logger.exception(e)
            case {"type": "webhook", "notify_on": {"sensor_state_change": True}}:
                notification_record = {
                    "type": "webhook",
                    "reason": "sensor_state_change",
                    "sent": not subscriber["interaction_required"],
                    "awaiting_interaction": subscriber["interaction_required"],
                    "alarm_id": alarm["id"],
                    "value": subscriber["value"],
                    "timestamp": stubbed_datetime.now(),
                    "payload": {
                        "reason": "sensor_state_change",
                        "state": "ended",
                        "alarm_id": alarm["id"],
                        "sensors": [
                            {
                                "node_id": sensor["node_id"],
                                "timestamp": timestamp.isoformat(),
                            }
                            for timestamp, sensor in timestamped_sensors
                        ],
                    },
                }
                await r.table("alarm_notification_history").insert(
                    notification_record
                ).run(conn)

                if not subscriber["interaction_required"]:
                    send_webhook_notification(notification_record)


async def send_notification_on_alarm_state_start(conn, region, alarm, alarm_event_id):
    for subscriber in alarm["subscribers"]:
        match subscriber:
            case {"type": "email", "notify_on": {"event_start": True}}:
                await r.table("alarm_notification_history").insert(
                    {
                        "type": "email",
                        "reason": "event_start",
                        "alarm_id": alarm["id"],
                        "value": subscriber["value"],
                        "timestamp": stubbed_datetime.now(),
                    }
                ).run(conn)

                try:
                    await send_html_email(
                        subscriber["value"],
                        f"Alarm {alarm['name']} Started In {region['name']}",
                        ALARM_NOTIFICATION_EVENT_STATE_CHNAGE_EMAIL_TEMPLATE.format(
                            alarm_name=alarm["name"],
                            state="started",
                            region_name=region["name"],
                        ),
                    )
                except ClientResponseError as e:
                    logger.exception(e)
            case {"type": "webhook", "notify_on": {"event_start": True}}:
                notification_record = {
                    "type": "webhook",
                    "reason": "event_start",
                    "sent": not subscriber["interaction_required"],
                    "awaiting_interaction": subscriber["interaction_required"],
                    "alarm_id": alarm["id"],
                    "value": subscriber["value"],
                    "timestamp": stubbed_datetime.now(),
                    "payload": {
                        "reason": "event_start",
                        "alarm_id": alarm["id"],
                        "alarm_event_id": alarm_event_id,
                    },
                }
                await r.table("alarm_notification_history").insert(
                    notification_record
                ).run(conn)

                if not subscriber["interaction_required"]:
                    send_webhook_notification(notification_record)


async def send_notification_on_alarm_state_end(conn, region, alarm, alarm_event_id):
    for subscriber in alarm["subscribers"]:
        match subscriber:
            case {"type": "email", "notify_on": {"event_end": True}}:
                await r.table("alarm_notification_history").insert(
                    {
                        "type": "email",
                        "reason": "event_end",
                        "alarm_id": alarm["id"],
                        "value": subscriber["value"],
                        "timestamp": stubbed_datetime.now(),
                    }
                ).run(conn)

                try:
                    await send_html_email(
                        subscriber["value"],
                        f"Alarm {alarm['name']} Ended In {region['name']}",
                        ALARM_NOTIFICATION_EVENT_STATE_CHNAGE_EMAIL_TEMPLATE.format(
                            alarm_name=alarm["name"],
                            state="ended",
                            region_name=region["name"],
                        ),
                    )
                except ClientResponseError as e:
                    logger.exception(e)
            case {"type": "webhook", "notify_on": {"event_end": True}}:
                notification_record = {
                    "type": "webhook",
                    "reason": "event_end",
                    "sent": not subscriber["interaction_required"],
                    "awaiting_interaction": subscriber["interaction_required"],
                    "alarm_id": alarm["id"],
                    "value": subscriber["value"],
                    "timestamp": stubbed_datetime.now(),
                    "payload": {
                        "reason": "event_end",
                        "alarm_id": alarm["id"],
                        "alarm_event_id": alarm_event_id,
                    },
                }
                await r.table("alarm_notification_history").insert(
                    notification_record
                ).run(conn)

                if not subscriber["interaction_required"]:
                    send_webhook_notification(notification_record)


async def cronjob():
    """
    TODO: run checks against each sensor's history

    QUESTIONS:
     - should alarm history be tied to the sensor or the alarm?
     - how do we relate multiple sensors to a single in the alarm state to a single weather event?
    """
    logger.info("Current time %s", stubbed_datetime.now().isoformat())
    conn = await _get_database_async()
    try:
        # collect alarms and group them by region
        alarms = await get_alarms_by_region(conn)
        for region_id, alarms in alarms.items():
            # select the sensor data for the region
            sensors = await aiostream.stream.list(
                await get_sensors_with_readings(conn, region_id)
            )
            region = await r.table("regions").get(region_id).run(conn)

            # evaluate each alarm against the sensor data
            for alarm in alarms:
                sensors_entering_state_of_alarm: List[Tuple[datetime, dict]] = []
                sensors_exiting_state_of_alarm: List[Tuple[datetime, dict]] = []
                for sensor in sensors:
                    logger.debug(
                        "Evaluating sensor %s against alarm %s",
                        sensor["id"],
                        alarm["id"],
                    )
                    if not sensor["readings"]:
                        continue
                    df = pd.DataFrame(sensor["readings"])
                    alarm_status = evaluate_alert_logic_ast(
                        df, schema.alarm.ast.Root(alarm["condition"]).root
                    )
                    if alarm_status:
                        if not alarm["event"]:
                            res = await create_alarm_event(
                                conn,
                                alarm["id"],
                                sensor["readings"][-1]["timestamp"],
                            )
                            alarm_event_id = res["generated_keys"][0]
                            await send_notification_on_alarm_state_start(
                                conn, region, alarm, alarm_event_id
                            )
                        else:
                            alarm_event_id = alarm["event"]["id"]
                        if (
                            not alarm["event"]
                            or sensor["node_id"] not in alarm["event"]["sensors"]
                        ):
                            await create_alarm_event_record(
                                conn,
                                alarm_event_id,
                                sensor["node_id"],
                                sensor["readings"][-1]["timestamp"],
                            )
                            sensors_entering_state_of_alarm.append(
                                (sensor["readings"][-1]["timestamp"], sensor)
                            )
                    elif alarm_status is not None:
                        if (
                            alarm["event"]
                            and sensor["node_id"] in alarm["event"]["sensors"]
                        ):
                            await set_alarm_event_record_end(
                                conn,
                                alarm["event"]["sensors"][sensor["node_id"]]["id"],
                                sensor["readings"][-1]["timestamp"],
                            )
                            sensors_exiting_state_of_alarm.append(
                                (sensor["readings"][-1]["timestamp"], sensor)
                            )
                            del alarm["event"]["sensors"][sensor["node_id"]]
                    else:
                        # unreachable unless we swap out all for different methods that
                        # return the first falsy value
                        logger.warning("Not enough data to evaluate alarm.")

                # if the event has no more sensors active in the current event, end it
                if alarm["event"] and not alarm["event"]["sensors"]:
                    await set_alarm_event_end(
                        conn,
                        alarm["event"]["id"],
                        stubbed_datetime.now(),
                    )
                    await send_notification_on_alarm_state_end(
                        conn, region, alarm, alarm["event"]["id"]
                    )

                if sensors_entering_state_of_alarm:
                    await send_notification_on_sensor_state_start(
                        conn, region, alarm, sensors_entering_state_of_alarm
                    )

                if sensors_exiting_state_of_alarm:
                    await send_notification_on_sensor_state_end(
                        conn, region, alarm, sensors_exiting_state_of_alarm
                    )
    except Exception as e:
        logger.exception(e)
    finally:
        await conn.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(cronjob())
