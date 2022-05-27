import {json} from "../util/json";
import {BaseHandler} from "./base-handler";

export class ListHandler extends BaseHandler {
  async handle() {
    console.log("using: ListHandler");

    if (this.c.req.method === "HEAD") {
      return this.c.body("", 400);
    }

    const {B_GALLERY} = this.c.env;
    const url = new URL(this.c.req.url);
    const options: R2ListOptions = {
      prefix: url.searchParams.get("prefix") ?? undefined,
      delimiter: url.searchParams.get("delimiter") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
      include: ["customMetadata", "httpMetadata"],
    };

    try {
      const listing = await B_GALLERY.list(options);
      return json(listing);
    } catch (e) {
      return json({error: "unknown error"});
    }
  }
}
