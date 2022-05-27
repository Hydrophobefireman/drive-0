import {Hono} from "hono";
import {api} from "./api";

import {bucket} from "./bucket";
import {cors} from "./cors";
import {json} from "./util/json";

const EXPOSED_HEADERS = [
  "x-file-meta",
  "x-upload-meta",
  "x-stats",
  "x-access-token",
  "x-refresh-token",
];

const app = new Hono({strict: false});

app.use("*", cors({exposeHeaders: EXPOSED_HEADERS}));
app.use("*", async (c, n) => {
  const start = +new Date();
  await n();
  const t = +new Date() - start;
  c.res.headers.set("x-stats", JSON.stringify({time: t}));
});
app.notFound((c) =>
  json({error: "Not found", message: "The requested url was not found"}, 404, {
    "access-control-allow-origin": "*",
  })
);

app.route("/o", bucket).route("/api", api);

app.onError((e, c) => {
  console.warn(e);
  return json({error: e.message, name: e.name, cause: e.cause}, 500, {
    "access-control-allow-origin": "*",
  });
});
export default app;
