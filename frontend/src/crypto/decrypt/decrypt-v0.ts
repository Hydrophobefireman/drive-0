import { EncData, decKey } from "../util";

import { base64ToArrayBuffer } from "@hydrophobefireman/j-utils";

export function importKey(exportableKey: JsonWebKey) {
  return crypto.subtle.importKey(
    "jwk",
    exportableKey as any,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}
export async function decrypt(p: EncData, password: string, meta: any) {
  console.log("Detected data using api V0...converting");

  try {
    const { encryptedBuf } = p;
    const { encryptedKey, iv: ivb64 } = meta;
    const iv = await base64ToArrayBuffer(ivb64);
    const usableKey = decKey(encryptedKey, password);
    const key = await importKey(usableKey);
    const ret = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedBuf
    );
    console.log("Successfully decrypted file");
    return ret;
  } catch (e) {
    console.log(e);
    return { error: "could not decrypt, check your password" };
  }
}
