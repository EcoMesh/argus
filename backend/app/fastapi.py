from app.bootstrap import bootstrap
from fastapi import FastAPI

from .routes import router

app = FastAPI(
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Dev environment",
        },
        {
            "url": "http://localhost:8888/api",
            "description": "Caddy dev environment",
        },
    ],
    root_path="/api",
)

bootstrap(app)

app.include_router(router)


@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok"}
