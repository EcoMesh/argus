# Backend

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

- [GDAL](https://gdal.org/api/python_bindings.html)

  The GDAL library is required for the `rasterio` and `elevation` packages.

  To install on **Ubuntu**, read the instructions [here](https://mothergeo-py.readthedocs.io/en/latest/development/how-to/gdal-ubuntu-pkg.html).

  On **macOS**, you can install the library with the following command:

  ```sh
  brew install gdal
  ```

  If you get errors when initializing a sensor, which will use this library to
  calculate the watershed using the sensor's location as a pour point, you may
  need to nuke the `elevation` cache with the following command:

  ```sh
  eio distclean
  ```

#### Issues

##### Outdated Python

If you have an older version of Python that you need for other projects,
consider using [pyenv](https://github.com/pyenv/pyenv) to manage multiple
versions of Python easily.

### Install dependencies

```sh
poetry install
```

### Setup the environment

Review the .env.example files in the `backend` directory and copy them to a new
file named `.env`. Update the values in the `.env` file as needed.

Make sure these environment variables are set before running the application
or CLI tools.

### Setup the database

Before you can run the `rethinkdb` commands, you'll need to install the
`rethinkdb` package. Unfortunately, the package does work with Python 3.12
which the rest of our project uses. You'll need to use a utility like `pyenv`
and switch to Python 3.7 before installing/using the package.

Once you've installed `rethinkdb`, you can import the database schema with the
following command:

```sh
pip install rethinkdb
```

```sh
rethinkdb import -d schemas/rethink_test_schema
```

Once you've imported the database, you can start the RethinkDB server with the
following command:

```sh
docker compose up db -d
```

Now, you'll need to create the first user so you can log in to the application.

```sh
poetry run python -m app db create-user NAME EMAIL PASSWORD
```

### Run development server

To start the HTTP development server, run the following command:

```sh
poetry run uvicorn app.fastapi:app --reload
```

To run recurring tasks, start the Celery worker:

```sh
poetry run celery --app=app.worker worker
```

**NOTE**: Set the logging level with `-l <LEVEL>`.

To run the Celery beat scheduler:

```sh
celery --app=app.worker beat -S redisbeat.RedisScheduler --max-interval=4
```

**NOTE**: The `--max-interval` flag is set to 4 seconds during development to make sure
when the schedule intervals are changed when a the system time is mocked, the changes
are picked up in at most 4 seconds.

To add the recurring celery worker schedule, run the following command:

```sh
python -m app.worker
```

### Run tests

```sh
poetry run pytest
```

If you want to see STDOUT and STDERR for each test, add the `-s` flag.

### Custom Tooling

A number of custom tools are available to help with development. To see a list
of available tools, run the following command:

```sh
poetry run python -m app --help
```

## Database

### Backup and Restore Data

Before following the guide in this section, make sure you've installed RethinkDB on your machine.

To create a backup of the database, run the following command:

```sh
rethinkdb dump
```

**Note**: the `-e` flag will allow you to select a specific database to dump.

To restore a backup of the database, run the following command:

```sh
rethinkdb import "<backup-file>"
```

### Backup Schema ONLY

To backup the schema only, run the following command:

```sh
./bin/export-rethink-schema.sh <schema> [renamed-schema]
```

This command will first export the database and then remove all the data from the
exported file. This is useful for sharing the schema with others without sharing
the data.

## Deployment

Deployment is done using Docker and Docker Compose.

First ensure you copy the `.env.example` file to `.env` and update the values.

Then, simply run the following command:

```sh
docker compose up -d
```

If you want to build the images locally, you'll need to update the
`docker-compose.prod.yml` file and replace the `image` key with `build`
and the `context` key with the path to the Dockerfile.
