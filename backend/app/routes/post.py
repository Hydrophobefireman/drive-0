from flask import request, Response
from app.db.mutations.post import create_post, remove_post, update_post
from app.decorators.api_response import api
from app.internal.context import Context
from app.db.queries.post import get_post_by_id, get_users_posts

from flask import Blueprint

from app.models.post import PostUpload


router = Blueprint("post", __name__, url_prefix="/posts")


@router.get("/")
@api.strict
def get_post():
    req = Context()
    user_id = req.auth.user_id
    posts = get_users_posts(user_id)
    return {"posts": [x.as_json for x in posts]}


@router.get("/<post_id>")
@api.strict
def get_content(post_id):
    req = Context()
    user_id = req.auth.user_id
    post = get_post_by_id(post_id, user_id)
    return Response(
        post.contents,
        headers={
            "content-type": "application/octet-stream",
            "x-meta-data": post.meta_data,
        },
    )


@router.post("/<post_id>")
@api.strict
def update_content(post_id):
    req = Context()
    user_id = req.auth.user_id
    post = get_post_by_id(post_id, user_id)
    return update_post(post, req.headers.get("x-meta-data"), request.get_data())


@router.delete("/<post_id>")
@api.strict
def delete_content(post_id):
    req = Context()
    user_id = req.auth.user_id
    try:
        post = get_post_by_id(post_id, user_id)
    except AssertionError:
        return {}
    return remove_post(post)


@router.post("/")
@api.strict
def api_create_post():
    req = Context()
    user_id = req.auth.user_id
    meta_data = req.headers.get("x-meta-data")
    byte_data = request.get_data()
    up = PostUpload(contents=byte_data, meta_data=meta_data, user_id=user_id)
    return create_post(up)
