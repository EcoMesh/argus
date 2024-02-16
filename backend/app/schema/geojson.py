from pydantic import BaseModel


class GeoJsonPoint(BaseModel):
    type: str = "Point"
    coordinates: list[float]

class GeoJsonPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: list[list[float]]