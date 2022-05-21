from app.internal.helpers.get_origin import get_origin
from flask import Request
from ._handler import State

EXPOSE_HEADERS = ", ".join(
    ("x-access-token", "x-refresh-token", "x-dynamic", "x-time-stamp", "x-meta-data")
)

ALLOW_METHODS = ", ".join(("OPTIONS", "DELETE", "GET", "POST", "PUT", "PATCH", "HEAD"))


def middleware(request: Request, state: State):
    origin = get_origin(request)
    yield
    resp = state.response
    resp.headers["access-control-allow-origin"] = origin
    resp.headers["access-control-allow-headers"] = request.headers.get(
        "access-control-request-headers", "*"
    )
    resp.headers["access-control-allow-credentials"] = "true"
    resp.headers["access-control-max-age"] = "86400"
    resp.headers["access-control-expose-headers"] = EXPOSE_HEADERS
    resp.headers["access-control-allow-methods"] = ALLOW_METHODS
