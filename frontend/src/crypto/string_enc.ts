export function encKey(key: JsonWebKey, password: string) {
  return enc(password)(JSON.stringify(key));
}

export function decKey(encrypted: string, password: string) {
  return JSON.parse(dec(password)(encrypted)) as JsonWebKey;
}

function textToChars(text: string) {
  return text.split("").map((c) => c.charCodeAt(0));
}
function applySaltToChar(code: number, salt: string) {
  return textToChars(salt).reduce((a, b) => a ^ b, code);
}
const byteHex = (n: number) => `0${Number(n).toString(16)}`.substr(-2);

export function enc(salt: string) {
  return (text: string) =>
    text
      ? text
          .split("")
          .map(textToChars)
          .map((v) => applySaltToChar(v as any, salt))
          .map(byteHex)
          .join("")
      : "";
}
export function dec(salt: string) {
  return (encoded: string) =>
    encoded
      ? encoded
          .match(/.{1,2}/g)
          .map((hex: string) => parseInt(hex, 16))
          .map((v: number) => applySaltToChar(v, salt))
          .map((charCode: number) => String.fromCharCode(charCode))
          .join("")
      : "";
}
