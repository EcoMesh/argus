import os

import pytz


class TimeDelta:
    ONE_MINUTE = 60
    ONE_HOUR = 60 * ONE_MINUTE
    ONE_DAY = 24 * ONE_HOUR
    TWELVE_HOURS = 12 * ONE_HOUR
    FIVE_MINUTES = 5 * ONE_MINUTE


TZ = pytz.timezone(os.environ.get("TZ", "America/Los_Angeles"))
