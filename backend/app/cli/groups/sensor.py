# trunk-ignore-all(bandit/B311)
import csv
import random
import sys
from datetime import datetime, timedelta

import pytz
import typer
from app.constants import TimeDelta
from app.database import _get_database_sync
from app.schema.sensor import SensorReading

from rethinkdb import query as r

CSV_HEADER = (
    "node_id",
    "timestamp",
    "temperature",
    "humidity",
    "moisture",
    "ground_distance",
)


class RainfallDataGenerator:
    def __init__(
        self,
        include_evaporation: bool,
        node_id: str,
        start_time: datetime,
        delta: timedelta = timedelta(minutes=5),
    ):
        self.include_evaporation = include_evaporation
        self.delta = delta
        self.ground_distance_max = 40
        self.ground_distance = 40
        self.start_time = start_time
        self.node_id = node_id

    def generate_steady_data(self):
        rand = random.random()
        if rand < 0.05:
            distance = random.randint(30, 40)
        elif rand < 0.15:
            distance = random.randint(35, 40)
        else:
            distance = random.randint(38, 40)
        yield SensorReading(
            self.node_id,
            self.start_time,
            0,
            0,
            0,
            distance,
        )
        self.start_time += self.delta

    def __iter__(self):
        for _ in range(2 * TimeDelta.ONE_DAY // self.delta.seconds):
            yield from self.generate_steady_data()

        for _ in range(TimeDelta.TWELVE_HOURS // self.delta.seconds):
            self.ground_distance += random.randint(0, 20) / 100
            if random.random() > 0.8:
                self.ground_distance -= random.randint(0, 200) / 100
            self.ground_distance = min(self.ground_distance, self.ground_distance_max)
            yield SensorReading(
                self.node_id,
                self.start_time,
                0,
                0,
                0,
                self.ground_distance,
            )
            self.start_time += self.delta

        if not self.include_evaporation:
            return

        for _ in range(TimeDelta.TWELVE_HOURS // self.delta.seconds):
            self.ground_distance += random.randint(0, 20) / 100
            self.ground_distance = min(self.ground_distance, self.ground_distance_max)
            SensorReading(self.node_id, self.start_time, 0, 0, 0, self.ground_distance)
            self.start_time += self.delta

        for _ in range(2 * TimeDelta.ONE_DAY // self.delta.seconds):
            yield from self.generate_steady_data()


def generator_to_csv(file, generator):
    writer = csv.writer(file)
    writer.writerow(CSV_HEADER)
    for reading in generator:
        writer.writerow((reading[0], int(reading[1].timestamp()), *reading[2:]))


app = typer.Typer(
    name="sensor", help="A collation of commands to manage and mock sensor data."
)

tz = pytz.timezone("America/Los_Angeles")


@app.command()
def generate_rainfall_data(
    file: str = None,
    evaporation: bool = False,
    node_id: str = "!node-id",
    to_db: bool = False,
):
    generator = RainfallDataGenerator(
        include_evaporation=evaporation,
        node_id=node_id,
        start_time=datetime.now(tz=tz) - timedelta(days=2, hours=12),
    )

    if to_db:
        with _get_database_sync() as conn:
            r.table("sensor_readings").insert(
                reading._asdict() for reading in generator
            ).run(conn)
    else:
        if file is None:
            file = sys.stdout
        else:
            file = open(file, "w")
        generator_to_csv(file, generator)
        file.close()
