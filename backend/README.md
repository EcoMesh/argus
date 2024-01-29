# Backend

## Setup

### Requirements

+ [Poetry](https://python-poetry.org/docs)

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
