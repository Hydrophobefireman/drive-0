import {Hono} from "hono";
import {api} from "./api";

import {bucket} from "./bucket";
import {cors} from "./cors";

const ALLOWED_HEADERS = ["x-file-meta", "x-upload-meta"];

const app = new Hono({strict: false});

app.use("*", cors({allowHeaders: ALLOWED_HEADERS}));
app.notFound((c) =>
  c.json({error: "Not found", message: "The requested url was not found"}, 404)
);

app.route("/o", bucket).route("/api", api);

export default app;
