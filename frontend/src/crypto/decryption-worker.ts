import {pswKey} from "@/caching/keys";
import {requests} from "@/util/bridge";
import {uploadMetaRoute} from "@/util/routes";
import {get} from "@hydrophobefireman/flask-jwt-jskit";

import {decrypt} from "./decrypt";

export async function initListener() {
  const reg = await navigator.serviceWorker.getRegistration();
  navigator.serviceWorker.addEventListener("message", async ({data}) => {
    const {type, code, buffer, url} = data || {};

    if (type === "decryption-job") {
      const {data, error} = await requests.get(uploadMetaRoute(url)).result;
      if (error) {
        console.log("error");
        return;
      }
      const meta = data["meta_data"];
      decryptImage({code, buffer, meta, reg});
    }
  });
}

async function decryptImage({
  buffer,
  code,
  meta,
  reg,
}: {
  code: string;
  buffer: ArrayBuffer;
  meta: string;
  reg: ServiceWorkerRegistration;
}) {
  const pwd: string = await get(pswKey);
  const resp = await decrypt({encryptedBuf: buffer, meta}, pwd);
  reg.active.postMessage(
    {
      code,
      decryptedBuffer: resp,
      ct: JSON.parse(meta).type || "application/octet-stream",
    },
    [resp]
  );
}
