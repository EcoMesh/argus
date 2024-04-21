# trunk-ignore-all(bandit/B311)
import csv
import logging
import math
import random
import string
import sys
import time
from datetime import datetime, timedelta
from typing import Annotated

import pytz
import requests
import typer
from app.constants import TZ, TimeDelta
from app.database import _get_database_sync
from app.schema.sensor import SensorReading
from typer import Option

from rethinkdb import query as r

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

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
        self.ground_distance = self.ground_distance_max
        self.start_time = start_time
        self.node_id = node_id

    def generate_steady_data(self):
        rand = random.random()
        sign = 1 if random.random() > 0.5 else -1
        if rand < 0.05:
            self.ground_distance += sign * (
                random.randint(self.ground_distance_max // 4, self.ground_distance_max)
                / 100
            )
        elif rand < 0.15:
            self.ground_distance += sign * (
                random.randint(self.ground_distance_max // 8, self.ground_distance_max)
                / 100
            )
        else:
            self.ground_distance += sign * (
                random.randint(self.ground_distance_max // 16, self.ground_distance_max)
                / 100
            )

        yield SensorReading(
            self.node_id,
            self.start_time,
            0,
            0,
            0,
            self.ground_distance,
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
            yield SensorReading(
                self.node_id, self.start_time, 0, 0, 0, self.ground_distance
            )
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


class GeneratorTee:
    def __init__(self, generator):
        self.generator = generator
        self.iterator = iter(generator)
        self.output = []

    def repeat(self):
        return iter(self.output)

    def __iter__(self):
        for val in self.iterator:
            self.output.append(val)
            yield val


class GeneratorGroup:
    def __init__(self, generators):
        self.generators = generators
        self.iterators = [iter(generator) for generator in generators]

    def __len__(self):
        return len(self.iterators)

    def __iter__(self):
        i = 0
        while True:
            try:
                yield next(self.iterators[i])
            except StopIteration:
                return
            i += 1
            if i == len(self):
                i = 0


def generate_random_id():
    prefix = "!"
    suffix = "".join(random.choices(string.hexdigits, k=8))
    return prefix + suffix.lower()


@app.command()
def rand_ids(
    n: Annotated[int, Option(help="The number of random IDs to generate.")] = 5
):
    for _ in range(n):
        print(generate_random_id())


@app.command()
def generate_rainfall_data(
    file: Annotated[
        str,
        Option(
            help="A file to write the sensor data to. Can be used in combination with the --to-db flag."
        ),
    ] = None,
    evaporation: Annotated[
        bool,
        Option(
            help="Flag to include evaporation in the generated data. This will double the amount of data generated."
        ),
    ] = False,
    node_id: Annotated[
        str, Option(help="The node ID to generate data for.")
    ] = "!node-id",
    to_db: Annotated[
        bool, Option(help="Flag to stream directly to the database.")
    ] = False,
    sync: Annotated[
        bool,
        Option(
            help="Empties database of sensor records and syncs up database time to simulate live sensor data."
        ),
    ] = False,
    speed: Annotated[
        int,
        Option(
            help="Use in combination with --sync. This number is used as a multiplier to speed up the flow of simulated data. For example, setting this flag to 3600 will simulate an hours worth of events in one second."
        ),
    ] = 1,
):
    """Generate rainfall data and optionally write it to a file or the database."""
    start_time = datetime.now(tz=TZ)  # - timedelta(days=2, hours=12)
    delta = timedelta(minutes=5)
    # simulation_run_time = (
    #     timedelta(days=5) if evaporation else timedelta(days=2, hours=12)
    # )
    node_ids = node_id.split(",")
    generator = GeneratorGroup(
        [
            RainfallDataGenerator(
                include_evaporation=evaporation,
                node_id=node_id,
                start_time=start_time,
                delta=delta,
            )
            for node_id in node_ids
        ]
    )
    tee = GeneratorTee(generator)

    if to_db:
        with _get_database_sync() as conn:
            if sync:
                r.table("sensor_readings").delete().run(conn)
                r.table("alarms_events").delete().run(conn)
                r.table("alarms_event_records").delete().run(conn)

                sleep_time = delta.seconds / speed
                readings_per_sleep = 1
                if sleep_time < 1:
                    readings_per_sleep = math.ceil(1 / sleep_time)
                    sleep_time = 1
                initial_readings = [
                    reading._asdict()
                    for reading, _ in zip(
                        tee,
                        range(
                            (
                                (TimeDelta.ONE_DAY + TimeDelta.TWELVE_HOURS)
                                // delta.seconds
                            )
                            * len(node_ids)
                        ),
                    )
                ]
                r.table("sensor_readings").insert(initial_readings).run(conn)
                res = requests.post(
                    "http://localhost:8000/demo/set_time",
                    json={"epoch": start_time.isoformat(), "speed": speed},
                    timeout=5,
                )
                if not res.ok:
                    logger.error("Failed to set time: %s", res.text)
                    return
                logger.info("Time set: %s", start_time.isoformat())
                logger.info("Speed set: %s", speed)
                logger.info("Sleep time: %s", sleep_time)
                logger.info("Readings per sleep: %s", readings_per_sleep)
                iterator = iter(tee)
                while True:
                    readings = [
                        reading._asdict()
                        for reading, _ in zip(
                            iterator, range(readings_per_sleep * len(node_ids))
                        )
                    ]
                    if not readings:
                        break
                    logger.info("Inserting: %s", len(readings))
                    r.table("sensor_readings").insert(readings).run(conn)
                    time.sleep(sleep_time)
            else:
                r.table("sensor_readings").insert(
                    reading._asdict() for reading in tee
                ).run(conn)
            if file:
                with open(file, "w") as f:
                    generator_to_csv(f, tee.repeat())
    else:
        if file is None:
            file = sys.stdout
        else:
            file = open(file, "w")
        generator_to_csv(file, generator)
        file.close()
