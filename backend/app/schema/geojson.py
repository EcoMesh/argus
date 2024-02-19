from typing import List, Literal

from pydantic import BaseModel


class GeoJsonPoint(BaseModel):
    type: Literal["Point"]
    coordinates: List[float]


class GeoJsonPolygon(BaseModel):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]]
