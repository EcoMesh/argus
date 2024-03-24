import json
import logging
import os
from hashlib import md5
from typing import NamedTuple

import elevation
import elevation.util
import matplotlib.pyplot as plt
import numpy as np
import rasterio
import shapely
from app.database import Connection, _get_database_sync
from pysheds.grid import Grid
from shapely.geometry import Polygon

from rethinkdb import query as r

elevation.util.SUPPRESS_OUTPUT = True

logger = logging.getLogger(__name__)

# Determine D8 flow directions from DEM
DIRMAP = (64, 128, 1, 2, 4, 8, 16, 32)


class Point(NamedTuple):
    x: float
    y: float


class BoundingBox(NamedTuple):
    bottom_left: Point
    top_right: Point


class WatershedFinder:
    def __init__(
        self, bounding_box: BoundingBox, debug=False, cache_path=".cache/elevation"
    ):
        os.makedirs(cache_path, exist_ok=True)

        self.bounding_box = bounding_box
        self.debug = debug
        self._debug_results = []
        self.cache_path = cache_path

        bounds = (
            bounding_box.bottom_left.x,
            bounding_box.bottom_left.y,
            bounding_box.top_right.x,
            bounding_box.top_right.y,
        )

        # cache the .tif file for a particular bounding box
        cache_hash = md5(str(bounds).encode(), usedforsecurity=False).hexdigest()
        cache_file = f"{cache_path}/{cache_hash}.tif"

        logger.debug(f"Checking for cache file {cache_file}")
        if not os.path.exists(cache_file):
            logger.debug(f"Downloading elevation data for {bounds}")
            elevation.clip(
                bounds=bounds,
                output=f"{os.getcwd()}/{cache_file}",
                product="SRTM3",
                margin="5%",
            )
        else:
            logger.debug(f"Using cached elevation data for {bounds}")

        self.grid = Grid.from_raster(cache_file)
        dem = self.grid.read_raster(cache_file)

        pit_filled_dem = self.grid.fill_pits(dem)
        flooded_dem = self.grid.fill_depressions(pit_filled_dem)
        inflated_dem = self.grid.resolve_flats(flooded_dem)
        self._flow_directions = self.grid.flowdir(inflated_dem, dirmap=DIRMAP)
        self._flow_accumulation = self.grid.accumulation(
            self._flow_directions, dirmap=DIRMAP
        )

    def get_polygon_from_coordinates(self, point: Point):
        # Specify pour point
        # Snap pour point to high accumulation cell
        # TODO: play with this to find the best points
        # it seems without snapping, the catchment is sometimes
        # not delineated properly
        snap_point = Point(*self.grid.snap_to_mask(self._flow_accumulation > 10, point))

        # Delineate the catchment
        catch = self.grid.catchment(
            x=snap_point.x,
            y=snap_point.y,
            fdir=self._flow_directions,
            dirmap=DIRMAP,
            xytype="coordinate",
        )

        # TODO: evaluate is this necessary
        # img = Image.fromarray(catch)
        # soften the edges of the mask
        # filtered_image = img.filter(ImageFilter.ModeFilter(size=4))
        # if filtered_image.getbbox():
        #     # if the image is not after applying the filter
        #     img = filtered_image
        # arr = np.uint8(img)

        arr = np.copy(catch.astype("uint8"))

        points = None
        for shape in rasterio.features.shapes(arr, transform=catch.affine):
            match shape:
                case ({"coordinates": [points]}, 1):
                    break

        if not points:
            return None

        polygon = Polygon(points)

        if self.debug:  # pragma: no cover
            self._debug_display_catch(catch, polygon)
            self._debug_results.append((point, polygon))

        return polygon

    def _debug_display_catch(self, catch, polygon):  # pragma: no cover
        fig, ax = plt.subplots(figsize=(8, 6))
        fig.patch.set_alpha(0)
        plt.grid("on", zorder=0)
        ax.imshow(
            catch,
            extent=self.grid.extent,
            zorder=1,
            cmap="Greys_r",
        )
        plt.xlabel("Longitude")
        plt.ylabel("Latitude")
        plt.title("Delineated Catchment", size=14)
        plt.plot(
            polygon.centroid.x,
            polygon.centroid.y,
            "go",
            markersize=1,
        )
        plt.fill(*polygon.exterior.xy, alpha=0.5, ec="none")
        plt.show()

    def _debug_display_sensors(self):  # pragma: no cover
        fig, ax = plt.subplots(figsize=(8, 6))
        fig.patch.set_alpha(0)
        plt.grid("on", zorder=0)
        im = ax.imshow(
            self._flow_accumulation,
            extent=self.grid.extent,
            interpolation="bilinear",
            zorder=1,
            cmap="Greys_r",
        )
        plt.colorbar(im, ax=ax, label="Upstream Cells")

        plt.xlabel("Longitude")
        plt.ylabel("Latitude")
        plt.title("Delineated Catchment", size=14)
        for sensor, polygon in self._debug_results:
            plt.plot(
                sensor.lon,
                sensor.lat,
                "ro",
                markersize=1,
            )
            plt.plot(
                polygon.centroid.x,
                polygon.centroid.y,
                "go",
                markersize=1,
            )
            plt.fill(*polygon.exterior.xy, alpha=0.9, ec="none")
        plt.show()


def add_watershed_to_sensor(conn: Connection, sensor_id: str, polygon: shapely.Polygon):
    r.table("sensors").get(sensor_id).update(
        {
            "watershed": r.geojson(json.loads(shapely.to_geojson(polygon))),
        },
        non_atomic=True,
    ).run(conn)


def process_sensors_polygon_by_region(regions):
    failed_sensors = []

    with _get_database_sync() as conn:
        for region in regions:
            processor = WatershedFinder(
                BoundingBox(
                    bottom_left=Point(*region["bottom_left"]["coordinates"]),
                    top_right=Point(*region["top_right"]["coordinates"]),
                )
            )
            for sensor in region["sensors"]:
                polygon = processor.get_polygon_from_coordinates(
                    Point(*sensor["location"]["coordinates"])
                )

                if not polygon:
                    logger.error(f"Failed to delineate catchment for sensor {sensor}")
                    failed_sensors.append(sensor)
                    continue

                logger.info(
                    f"Sensor {sensor['id']} has catchment {polygon}",
                )

                add_watershed_to_sensor(conn, sensor["id"], polygon)

    return failed_sensors
