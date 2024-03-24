import unittest
from datetime import datetime, timedelta
from unittest.mock import patch

from app.constants import TZ
from app.stubs import datetime as stubbed_datetime_module
from freezegun import freeze_time


class TestStubbedDatetime(unittest.TestCase):
    def setUp(self):
        # Reset the stubbed time before each test
        stubbed_datetime_module.epoch = None
        stubbed_datetime_module.real_time_at_epoch = None
        stubbed_datetime_module.stubbed_time_speed = 1

    def test_set_stubbed_time(self):
        now = datetime.now()
        stubbed_datetime_module.set_stubbed_time(now, speed=2)
        self.assertEqual(stubbed_datetime_module.epoch, now.astimezone(TZ))
        self.assertEqual(stubbed_datetime_module.stubbed_time_speed, 2)
        self.assertIsNotNone(stubbed_datetime_module.real_time_at_epoch)

    def test_is_time_stubbed(self):
        self.assertFalse(stubbed_datetime_module.is_time_stubbed())
        stubbed_datetime_module.set_stubbed_time(datetime.now(), speed=2)
        self.assertTrue(stubbed_datetime_module.is_time_stubbed())

    def test_stubbed_datetime_now(self):
        fake_time = datetime.now(tz=TZ)

        with freeze_time(fake_time):
            now = datetime.now(tz=TZ)
            stubbed_datetime_module.set_stubbed_time(now, speed=2)
            self.assertEqual(stubbed_datetime_module.stubbed_datetime.now(), now)

        with freeze_time(fake_time + timedelta(seconds=1)):
            self.assertEqual(
                stubbed_datetime_module.stubbed_datetime.now(),
                fake_time + timedelta(seconds=2),
            )
