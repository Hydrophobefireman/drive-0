import {css} from "catom";

import {Renderer} from "./types";
import {useObjectUrl} from "./use-file";

export function ImgRenderer({file}: Renderer) {
  const src = useObjectUrl(file);
  return <BaseImg src={src} class={css({pointerEvents: "none"})} />;
}

export function BaseImg({src, class: cls}: {src: string; class?: string}) {
  return (
    <img
      src={src || null}
      class={[
        css({
          maxHeight: "80%",
          maxWidth: "80%",
          backgroundColor: "var(--kit-shade-2)",
        }),
        cls,
      ].join(" ")}
    />
  );
}
