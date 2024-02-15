from os import environ

RETHINKED_HOST = environ.get("RETHINK_HOST", "localhost")
RETHINKED_PORT = int(environ.get("RETHINK_PORT", 28015))
RETHINKDB_DB = environ.get("RETHINK_DB", "test")

MQTT_HOST = environ.get("MQTT_HOST", "localhost")
MQTT_PORT = int(environ.get("MQTT_PORT", 1883))
MQTT_USERNAME = environ.get("MQTT_USERNAME", None)
MQTT_PASSWORD = environ.get("MQTT_PASSWORD", None)
