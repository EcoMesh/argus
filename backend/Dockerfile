FROM python:3.11-buster AS builder

RUN pip install poetry==1.5.1

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache
  
WORKDIR /app

RUN touch README.md
COPY pyproject.toml poetry.lock ./
RUN poetry install --without dev && rm -rf "$POETRY_CACHE_DIR"

FROM python:3.11-slim-buster AS runtime
ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"
COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}
COPY app app

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:80/healthcheck || exit 1

CMD ["uvicorn", "app.fastapi:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]