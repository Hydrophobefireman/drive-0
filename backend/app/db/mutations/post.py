from app.db import db
from app.db.mutations.util import commit
from app.db.schemas import Post
from app.models.post import PostUpload

from sqlalchemy.dialects.postgresql import JSONB

# pylint: disable=E1101


def create_post(user_model: PostUpload):

    col = Post(
        user_id=user_model.user_id,
        contents=user_model.contents,
        meta_data=user_model.meta_data,
    )
    js = col.as_json
    db.session.add(col)
    db.session.commit()
    return js


def update_post(post: Post, meta_data: str, b: bytes):
    post.meta_data = meta_data
    post.contents = b
    db.session.commit()
    return {}


def remove_post(post: Post):
    db.session.delete(post)
    db.session.commit()
    return {}
