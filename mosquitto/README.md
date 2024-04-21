# Mosquitto

This simple Python script subscribes to the telemetry and sensor reading
messages broadcasted to the MQTT server by the uplink node. It takes these
records and the ID of the node that sent them and enters them into the
RethinkDB to be analyzed and presented to the user by the backend and
frontend.

## Setup

### Requirements

- [Poetry](https://python-poetry.org/docs)

  We recommend setting Poetry's `virtualenvs.in-project` to `true` which will

  place the virtual environment in the project's root directory. This will make it
  easier to use the virtual environments in this multi-root monorepo with
  VS Code.

#### Create MQTT User/Password

Create a user for the sensors to use when communicating with the Mosquitto
server to use to connect to the MQTT server.

```sh
docker compose run mqtt -it mosquitto_passwd -c /mosquitto/config/passwd ecomesh
```

Make sure to use a strong password. When you are finished, update all
MQTT_PASSWORD environment variables in .env files.

If you change this password, any sensors already initiated will need to be
reconfigured with the new password.

### Install dependencies

```sh
poetry install
```

### Run the server

```sh
poetry run python -m app
```

## TODO

1. Explore reading Protobuf messages from MQTT and avoid using JSON to save
   bandwidth. See [here](https://meshtastic.org/docs/software/integrations/mqtt/#protobufs-topic).
