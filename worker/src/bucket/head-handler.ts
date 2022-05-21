import {notFoundObject} from "../util/not-found";
import {BaseHandler} from "./base-handler";
import {createObjectName} from "./util";

export class HeadHandler extends BaseHandler<"user" | "key" | "filename"> {
  public async handle() {
    const {
      req,
      env: {B_GALLERY},
    } = this.c;
    const {filename, key, user} = this.c.req.param();
    const objectName = createObjectName(user, key, filename);
    const object = await B_GALLERY.head(objectName, {
      onlyIf: req.headers,
    });

    if (object === null) {
      return notFoundObject(objectName);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    return new Response(null, {
      headers,
    });
  }
}
