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

### Setup the database

```sh
poetry run python -m app db create-tables
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

### Backup and Restore

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
