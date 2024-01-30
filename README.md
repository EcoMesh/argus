# Argus

The monitoring system.

## Setup

### Requirements

- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Caddy](https://caddyserver.com/docs/install)

### Development

First run the following command to start the database and reverse proxy:

```bash
docker-compose up -d
caddy start --config Caddyfile
```

Then start the backend and frontend server following their respective READMEs:

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

To record active sensor readings and telemetry data in the database, refer to the
[README](mosquitto/README.md) in the `/mosquitto` directory.
