from app.internal.helpers.guard import guard
from app.internal.helpers import sanitize
from ..schemas.post import Post


message = "Post does not exist"


def get_post_by_id(idx: str, user_id) -> Post:
    if (
        not idx
        or sanitize(idx) != idx.lower()
        or not user_id
        or sanitize(idx) != idx.lower()
    ):
        return guard(None, message)
    return guard(Post.query.filter_by(id_=idx, user_id=user_id).first(), message)


def get_users_posts(user_id: str) -> list[Post]:
    if not user_id:
        return guard(None, message)
    return Post.query.filter_by(user_id=user_id).all()
