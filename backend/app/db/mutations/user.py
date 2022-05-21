from app.db import db
from app.db.mutations.util import commit
from app.db.schemas import User
from app.models.user import UserIn

from sqlalchemy.sql import text, bindparam
from sqlalchemy.dialects.postgresql import JSONB

# pylint: disable=E1101


def _create(col, batch, return_json):
    js = col.as_json
    db.session.add(col)
    if not batch:
        commit()
    return col if not return_json else js


def create_user(user_model: UserIn, batch=False, return_json=False):
    u = user_model
    col = User(name=u.name, user=u.user, password_hash=u.password_hash)
    return _create(col, batch, return_json)


# pylint: disable=E1101

add_tpl = text(
    """
     UPDATE "user"
     SET uploads = COALESCE(uploads, '[]'::JSONB) || :value ::JSONB
     WHERE "user".id_=:user_id
     """
).bindparams(bindparam("value", type_=JSONB))


def add_upload(user_id: str, value: dict):
    db.session.execute(add_tpl, {"user_id": user_id, "value": value})
    db.session.commit()
