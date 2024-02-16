from unittest.mock import patch
from uuid import uuid4

from app.worker.watershed_delineation import process_sensors_polygon_by_region


def geojson_point(lon, lat):
    return {"$reql_type$": "GEOMETRY", "coordinates": [lon, lat], "type": "Point"}


REGION = {
    "id": "test",
    "name": "Test",
    "bottom_left": geojson_point(
        -103.31498383879455,
        30.275977600526915,
    ),
    "top_right": geojson_point(
        -103.1300,
        30.487701,
    ),
    "sensors": [
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.17203634307978, 30.371161445827436),
            "watershed": None,
        },
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.1396995909179, 30.469989267888447),
            "watershed": None,
        },
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.1996995909179, 30.409989267888447),
            "watershed": None,
        },
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.17163916371383, 30.371938753553273),
            "watershed": None,
        },
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.26181172713814, 30.306030272281333),
            "watershed": None,
        },
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.21443, 30.40298),
            "watershed": None,
        },
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.19616199070633, 30.4102907999941),
            "watershed": None,
        },
        {
            "id": str(uuid4()),
            "location": geojson_point(-103.17292662393481, 30.378158873572204),
            "watershed": None,
        },
    ],
}


@patch("app.worker.watershed_delineation.add_watershed_to_sensor")
@patch("app.worker.watershed_delineation._get_database_sync")
def test_watershed_delineation(
    get_database_sync,
    add_watershed_to_sensor,
):
    process_sensors_polygon_by_region([REGION])
    assert add_watershed_to_sensor.call_count == len(REGION["sensors"])
