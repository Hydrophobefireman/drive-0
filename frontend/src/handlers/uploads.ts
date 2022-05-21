import {} from "@hydrophobefireman/j-utils";

import {pswKey} from "@/caching/keys";
import {encrypt} from "@/crypto/encrypt";
import {requests} from "@/util/bridge";
import {uploadRoute} from "@/util/routes";
import {get} from "@hydrophobefireman/flask-jwt-jskit";

function fileToArrayBuffer(blob: Blob | File): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    let arrayBuffer: ArrayBuffer;
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      arrayBuffer = event.target.result as ArrayBuffer;
      resolve(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

export async function uploadImage(img: File) {
  if (!img) return;
  const buf = await (img.arrayBuffer
    ? img.arrayBuffer()
    : fileToArrayBuffer(img));
  const {encryptedBuf, meta} = await encrypt(buf, await get(pswKey), {
    type: img.type,
  });
  return requests.postBinary<{url: string}>(uploadRoute, encryptedBuf, {
    "x-meta-data": meta,
  }).result;
}
