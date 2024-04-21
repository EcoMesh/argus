from app.utils.networking import get_lan_ip
from pydantic import RedisDsn
from pydantic_settings import BaseSettings

lan_ip = get_lan_ip()


class Settings(BaseSettings):
    rethinkdb_host: str = "localhost"
    rethinkdb_port: int = 28015
    rethinkdb_database: str = "test"

    mqtt_host_external: str = lan_ip
    mqtt_username: str
    mqtt_password: str

    brevo_api_key: str

    base_url: str = f"http://{lan_ip}"

    redis_dsn: RedisDsn = RedisDsn("redis://localhost:6379/0")

    jwt_secret: str = "changeme-in-production"
    jwt_expire_minutes: int = 60

    model_config = {"env_file": ".env"}


settings = Settings()
