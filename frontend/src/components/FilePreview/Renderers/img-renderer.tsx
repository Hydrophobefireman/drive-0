import {css} from "catom";

import {useBlurHashContext} from "@/context";

import {Renderer} from "./types";
import {useObjectUrl} from "./use-file";

export function ImgRenderer({file}: Renderer) {
  const src = useObjectUrl(file);
  return <BaseImg src={src} class={css({pointerEvents: "none"})} />;
}

export function BaseImg({src, class: cls}: {src: string; class?: string}) {
  const {url, height, width} = useBlurHashContext();
  return (
    <img
      style={{
        backgroundImage: url && src && src !== url ? `url('${url}')` : null,
        height: `${height}px`,
        "aspect-ratio": `${width} / ${height}`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      src={src || null}
      class={[
        css({
          maxHeight: "65vh",
          maxWidth: "90vw",
          backgroundColor: "var(--kit-shade-2)",
        }),
        cls,
      ].join(" ")}
    />
  );
}
