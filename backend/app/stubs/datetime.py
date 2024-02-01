from datetime import datetime, timedelta
from typing import Optional

from app.constants import TZ

stubbed_time_speed = 1
epoch: Optional[datetime] = None
real_time_at_epoch: Optional[datetime] = None


def is_time_stubbed():
    if not epoch:
        return False

    return True


def set_stubbed_time(now: datetime, speed: int = 1, real_time: datetime = None):
    """Sets the stubbed time and speed of time.

    Args:
        now (datetime): The time to set the clock to.
        speed (int, optional): A multiplier for the speed of time. Defaults to 1.

    Example:
        set_stubbed_time(datetime.now(), 60 * 60)  # 1 second appears to be 1 hour
    """
    global real_time_at_epoch, stubbed_time_speed, epoch
    stubbed_time_speed = speed
    if not real_time:
        real_time = datetime.now()
    real_time_at_epoch = real_time
    epoch = now
    if epoch.tzinfo is None:
        epoch = epoch.astimezone(TZ)


class stubbed_datetime(datetime):
    def now(*args, **kwargs):
        kwargs.setdefault("tz", TZ)
        now = datetime.now(*args, **kwargs)
        if is_time_stubbed():
            return epoch + ((now - real_time_at_epoch) * stubbed_time_speed)
        return now


if __name__ == "__main__":
    import time

    set_stubbed_time(datetime.now(), 60 * 60)
    start = stubbed_datetime.now()
    time.sleep(1)
    end = stubbed_datetime.now()
    print(end - start)  # ~1 minute appears to have passed

    set_stubbed_time(datetime.now(), 60)
    start = stubbed_datetime.now()
    time.sleep(1)
    end = stubbed_datetime.now()
    print(end - start)  # ~1 hour appears to have passed
