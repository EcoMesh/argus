from os import environ

RETHINKED_HOST = environ.get("RETHINK_HOST", "localhost")
RETHINKED_PORT = int(environ.get("RETHINK_PORT", 28015))
RETHINKDB_DB = environ.get("RETHINK_DB", "test")

MQTT_HOST = environ.get("MQTT_HOST", "localhost")
MQTT_PORT = int(environ.get("MQTT_PORT", 1883))
MQTT_USER = environ.get("MQTT_USER", None)
MQTT_PASS = environ.get("MQTT_PASS", None)
