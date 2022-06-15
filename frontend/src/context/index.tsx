import {UploadCustomMetadata} from "@/api-types/files";
import {dec} from "@/crypto/string_enc";
import {useBlurHashDecode} from "@/hooks/use-file-decrypt";
import {ThumbResult} from "@/thumbnail-generator";
import {createContext, useContext, useMemo} from "@hydrophobefireman/ui-lib";

const BlurHashContext = createContext<{
  url: string;
  width: number;
  height: number;
}>(null);

export function BlurHashContextProvider({
  children,
  meta,
  accKey,
}: {
  children?: any;
  meta: UploadCustomMetadata;
  accKey: string;
}) {
  const hasBlurHash = useMemo(() => {
    try {
      const p = JSON.parse(meta.preview.meta);
      return !!p.hash;
    } catch (e) {
      return false;
    }
  }, [meta]);
  const {originalDimensions = [null, null]}: ThumbResult["meta"] =
    useMemo(() => {
      if (hasBlurHash && accKey) {
        try {
          return JSON.parse(
            dec(accKey)(JSON.parse(meta.preview.meta).thumbMeta)
          );
        } catch (e) {}
      }
      return {};
    }, [meta, accKey]);
  const bh = useBlurHashDecode(
    accKey && hasBlurHash ? {accKey, meta: meta.preview.meta} : {}
  );

  if (originalDimensions[0] == null || originalDimensions[1] == null) {
    return children;
  }
  return (
    //@ts-ignore
    <BlurHashContext.Provider
      value={
        {
          url: bh,
          height: originalDimensions[1],
          width: originalDimensions[0],
        } as any
      }
    >
      {children}
    </BlurHashContext.Provider>
  );
}

export function useBlurHashContext() {
  return useContext(BlurHashContext) || {height: null, width: null, url: null};
}
