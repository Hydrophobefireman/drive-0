import {useSharedState} from "statedrive";

import {FileListResponse} from "@/api-types/files";
import {decrypt} from "@/crypto/decrypt";
import {dec} from "@/crypto/string_enc";
import {accountKeyStore} from "@/store/account-key-store";
import {requests} from "@/util/bridge";
import {getFileFromKeyRoute} from "@/util/routes";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {useCallback} from "@hydrophobefireman/ui-lib";

const downloadBinary = (url: string) => requests.getBinary(url);

export function useBatchDownload() {
  const {show} = useAlerts();
  const [accKey] = useSharedState(accountKeyStore);
  return useCallback(async function download(
    toDownload: FileListResponse["objects"]
  ) {
    for (let i = 0; i < toDownload.length; i++) {
      const file = toDownload[i];
      const name = file.customMetadata.upload.name;
      show({content: `(${i + 1}/${toDownload.length}) Downloading ${name}`});
      let url = getFileFromKeyRoute(file.key, true);
      if (file.customMetadata.upload.enc) {
        const {result} = downloadBinary(url);
        const ret = await result;
        if ("error" in ret) {
          return show({
            content: ret.error || `An error occured while downloading ${name}`,
            type: "error",
          });
        }
        if (!(ret instanceof ArrayBuffer)) return;

        const res = await decrypt(
          {meta: file.customMetadata.upload.enc, encryptedBuf: ret},
          accKey
        );
        if ("error" in res) {
          return show({
            content: res.error || `An error occured while decrypting ${name}`,
            type: "error",
          });
        }
        const decryptedData = new Blob([res], {
          type: dec(accKey)(JSON.parse(file.customMetadata.upload.enc).type),
        });
        const blob = URL.createObjectURL(decryptedData);
        const el = document.createElement("a");
        el.href = blob;
        el.download = name;
        el.click();
        setTimeout(() => URL.revokeObjectURL(blob), 1000);
      } else {
        const el = document.createElement("a");
        el.href = url;

        el.click();
      }
    }
    show({content: "Done downloading"});
  },
  []);
}
