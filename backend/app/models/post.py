# pylint: disable=E0213

from pydantic.main import BaseModel


class PostUpload(BaseModel):
    contents: bytes
    meta_data: str
    user_id: str
