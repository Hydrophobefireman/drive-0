from flask import request
import cloudinary
from cloudinary.uploader import upload
from app.db.mutations.user import add_upload
from app.decorators.api_response import api
from app.internal.constants import CLOUDINARY_API_KEY, CLOUDINARY_SECRET
from app.internal.context import Context
from app.db.queries.user import get_user_by_id
from app.exceptions.app_exception import AppException
from flask import Blueprint

cloudinary.config(
    cloud_name="journo",
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_SECRET,
)


router = Blueprint("uploads", __name__, url_prefix="/uploads")


@router.post("/")
@api.strict
def create_upload():
    ctx = Context()
    meta_data = ctx.headers.get("x-meta-data")
    user = get_user_by_id(ctx.auth.user_id)
    if not user.is_approved:
        raise AppException("Not approved to upload")
    img = request.stream
    url = upload(img, folder=ctx.auth.user_id, resource_type="auto")["secure_url"]
    add_upload(ctx.auth.user_id, {"url": url, "meta_data": meta_data})
    return {"url": url}


@router.get("/meta-data")
@api.strict
def get_upload_meta():
    ctx = Context()
    url = request.args.get("url")
    user = get_user_by_id(ctx.auth.user_id)
    if not user.is_approved:
        raise AppException("Not approved to upload")
    obj = [x for x in user.uploads if x["url"] == url]
    if not obj:
        return {}
    return {"meta_data": obj[0]["meta_data"]}
