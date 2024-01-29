from fastapi.middleware.cors import CORSMiddleware


def bootstrap(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # TODO: tighten this up later
        # allow_origin_regex=allow_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
