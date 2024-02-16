from typing import List

from pydantic import BaseModel


class GeoJsonPoint(BaseModel):
    type: str = "Point"
    coordinates: List[float]


class GeoJsonPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]
