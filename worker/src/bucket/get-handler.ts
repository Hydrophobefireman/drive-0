import parseRange from "range-parser";

import {decodeAuth} from "../auth";
import {json} from "../util/json";
import {notFoundObject} from "../util/not-found";
import {BaseHandler} from "./base-handler";
import {createObjectName, getPreviewKey} from "./util";

function hasSuffix(range: R2Range): range is {suffix: number} {
  return (<{suffix: number}>range).suffix !== undefined;
}
function getRangeHeader(range: R2Range, fileSize: number): string {
  return `bytes ${hasSuffix(range) ? fileSize - range.suffix : range.offset}-${
    hasSuffix(range) ? fileSize - 1 : range.offset! + range.length! - 1
  }/${fileSize}`;
}

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

    let rangeHeader = req.headers.get("range");
    const download = req.query()["download"];
    const {filename, key, user} = this.c.req.param();
    const objectName = createObjectName(user, key, filename);
    let range: R2Range | undefined = undefined;
    if (rangeHeader) {
      const obj = await B_GALLERY.head(objectName);
      if (!obj) {
        const res = notFoundObject(objectName);
        return res;
      }
      const parsedRanges = parseRange(obj.size, rangeHeader);
      if (
        parsedRanges === -1 ||
        parsedRanges === -2 ||
        parsedRanges.length !== 1 ||
        parsedRanges.type !== "bytes"
      ) {
        return json({error: "Range invalid"}, 416);
      }
      let firstRange = parsedRanges[0];

      range =
        obj.size === firstRange.end + 1
          ? {suffix: obj.size - firstRange.start}
          : {
              offset: firstRange.start,
              length: firstRange.end - firstRange.start + 1,
            };
    }

    const object = (await B_GALLERY.get(objectName, {
      range,
      onlyIf: this.c.req.headers,
    })) as R2ObjectBody;

    if (object === null) {
      return notFoundObject(objectName);
    }
    const rangeResponse = range ? getRangeHeader(range, object.size) : "";

    const headers = new Headers();
    const meta = JSON.parse(object.customMetadata.upload);
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("x-file-meta", meta.name);
    if (range) {
      // console.log(rangeResponse);
      headers.set("content-range", rangeResponse);
    }
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
