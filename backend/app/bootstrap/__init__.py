from .cors import bootstrap as bootstrap_cors
from .exceptions import bootstrap as bootstrap_exceptions


def bootstrap(app):
    bootstrap_cors(app)
    bootstrap_exceptions(app)
