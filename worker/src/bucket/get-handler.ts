import {notFoundObject} from "../util/not-found";
import {parseRange} from "../util/parse-range";
import {BaseHandler} from "./base-handler";
import {createObjectName} from "./util";

export class GetHandler extends BaseHandler<"user" | "key" | "filename"> {
  public async handle() {
    console.log("using GetHandler");
    const {
      req,
      env: {B_GALLERY},
    } = this.c;

    let range = parseRange(req.headers.get("range"));
    const {filename, key, user} = this.c.req.param();
    const objectName = createObjectName(user, key, filename);
    if (range && "rest" in range) {
      const ret = await B_GALLERY.list({prefix: objectName});
      const obj = ret.objects.find(({key}) => key === objectName);
      if (!obj) {
        const res = notFoundObject(objectName);
        return res;
      }
      range = {offset: range.offset, length: obj.size};
    }

    const object = await B_GALLERY.get(objectName, {
      range,
      onlyIf: this.c.req.headers,
    });

    if (object === null) {
      return notFoundObject(objectName);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("x-file-meta", object.customMetadata.upload);
    const status = object.body ? (range ? 206 : 200) : 304;
    return new Response(object.body, {
      status,
      headers,
    });
  }
}
