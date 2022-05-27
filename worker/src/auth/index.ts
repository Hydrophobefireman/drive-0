import {Context} from "hono";

import {Env, UserType} from "../types";
import {clean} from "../util/clean";
import {json} from "../util/json";
import {jwt} from "./jwt";
import {generateKey, hash} from "./keys";

function _namespace(id: string) {
  return `users::${id.trim().toLowerCase()}`;
}

export async function getUserData(c: Context) {
  const auth = decodeAuth(c);
  const username = _namespace(auth.user);
  const user = await (c.env.AUTH as KVNamespace).get<UserType>(
    username,
    "json"
  );
  if (!user) return json({error: "User does not exist"}, 404);
  const {account_key_hash, ...rest} = user;
  return json({user_data: rest});
}
export async function login(username: string, accountKey: string, c: Context) {
  const {
    env: {AUTH},
  } = c;
  username = _namespace(username);
  const user = await (AUTH as KVNamespace).get<UserType>(username, "json");
  if (user == null) {
    return json({error: "user does not exist"}, 404);
  }
  const acc = await hash(accountKey);
  if (acc !== user.account_key_hash) {
    return json({error: "Invalid account key"}, 401);
  }
  const {account_key_hash, ...rest} = user;
  const {access, refresh} = await createTokens(user, c);

  return json({user_data: rest}, 200, {
    "x-access-token": access,
    "x-refresh-token": refresh,
  });
}

export async function register(username: string, c: Context) {
  if (
    !username ||
    username !== clean(username) ||
    username.length < 2 ||
    username.length > 30
  )
    return json({error: "Invalid username"}, 400);
  const {
    env: {AUTH},
  } = c;
  const key = _namespace(username);
  if ((await (AUTH as KVNamespace).get(key)) != null) {
    return json({error: "User already exists"}, 400);
  }
  const accountKey = generateKey();
  const user: UserType = {
    account_key_hash: await hash(accountKey),
    created_at: +new Date(),
    is_approved: false,
    user: username,
    _integrity: crypto.randomUUID(),
  };
  await (AUTH as KVNamespace).put(key, JSON.stringify(user));
  const {account_key_hash, ...rest} = user;
  return json({user_data: {user: rest, accountKey, kv: key}}, 200);
}

export async function createTokens(user: UserType, c: Context) {
  const refresh = await jwt.sign({user}, (c.env as Env).JWT_SIGNING_KEY);

  const access = await jwt.sign(
    {
      user: user.user,
      is_approved: user.is_approved,
      exp: Math.floor(Date.now() / 1000) + 2 * (60 * 60),
    },
    (c.env as Env).JWT_SIGNING_KEY,
    {algorithm: "HS512"}
  );
  return {access, refresh};
}

export async function refreshToken(c: Context) {
  const token = c.req.headers.get("x-refresh-token");

  if (!token || !jwt.verify(token, c.env.JWT_SIGNING_KEY)) {
    return json({error: "Invalid token"}, 401);
  }
  const {
    user: {user, _integrity},
  }: {user: UserType} = jwt.decode(token);

  const userData = await (c.env.AUTH as KVNamespace).get<UserType>(
    _namespace(user),
    "json"
  );

  if (!_integrity || userData?._integrity !== _integrity) {
    return json({error: "re-auth"}, 401);
  }

  const {access, refresh} = await createTokens(userData, c);
  return json({}, 200, {
    "x-access-token": access,
    "x-refresh-token": refresh,
  });
}
export async function revokeToken(c: Context) {
  if (!validateAuth(c)) {
    return json({error: "Invalid token"}, 400);
  }
  const {user} = decodeAuth(c);
  const key = _namespace(user);
  const userData = await (c.env.AUTH as KVNamespace).get<UserType>(key, "json");
  if (!userData) return json({error: "User does not exist"}, 400);
  userData._integrity = crypto.randomUUID();
  await (c.env.AUTH as KVNamespace).put(key, JSON.stringify(userData));
  return json({});
}
function _getTokenFromRequest(c: Context) {
  const {req} = c;
  const auth =
    req.headers.get("Authorization") ?? req.headers.get("X-Access-Token");
  if (!auth) {
    throw new Error("Not authenticated");
  }
  return auth.replace("Bearer", "").trim();
}
export function validateAuth(c: Context) {
  const token = _getTokenFromRequest(c);
  return jwt.verify(token, c.env.JWT_SIGNING_KEY);
}

export function decodeAuth(c: Context): {user: string; is_approved: boolean} {
  const token = _getTokenFromRequest(c);
  return jwt.decode(token);
}

export async function getUploadToken(c: Context) {
  const {user} = decodeAuth(c);
  return json({
    token: await jwt.sign(
      {user, $exp: Math.floor(Date.now() / 1000) + 24 * (60 * 60)},
      c.env.JWT_SIGNING_KEY
    ),
  });
}
