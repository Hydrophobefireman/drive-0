import {notFoundObject} from "../util/not-found";
import {BaseHandler} from "./base-handler";
import {createObjectName} from "./util";

export class HeadHandler extends BaseHandler<"user" | "key" | "filename"> {
  public async handle() {
    console.log("using HeadHandler");
    const {
      env: {B_GALLERY},
    } = this.c;
    const {filename, key, user} = this.c.req.param();
    const objectName = createObjectName(user, key, filename);

    const object = await B_GALLERY.head(objectName, {
      onlyIf: this.c.req.headers,
    });

    if (object === null) {
      return notFoundObject(objectName);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("x-file-meta", object.customMetadata.upload);
    headers.set("cache-control", "max-age=31536000, immutable");
    const status = 200;
    const ret = new Response(null, {
      status,
      headers,
    });
    ret.headers.set("x-r2cdn-cache", "MISS");
    return ret;
  }
}
