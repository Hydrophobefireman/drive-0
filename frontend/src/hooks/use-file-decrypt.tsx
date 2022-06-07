import {decrypt} from "@/crypto/decrypt";
import {dec} from "@/crypto/string_enc";
import {requests} from "@/util/bridge";
import {_util} from "@hydrophobefireman/kit";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {useCallback, useEffect, useState} from "@hydrophobefireman/ui-lib";

export const previewCache = new Map<string, Blob>();
export function useFileDecrypt({
  accKey,
  meta,
  url,
  cache,
}: {
  url: string;
  meta: string;
  accKey: string;
  cache?: boolean;
}) {
  const {show} = useAlerts();
  const [blob, setBlob] = useState<Blob>();
  const [progress, setProgress] = useState(0);
  const download = useCallback(
    (url: string) =>
      requests.getBinaryStram(url, {}, {}, ({received, total}) =>
        setProgress(received / total)
      ),
    [url]
  );
  useEffect(() => {
    const key = `${url}::${meta}::${accKey}`;
    if (cache && previewCache.has(key)) {
      setBlob(previewCache.get(key));
      return;
    }
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
      if (!(ret instanceof ArrayBuffer)) return;
      const parsed = JSON.parse(meta);
      const res = await decrypt({meta, encryptedBuf: ret}, accKey);
      if (res.error) {
        setProgress(0);
        return show({content: res.error, type: "error"});
      }
      const decryptedData = new Blob([res], {type: dec(accKey)(parsed.type)});
      if (cache) {
        previewCache.set(key, decryptedData);
      }
      setProgress(0);
      setBlob(decryptedData);
    })().catch((e) => {});

    return () => controller.abort();
  }, [url]);
  return {blob, progress};
}
