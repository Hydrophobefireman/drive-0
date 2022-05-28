import {UploadCustomMetadata} from "@/api-types/files";
import {decrypt} from "@/crypto/decrypt";
import {dec} from "@/crypto/string_enc";
import {requests} from "@/util/bridge";
import {_util} from "@hydrophobefireman/kit";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";
const download = (url: string) => requests.getBinary(url);

export function useFileDecrypt(
  url: string,
  meta: UploadCustomMetadata,
  accKey: string
) {
  const {show} = useAlerts();
  const [blob, setBlob] = useState<Blob>();
  useEffect(() => {
    setBlob(null);
    const {controller, result} = download(url);

    (async () => {
      const ret = await result;
      if ("error" in ret) {
        return show({
          content: ret.error || "An error occured",
          type: "error",
        });
      }
      if (!(ret instanceof ArrayBuffer)) throw new Error("Invalid data");
      const parsed = JSON.parse(meta.enc);
      const decryptedData = new Blob(
        [await decrypt({meta: meta.enc, encryptedBuf: ret}, accKey)],
        {type: dec(accKey)(parsed.type)}
      );
      setBlob(decryptedData);
    })().catch((e) => {
      show({
        content: (
          <div>
            <div>{e}</div>
            <div>Could not download and decrypt your file</div>
          </div>
        ),
        type: "error",
      });
    });

    return () => controller.abort();
  }, [url]);
  return blob;
}
