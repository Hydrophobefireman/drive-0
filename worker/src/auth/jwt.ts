// https://github.com/tsndr/cloudflare-worker-JWT
// with ts changes
class Base64URL {
  static parse(s: string) {
    return new Uint8Array(
      Array.prototype.map.call(
        atob(s.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")),
        (c: string) => c.charCodeAt(0)
      ) as number[]
    );
  }
  static stringify(a: Uint8Array) {
    return btoa(String.fromCharCode.apply(0, a as unknown as number[]))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
}
interface _Payload {
  iat?: number;
  exp?: number;
  nbf?: number;
}
export class TokenTimeError extends Error {}
type Payload = _Payload & Record<string, any>;
class JWT {
  private algorithms = {
    ES256: {name: "ECDSA", namedCurve: "P-256", hash: {name: "SHA-256"}},
    ES384: {name: "ECDSA", namedCurve: "P-384", hash: {name: "SHA-384"}},
    ES512: {name: "ECDSA", namedCurve: "P-512", hash: {name: "SHA-512"}},
    HS256: {name: "HMAC", hash: {name: "SHA-256"}},
    HS384: {name: "HMAC", hash: {name: "SHA-384"}},
    HS512: {name: "HMAC", hash: {name: "SHA-512"}},
    RS256: {name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-256"}},
    RS384: {name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-384"}},
    RS512: {name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-512"}},
  };
  constructor() {
    if (typeof crypto === "undefined" || !crypto.subtle)
      throw new Error("Crypto not supported!");
  }
  _utf8ToUint8Array(str: string) {
    return Base64URL.parse(btoa(unescape(encodeURIComponent(str))));
  }
  _str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  _decodePayload(raw: string) {
    switch (raw.length % 4) {
      case 0:
        break;
      case 2:
        raw += "==";
        break;
      case 3:
        raw += "=";
        break;
      default:
        throw new Error("Illegal base64url string!");
    }
    try {
      return JSON.parse(decodeURIComponent(escape(atob(raw))));
    } catch {
      return null;
    }
  }
  async sign(
    payload: Payload,
    secret: string,
    options: {
      algorithm?: keyof typeof JWT["prototype"]["algorithms"];
      keyid?: string;
    } = {
      algorithm: "HS512",
    }
  ) {
    if (typeof options === "string") options = {algorithm: options};
    if (payload === null || typeof payload !== "object")
      throw new Error("payload must be an object");
    if (typeof secret !== "string") throw new Error("secret must be a string");
    if (typeof options.algorithm !== "string")
      throw new Error("options.algorithm must be a string");
    const importAlgorithm = this.algorithms[options.algorithm];
    if (!importAlgorithm) throw new Error("algorithm not found");
    payload.iat = Math.floor(Date.now() / 1000);
    const payloadAsJSON = JSON.stringify(payload);
    const partialToken = `${Base64URL.stringify(
      this._utf8ToUint8Array(
        JSON.stringify({alg: options.algorithm, kid: options.keyid})
      )
    )}.${Base64URL.stringify(this._utf8ToUint8Array(payloadAsJSON))}`;
    let keyFormat = "raw";
    let keyData;
    if (secret.startsWith("-----BEGIN")) {
      keyFormat = "pkcs8";
      keyData = this._str2ab(
        atob(
          secret
            .replace(/-----BEGIN.*?-----/g, "")
            .replace(/-----END.*?-----/g, "")
            .replace(/\s/g, "")
        )
      );
    } else keyData = this._utf8ToUint8Array(secret);
    const key = await crypto.subtle.importKey(
      keyFormat,
      keyData,
      importAlgorithm,
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      importAlgorithm,
      key,
      this._utf8ToUint8Array(partialToken)
    );
    return `${partialToken}.${Base64URL.stringify(new Uint8Array(signature))}`;
  }
  async verify(
    token: string,
    secret: string,
    options: {
      algorithm?: keyof typeof JWT["prototype"]["algorithms"];
      keyid?: string;
    } = {
      algorithm: "HS512",
    }
  ) {
    if (typeof options === "string") options = {algorithm: options};
    if (typeof token !== "string") throw new Error("token must be a string");
    if (typeof secret !== "string") throw new Error("secret must be a string");
    if (typeof options.algorithm !== "string")
      throw new Error("options.algorithm must be a string");
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3)
      throw new Error("token must consist of 3 parts");
    const importAlgorithm = this.algorithms[options.algorithm];
    if (!importAlgorithm) throw new Error("algorithm not found");
    const payload = this.decode(token);
    if (payload.nbf && payload.nbf > Math.floor(Date.now() / 1000))
      throw new TokenTimeError("not valid yet");
    if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000))
      throw new TokenTimeError("refresh");
    let keyFormat = "raw";
    let keyData;
    if (secret.startsWith("-----BEGIN")) {
      keyFormat = "pkcs8";
      keyData = this._str2ab(
        atob(
          secret
            .replace(/-----BEGIN.*?-----/g, "")
            .replace(/-----END.*?-----/g, "")
            .replace(/\s/g, "")
        )
      );
    } else keyData = this._utf8ToUint8Array(secret);
    const key = await crypto.subtle.importKey(
      keyFormat,
      keyData,
      importAlgorithm,
      false,
      ["sign"]
    );
    const res = await crypto.subtle.sign(
      importAlgorithm,
      key,
      this._utf8ToUint8Array(tokenParts.slice(0, 2).join("."))
    );
    return Base64URL.stringify(new Uint8Array(res)) === tokenParts[2];
  }
  decode(token: string) {
    return this._decodePayload(
      token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    );
  }
}

export const jwt = new JWT();
