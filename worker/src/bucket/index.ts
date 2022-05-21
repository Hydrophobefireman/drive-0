import {Hono} from "hono";

import {GetHandler} from "./get-handler";
import {HeadHandler} from "./head-handler";
import {ListHandler, listPattern} from "./list-handler";
import {PostHandler} from "./post-handler";
import {PutHandler} from "./put-handler";

export {listPattern};

const bucket = new Hono({strict: false});

bucket.get("/list", (c) => {
  return new ListHandler(c as any).handle();
});

bucket
  .get("/:user/:key/:filename", (c) => {
    return new GetHandler(c as any).handle();
  })
  .head((c) => {
    return new HeadHandler(c as any).handle();
  })
  .post((c) => {
    return new PostHandler(c as any).handle();
  })
  .put((c) => {
    return new PutHandler(c as any).handle();
  });

export {bucket};
