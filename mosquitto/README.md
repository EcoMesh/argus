# Mosquitto

This simple Python script subscribes to the telemetry and sensor reading
messages broadcasted to the MQTT server by the uplink node. It takes these
records and the ID of the node that sent them and enters them into the
RethinkDB to be analyzed and presented to the user by the backend and
frontend.

## Setup

### Requirements

- [Poetry](https://python-poetry.org/docs)

### Install dependencies

```sh
poetry install
```

### Run the server

```sh
poetry run python -m app
```
