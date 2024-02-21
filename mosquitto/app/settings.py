from os import environ

print(environ)

RETHINKDB_HOST = environ.get("RETHINKDB_HOST", "localhost")
RETHINKDB_PORT = int(environ.get("RETHINKDB_PORT", 28015))
RETHINKDB_DB = environ.get("RETHINKDB_DB", "test")

MQTT_HOST = environ.get("MQTT_HOST", "localhost")
MQTT_PORT = int(environ.get("MQTT_PORT", 1883))
MQTT_USER = environ.get("MQTT_USER", None)
MQTT_PASS = environ.get("MQTT_PASS", None)
