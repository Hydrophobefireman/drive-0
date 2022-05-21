from flask import Request
from ._handler import State
from time import time


def middleware(_request: Request, state: State):
    start = time()
    yield
    now = time()
    process = now - start
    state.response.headers.add("x-process-time", str(round(process, 2)))
    state.response.headers.add("x-time-stamp", str(now))
