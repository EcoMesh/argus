from pydantic import BaseModel


class SensorIn(BaseModel):
    id: str
    uplink: bool