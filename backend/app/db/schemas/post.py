from base64 import b64encode
from secrets import token_urlsafe
from time import time

from sqlalchemy.dialects.postgresql import TEXT
from sqlalchemy.types import LargeBinary
from sqlalchemy.schema import ForeignKey

from app.db.schemas.user import User
from ..base import db


class Post(db.Model):
    # pylint: disable=E1101
    id_: str = db.Column(TEXT, unique=True, nullable=False, primary_key=True)
    user_id = db.Column(TEXT, ForeignKey(User.id_))
    # binary content
    contents: bytes = db.Column(LargeBinary, default=b"")
    # binary metadata
    meta_data: str = db.Column(TEXT, default="")
    created_at: int = db.Column(db.Integer)

    # pylint: enable=E1101

    def __init__(
        self,
        user_id: str = None,
        contents: bytes = None,
        meta_data: str = None,
    ):
        self.id_ = token_urlsafe(20)
        self.user_id = user_id
        self.contents = contents
        self.meta_data = meta_data
        self.created_at = time()

    def as_js_text(self):
        js = self.as_json
        js["_secure_"]["content"] = b64encode(self.contents).decode()
        return js

    @property
    def as_json(self):
        return {
            "id_": self.id_,
            "user": self.user_id,
            "created_at": self.created_at,
            "_secure_": {"meta_data": (self.meta_data)},
        }
