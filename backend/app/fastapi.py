from app import tasks
from app.bootstrap import bootstrap
from fastapi import FastAPI
from fastapi_restful.tasks import repeat_every

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


@app.on_event("startup")
@repeat_every(seconds=5)
async def alarm_identification_job() -> None:
    print("Running alarm_identification_job")
    await tasks.alarm_identification_cronjob()


bootstrap(app)

app.include_router(router)
