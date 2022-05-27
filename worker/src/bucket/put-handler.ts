import { json } from "../util/json";
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

    const upload = req.headers.get("x-upload-metadata") || "{}";
    try {
      assertMetadataValid(upload);
    } catch (e) {
      return json({error: "Metadata invalid"}, 400);
    }
    const object = await B_GALLERY.put(objectName, req.body, {
      httpMetadata: req.headers,
      customMetadata: {
        upload,
      },
    });
    return new Response(null, {
      headers: {
        etag: object.httpEtag,
      },
    });
  }
}

function assertMetadataValid(m: string) {
  if (m.length > 10_000_000) {
    throw new Error("size");
  }
}
