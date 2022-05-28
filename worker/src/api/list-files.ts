import {Context} from "hono";

import {Env} from "../types";
import {json} from "../util/json";

export async function listUserFiles(c: Context<"user", Env>) {
  const {user} = c.req.param();
  if (!user) return json({error: "Missing username"}, 400);
  const url = new URL(c.req.url);
  const {B_GALLERY} = c.env;

  const opt: R2ListOptions = {
    prefix: `${user}/`,
    cursor: url.searchParams.get("cursor") ?? undefined,
    limit: Number(url.searchParams.get("limit")) || undefined,
  };
  const ret = await B_GALLERY.list(opt);
  return json(ret);
}
