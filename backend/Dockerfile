FROM python:3.12-alpine

WORKDIR /app

RUN apk add --no-cache \
  # the following were removed to reduce image size
  # gdal \
  # geos \
  # proj \
  # binutils \
  # musl-dev \
  llvm14 \
  llvm14-dev \
  make \
  g++ \
  curl \
  gdal-dev \
  gdal-tools \
  proj-dev \
  proj-util \
  build-base \
  linux-headers \
  git \
  cmake \
  geos-dev \
  && rm -rf /var/cache/apk/* \
  && pip install poetry==1.8.2 \
  && touch README.md

ENV LLVM_CONFIG=/usr/bin/llvm14-config \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

COPY pyproject.toml poetry.lock ./

RUN poetry install --without dev && rm -rf "$POETRY_CACHE_DIR"

# TODO: use a multi-stage build to reduce image size

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

COPY app app

EXPOSE 80

# define in the compose since the worker and beat containers won't have the 
# same healthcheck as the backend container

# HEALTHCHECK --interval=30s --timeout=3s \
#   CMD wget -qO- http://localhost:80/healthcheck || exit 1

CMD ["uvicorn", "app.fastapi:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]