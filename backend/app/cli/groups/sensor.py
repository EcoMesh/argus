# trunk-ignore-all(bandit/B311)

import csv
import random
import sys
import time

import typer
from app.constants import TimeDelta

CSV_HEADER = (
    "timestamp",
    "ground_distance",
    "node_id",
    "temperature",
    "humidity",
    "moisture",
)
# to fill in the missing column values for now
COLUMN_CONSTANTS = ("!id", 0, 0, 0)


def generate_steady_data(writer, start_time, delta):
    rand = random.random()
    if rand < 0.05:
        ground_distance = random.randint(30, 40)
    elif rand < 0.15:
        ground_distance = random.randint(35, 40)
    else:
        ground_distance = random.randint(38, 40)
    writer.writerow([start_time, ground_distance, *COLUMN_CONSTANTS])
    return start_time + delta


def rainfall_data_generator(
    write_obj, include_evaporation: bool, delta: int = TimeDelta.FIVE_MINUTES
):
    """
    generating random rainfall data
    ground_distance is measured in meters by a ultrasonic sensor
    when it rains, the ground distance decreases

    generates 5 and a half days of test data with one rain event in the middle
    """
    writer = csv.writer(write_obj)
    writer.writerow(CSV_HEADER)

    ground_distance_max = 40
    ground_distance = 40
    start_time = int(time.time())

    for _ in range(2 * TimeDelta.ONE_DAY // delta):
        start_time = generate_steady_data(writer, start_time, delta)

    for _ in range(TimeDelta.TWELVE_HOURS // delta):
        start_time = generate_steady_data(writer, start_time, delta)

    for _ in range(TimeDelta.TWELVE_HOURS // delta):
        ground_distance += random.randint(0, 20) / 100
        if random.random() > 0.5:
            ground_distance -= random.randint(0, 50) / 100
        ground_distance = min(ground_distance, ground_distance_max)
        writer.writerow(
            [start_time, ground_distance - random.randint(0, 10), *COLUMN_CONSTANTS]
        )
        start_time += delta

    if not include_evaporation:
        return

    for _ in range(TimeDelta.TWELVE_HOURS // delta):
        ground_distance += random.randint(0, 20) / 100
        ground_distance = min(ground_distance, ground_distance_max)
        writer.writerow(
            [start_time, ground_distance - random.randint(0, 10), *COLUMN_CONSTANTS]
        )
        start_time += delta

    for _ in range(2 * TimeDelta.ONE_DAY // delta):
        start_time = generate_steady_data(writer, start_time, delta)


app = typer.Typer(
    name="sensor", help="A collation of commands to manage and mock sensor data."
)


@app.command()
def generate_rainfall_data(file: str = None, evaporation: bool = False):
    if file is None:
        file = sys.stdout
    else:
        file = open(file, "w")
    rainfall_data_generator(file, include_evaporation=evaporation)
    file.close()
