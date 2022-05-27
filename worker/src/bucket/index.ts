import {Hono} from "hono";

import {strictAuth} from "../api/validate";
import {DeleteHandler} from "./delete-handler";
import {GetHandler} from "./get-handler";
import {HeadHandler} from "./head-handler";
import {PostHandler} from "./post-handler";
import {PutHandler} from "./put-handler";

const bucket = new Hono({strict: false});

bucket
  .get("/:user/:key/:filename", (c) => {
    return new GetHandler(c as any).handle();
  })
  .head((c) => {
    return new HeadHandler(c as any).handle();
  })
  .post(strictAuth({checkApproval: true}), (c) => {
    return new PostHandler(c as any).handle();
  })
  .put(strictAuth({checkApproval: true}), (c) => {
    return new PutHandler(c as any).handle();
  });
bucket.post("/:user/batch-delete", strictAuth(), (c) => {
  return new DeleteHandler(c as any).handle();
});

export {bucket};
