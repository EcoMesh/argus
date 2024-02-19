from typing import List

from .base import BaseSchema
from .geojson import GeoJsonPoint


class RegionIn(BaseSchema):
    name: str
    bottom_left: List[float]
    top_right: List[float]


class RegionOut(BaseSchema):
    id: str
    name: str
    channel_psk: str
    bottom_left: GeoJsonPoint
    top_right: GeoJsonPoint
