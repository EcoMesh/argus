import logging
from pprint import pprint
from typing import List

import pandas as pd
from app import schema
from app.constants import TimeDelta
from app.database import Connection, _get_database_async
from app.schema.alarm import ast, rules

from rethinkdb import query as r

logger = logging.getLogger(__name__)

logging.basicConfig(level=logging.DEBUG)


def test_ground_distance(df, config: rules.GroundDistanceRule):
    """
    Test if it's raining based on ground distance. This function uses a
    rolling window to compare the average ground distance over a control window
    and a test window.

    This method assumes that records are ordered by time and are relatively consistent.
    """
    control_avg = (
        df[config.control_window.column]
        .rolling(window=config.control_window.timeframe // config.resolution)
        .mean()
    )
    test_avg = (
        df[config.test_window.column]
        .rolling(window=config.test_window.timeframe // config.resolution)
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
                case rules.GroundDistanceRule():
                    return test_ground_distance(df, rule)
                case rules.TestRule():
                    return rule.value == 1


async def get_sensors_with_readings(conn: Connection) -> List[dict]:
    return (
        await r.table("sensors")
        .merge(
            lambda sensor: {
                "readings": r.table("sensor_readings")
                .get_all(sensor["node_id"], index="node_id")
                .filter(
                    lambda reading: reading["timestamp"]
                    > r.now().sub(TimeDelta.ONE_DAY * 2)
                )
                .order_by(r.asc("timestamp"))
                .coerce_to("array")
            }
        )
        .run(conn)
    ).items


async def get_alarms(conn: Connection) -> List[dict]:
    items = (
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
        .run(conn)
    ).items

    for item in items:
        if item["event"]:
            item["event"]["sensors"] = {
                record["group"]: record["reduction"]
                for record in item["event"]["sensors"]
            }

    return items


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


async def set_alarm_event_record_end(conn: Connection, record_id: str, end: int):
    await r.table("alarms_event_records").get(record_id).update({"end": end}).run(conn)


async def set_alarm_event_end(conn: Connection, event_id: str, end: int):
    await r.table("alarms_events").get(event_id).update({"end": end}).run(conn)


async def send_notification(alarm: dict, sensors: List[dict]):
    logger.warning(
        "Alarm %s triggered by sensors %s", alarm["id"], [s["id"] for s in sensors]
    )


async def cronjob():
    """
    TODO: run checks against each sensor's history

    QUESTIONS:
     - should alarm history be tied to the sensor or the alarm?
     - how do we relate multiple sensors to a single in the alarm state to a single weather event?
    """
    conn = await _get_database_async()
    try:
        alarms = await get_alarms(conn)
        sensors = await get_sensors_with_readings(conn)
        print(len(sensors))
        for alarm in alarms:
            new_sensors_in_alarm = []
            for sensor in sensors:
                logger.debug(
                    "Evaluating sensor %s against alarm %s", sensor["id"], alarm["id"]
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
                        new_sensors_in_alarm.append(sensor)
                elif alarm_status is not None:
                    if (
                        alarm["event"]
                        and sensor["node_id"] in alarm["event"]["sensors"]
                    ):
                        await set_alarm_event_record_end(
                            conn,
                            alarm["event"][sensor["id"]],
                            sensor["readings"][-1]["timestamp"],
                        )
                        del alarm["event"][sensor["id"]]
                        if not alarm["event"]["records"]:
                            await set_alarm_event_end(
                                conn,
                                alarm["event"]["id"],
                                sensor["readings"][-1]["timestamp"],
                            )
                else:
                    # unreachable unless we swap out all for different methods that
                    # return the first falsy value
                    logger.warning("Not enough data to evaluate alarm.")
            if new_sensors_in_alarm:
                await send_notification(alarm, new_sensors_in_alarm)
    except Exception as e:
        logger.exception(e)
    finally:
        await conn.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(cronjob())
