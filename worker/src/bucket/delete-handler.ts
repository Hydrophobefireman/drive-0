import {decodeAuth} from "../auth";
import {json} from "../util/json";
import {BaseHandler} from "./base-handler";

export class DeleteHandler extends BaseHandler<"user" | "key" | "filename"> {
  public async handle() {
    const {
      env: {B_GALLERY},
    } = this.c;
    const keys: string[] = await this.c.req.json();
    const {user} = decodeAuth(this.c as any);
    if (keys.some((x) => x.split("/")[0] !== user))
      return json({error: "Unauthorized"}, 401);
    await Promise.all(keys.map((objectName) => B_GALLERY.delete(objectName)));
    return json({});
  }
}
