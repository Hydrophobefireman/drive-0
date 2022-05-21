import {Hono} from "hono";
import {listUserFiles} from "./list-files";

const api = new Hono({strict: false});

api.use("*", async (c, next) => {
  console.log("start");
  await next();
  console.log("end");
});

// api.get("/:action")
api.get("/user/:name/list", async (c) => {
  return listUserFiles(c as any);
});


export {api};
