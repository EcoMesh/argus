import asyncio
import os
from datetime import datetime, timedelta
from typing import Optional

import jsonpickle
from app.constants import TZ
from app.settings import settings
from app.stubs.datetime import set_stubbed_time
from celery import Celery
from redisbeat.scheduler import RedisScheduler

os.environ["TZ"] = "America/Los_Angeles"

__all__ = [
    "ALARM_IDENTIFICATION_CRONJOB_TASK_SCHEDULE",
]


class DatePickleISO8601(jsonpickle.handlers.DatetimeHandler):
    def flatten(self, obj, data):
        pickler = self.context
        if not pickler.unpicklable:
            return str(obj)
        cls, args = obj.__reduce__()
        flatten = pickler.flatten
        payload = obj.isoformat()
        args = [payload] + [flatten(i, reset=False) for i in args[1:]]
        data["__reduce__"] = (flatten(cls, reset=False), args)
        return data

    def restore(self, data):
        cls, args = data["__reduce__"]
        unpickler = self.context
        restore = unpickler.restore
        cls = restore(cls, reset=False)
        value = datetime.fromisoformat(args[0])
        return value


jsonpickle.handlers.registry.register(datetime, DatePickleISO8601)


app = Celery(
    "tasks",
    broker_url=str(settings.redis_dsn),
    backend_url=str(settings.redis_dsn),
    broker_connection_retry_on_startup=True,
    timezone="America/Los_Angeles",
)

app.conf.update(
    CELERY_REDIS_SCHEDULER_URL=str(settings.redis_dsn),
    CELERY_BEAT_SCHEDULER="redisbeat.RedisScheduler",
    CELERY_REDIS_SCHEDULER_KEY="celery:beat:order_tasks",
    USE_TZ=True,
)


@app.task
def alarm_identification_cronjob_task(
    epoch: datetime = None,
    stubbed_time_speed: int = 1,
    real_time_at_epoch: datetime = None,
):
    """Run the alarm identification cronjob."""
    from app.worker.alarm_identification import (  # delay import so improve hot reload time
        cronjob,
    )

    if epoch:
        set_stubbed_time(epoch, stubbed_time_speed, real_time_at_epoch)
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(cronjob())


@app.task
def delineate_watershed_task(region: dict):
    """Delineate the watershed for a region."""
    from .watershed_delineation import (  # delay import so improve hot reload time
        process_sensors_polygon_by_region,
    )

    return process_sensors_polygon_by_region(region)


ALARM_IDENTIFICATION_CRONJOB_TASK_SCHEDULE = timedelta(hours=1)


def upsert_alarm_identification_cronjob_task(
    epoch: Optional[datetime] = None,
    stubbed_time_speed: int = 1,
    schedule: timedelta = ALARM_IDENTIFICATION_CRONJOB_TASK_SCHEDULE,
):
    """Upsert the alarm identification cronjob task."""
    args = (epoch, stubbed_time_speed, datetime.now(tz=TZ)) if epoch else tuple()
    scheduler.remove("alarm_identification_cronjob")
    scheduler.add(
        name="alarm_identification_cronjob",
        task="app.worker.alarm_identification_cronjob_task",
        schedule=schedule,
        args=args,
    )


if __name__ == "__main__":
    scheduler = RedisScheduler(app=app)

    upsert_alarm_identification_cronjob_task(
        epoch=datetime.now(tz=TZ) - timedelta(days=2),
    )
