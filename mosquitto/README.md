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

  ```sh
  poetry config virtualenvs.in-project true
  ```

### Install dependencies

```sh
poetry install
```

### Run the server

```sh
poetry run python -m app
```
