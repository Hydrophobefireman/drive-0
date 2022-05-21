import {BaseHandler} from "./base-handler";
import {PutHandler} from "./put-handler";

export class PostHandler extends BaseHandler<"user" | "key" | "filename"> {
  public async handle() {
    return new PutHandler(this.c).handle();
  }
}
