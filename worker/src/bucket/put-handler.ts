import {BaseHandler} from "./base-handler";
import {createObjectName} from "./util";

export class PutHandler extends BaseHandler<"user" | "key" | "filename"> {
  public async handle() {
    const {
      req,
      env: {B_GALLERY},
    } = this.c;
    const {filename, key, user} = this.c.req.param();
    const objectName = createObjectName(user, key, filename);

    const object = await B_GALLERY.put(objectName, req.body, {
      httpMetadata: req.headers,
      customMetadata: {
        upload: req.headers.get("x-upload-metadata") || "{}",
      },
    });
    return new Response(null, {
      headers: {
        etag: object.httpEtag,
      },
    });
  }
}
