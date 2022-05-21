import {base64ToArrayBuffer} from "@hydrophobefireman/j-utils";

import {EncData, generateKey} from "../util";

export async function decrypt(p: EncData, password: string, meta: any) {
  try {
    const {encryptedBuf} = p;
    const {ITER_COUNT, iv: ivb64, salt: saltb64} = meta;
    const iv = await base64ToArrayBuffer(ivb64);
    const salt = await base64ToArrayBuffer(saltb64);
    const {key} = await generateKey(password, new Uint8Array(salt), ITER_COUNT);
    return await crypto.subtle.decrypt(
      {name: "AES-GCM", iv},
      key,
      encryptedBuf
    );
  } catch (e) {
    console.log(e);
    return {error: "could not decrypt, check your password"};
  }
}
