import {css} from "catom";

import {Renderer} from "./types";
import {useObjectUrl} from "./use-file";

export function VideoRenderer({file}: Renderer) {
  const src = useObjectUrl(file);
  return <BaseVideo src={src} class={css({pointerEvents: "none"})} />;
}

export function BaseVideo({src, class: cls}: {src: string; class?: string}) {
  return (
    <video
      controls
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
