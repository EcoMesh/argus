from app.utils import get_lan_ip
from pydantic import RedisDsn
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    rethinkdb_host: str = "localhost"
    rethinkdb_port: int = 28015
    rethinkdb_database: str = "test"

    mqtt_host: str = get_lan_ip()
    mqtt_user: str = ""
    mqtt_pass: str = ""

    redis_dsn: RedisDsn = RedisDsn("redis://localhost:6379/0")

    jwt_secret: str = "changeme-in-production"
    jwt_expire_minutes: int = 60

    model_config = {"env_file": ".env"}


settings = Settings()
