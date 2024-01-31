from .db import app as db
from .sensor import app as sensor

__all__ = ["db", "sensor"]

apps = [db, sensor]
