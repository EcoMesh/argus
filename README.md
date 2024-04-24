# Argus

The monitoring system.

## Setup

### Requirements

- [Docker](https://docs.docker.com/install/)

### Development

#### Running

First run the following command to start the database and reverse proxy:

```bash
docker-compose up -d
```

Then start the backend and frontend server following their respective READMEs:

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

To record active sensor readings and telemetry data in the database, refer to the
[README](mosquitto/README.md) in the `/mosquitto` directory.

#### Working with RethinkDB

To access the RethinkDB web interface, navigate to `localhost:8080` in your web
browser.

##### Chateau

If you want an MyPHPAdmin-like interface to RethinkDB, install
[chateau](https://github.com/neumino/chateau) with `npm install -g chateau`.

If you run into an EACCES error, refer to the
[npm documentation](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

Then run the following command to start the chateau server:

```bash
chateau
```

Navigate to [`localhost:3000`](http://localhost:3000) in your web browser
to access the chateau interface.

##### Python

Unfortunately, the web interface only allows you to send queries via the
JavaScript SDK.

It's suggested to use the Juypter notebook in the `backend/notebooks`
directory. Read the respective [README](backend/notebooks/README.md) for more
information.

Alternatively, you can use the Python REPL:

```py
from rethinkdb import r

conn = r.connect()
conn.repl()
```

If you are pasting a multi-line query, type `(` before you paste the query
and `)` after you paste the query. This will keep Python from complaining
about indentation errors.

#### Stopping

To stop the docker container and Caddy reverse proxy, run the following commands:

```bash
docker-compose down
```
