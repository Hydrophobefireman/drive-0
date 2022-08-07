import {css} from "catom";

import {useBlurHashContext} from "@/context";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

import {Renderer} from "./types";
import {useObjectUrl} from "./use-file";

export function ImgRenderer({file}: Renderer) {
  const src = useObjectUrl(file);
  return <BaseImg src={src} class={css({pointerEvents: "none"})} />;
}

export function BaseImg({src, class: cls}: {src: string; class?: string}) {
  const {url, height, width} = useBlurHashContext();
  const [showBlurHash, setShowBlurHash] = useState(true);
  useEffect(() => {
    if (src !== url) {
      setShowBlurHash(true);
    }
  }, [src, url]);

  return (
    <img
      style={{
        backgroundImage:
          showBlurHash && url && src && src !== url ? `url('${url}')` : null,
        ...(url
          ? {
              height: "auto",
              width: `${width}px`,
              aspectRatio: `${width} / ${height}`,
            }
          : {}),
      }}
      onLoad={() => setShowBlurHash(false)}
      src={src || null}
      class={[
        showBlurHash && src !== url
          ? css({backgroundColor: "var(--kit-shade-2)"})
          : "",
        css({
          maxHeight: "65vh",
          maxWidth: "90vw",
        }),
        url
          ? css({
              objectFit: "contain",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            })
          : "",
        cls,
      ].join(" ")}
    />
  );
}
