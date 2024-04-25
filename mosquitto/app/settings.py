from os import environ

RETHINKDB_HOST = environ.get("RETHINKDB_HOST", "localhost")
RETHINKDB_PORT = int(environ.get("RETHINKDB_PORT", 28015))
RETHINKDB_DB = environ.get("RETHINKDB_DB", "test")

MQTT_HOST = environ.get("MQTT_HOST", "localhost")
MQTT_PORT = int(environ.get("MQTT_PORT", 1883))
MQTT_USERNAME = environ.get("MQTT_USERNAME", None)
MQTT_PASSWORD = environ.get("MQTT_PASSWORD", None)
MQTT_TOPIC = environ.get("MQTT_TOPIC", "msh/2/json/#")
