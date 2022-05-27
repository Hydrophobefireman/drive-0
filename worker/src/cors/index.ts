import type {Context, Next} from "hono";

type CORSOptions = {
  origin?: string | symbol;
  allowMethods?: string[];
  maxAge?: number;
  credentials?: boolean;
  exposeHeaders?: string[];
};
export const DYNAMIC_ORIGIN = Symbol("dynamic-origin");
export const cors = (options?: CORSOptions) => {
  const defaults: CORSOptions = {
    origin: DYNAMIC_ORIGIN,
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    exposeHeaders: [],
    maxAge: 86400,
    credentials: true,
  };
  const opts = {
    ...defaults,
    ...options,
  } as Required<CORSOptions>;

  return async (c: Context, next: Next) => {
    function set(key: string, value: string) {
      c.res.headers.append(key, value);
    }

    function setCorsHeaders() {
      set(
        "Access-Control-Allow-Origin",
        opts.origin === DYNAMIC_ORIGIN
          ? c.req.headers.get("Origin") ?? "*"
          : (opts.origin as string)
      );

      // Suppose the server sends a response with an Access-Control-Allow-Origin value with an explicit origin (rather than the "*" wildcard).
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }

      if (opts.credentials) {
        set("Access-Control-Allow-Credentials", "true");
      }

      if (opts.exposeHeaders.length) {
        set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      if (opts.allowMethods.length) {
        set("Access-Control-Allow-Methods", opts.allowMethods.join(","));
      }
      const requestHeaders = c.req.headers.get(
        "Access-Control-Request-Headers"
      );
      if (requestHeaders) {
        set("Access-Control-Allow-Headers", requestHeaders);
        set("Vary", "Access-Control-Request-Headers");
      }
    }

    if (c.req.method === "OPTIONS") {
      c.res = new Response(null, {
        status: 204,
      });
      setCorsHeaders();
      return;
    }

    await next();

    setCorsHeaders();
  };
};
