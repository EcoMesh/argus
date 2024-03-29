from fastapi.routing import APIRouter

from . import alarms, demo, readings, regions, sensors, users

router = APIRouter()

router.include_router(users.router)
router.include_router(sensors.router)
router.include_router(regions.router)
router.include_router(alarms.router)
router.include_router(readings.router)

# don't attach this router when deploying to production
router.include_router(demo.router)
