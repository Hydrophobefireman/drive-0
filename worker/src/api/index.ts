import {Hono} from "hono";

import {
  getUploadToken,
  getUserData,
  login,
  refreshToken,
  register,
  revokeToken,
} from "../auth";
import {listUserFiles} from "./list-files";
import {authGuard, strictAuth} from "./validate";

const api = new Hono({strict: false});

api.post("/-/auth/register", async (c) => {
  const {user} = (await c.req.json()) as any;
  const ret = await register(user, c);
  return ret;
});
api.post("/-/auth/login", async (c) => {
  const {user, password: accountKey} = (await c.req.json()) as any;
  return login(user, accountKey, c);
});
api.get("/-/auth/refresh", (c) => {
  return refreshToken(c);
});
api.get("/-/auth/revoke-token", authGuard(), async (c) => {
  return revokeToken(c);
});
api.get("/-/auth/me", authGuard(), (c) => {
  return getUserData(c);
});
api.get("/user/:user/list", strictAuth(), async (c) => {
  return listUserFiles(c as any);
});

api.get("/user/:user/upload-token", strictAuth(), async (c) => {
  return getUploadToken(c as any);
});

export {api};
