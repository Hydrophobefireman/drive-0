import {decodeAuth} from "../auth";
import {notFoundObject} from "../util/not-found";
import {parseRange} from "../util/parse-range";
import {BaseHandler} from "./base-handler";
import {createObjectName, getPreviewKey} from "./util";

export class GetHandler extends BaseHandler<
  "user" | "key" | "filename" | "id"
> {
  public async getPreview() {
    const {
      env: {B_PREVIEWS},
    } = this.c;
    const {id} = this.c.req.param();
    const {user} = decodeAuth(this.c as any);
    const pk = getPreviewKey(user, id);
    const object = (await B_PREVIEWS.get(pk, {
      onlyIf: this.c.req.headers,
    })) as R2ObjectBody;
    if (object == null) return notFoundObject(pk);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("x-file-meta", object.customMetadata.upload);
    headers.set("cache-control", "max-age=31536000, immutable");
    const status = object.body ? 200 : 304;
    return new Response(object.body, {
      status,
      headers,
    });
  }
  public async handle() {
    console.log("using GetHandler");
    const {
      req,
      env: {B_GALLERY},
    } = this.c;

    let range = parseRange(req.headers.get("range"));
    const download = req.query()["download"];
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

    const object = (await B_GALLERY.get(objectName, {
      range,
      onlyIf: this.c.req.headers,
    })) as R2ObjectBody;

    if (object === null) {
      return notFoundObject(objectName);
    }

    const headers = new Headers();
    const meta = JSON.parse(object.customMetadata.upload);
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("x-file-meta", meta.name);
    headers.set("cache-control", "max-age=31536000, immutable");
    if (download) {
      headers.set("content-disposition", `attachment;filename="${meta.name}"`);
    }
    const status = object.body ? (range ? 206 : 200) : 304;
    const ret = new Response(object.body, {
      status,
      headers,
    });
    return ret;
  }
}
