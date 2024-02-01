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

```sh
poetry run uvicorn app:app --reload
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
