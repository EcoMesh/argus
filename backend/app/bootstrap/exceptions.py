import json

from app.exceptions import JSONException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError


async def validation_exception_handler(request, exc):
    return JSONResponse(json.loads(exc.json()), status_code=422)


async def json_exception_handler(request, exc):
    return JSONResponse([exc.body], status_code=exc.code)


def bootstrap(app):
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(JSONException, json_exception_handler)
