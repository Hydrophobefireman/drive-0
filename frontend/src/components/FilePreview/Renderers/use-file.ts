import {blobToArrayBuffer} from "@hydrophobefireman/j-utils";
import {useEffect, useLayoutEffect, useState} from "@hydrophobefireman/ui-lib";

export function useObjectUrl(file: Blob) {
  const [src, setSrc] = useState<string>();
  useLayoutEffect(() => {
    setSrc(null);
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => {
      setSrc(null);
      URL.revokeObjectURL(url);
    };
  }, [file]);
  return src;
}

export function useArrayBuffer(file: Blob) {
  const [buf, setBuf] = useState<ArrayBuffer>();
  useEffect(async () => {
    const ab = await blobToArrayBuffer(file);
    setBuf(ab);
  }, [file]);
  return buf;
}
