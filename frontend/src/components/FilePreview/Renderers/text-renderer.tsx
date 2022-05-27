import {css} from "catom";

import {cache} from "@hydrophobefireman/j-utils";

import {Renderer} from "./types";
import {useArrayBuffer} from "./use-file";

const decoder = new TextDecoder();
function decode(buf: ArrayBuffer) {
  return decoder.decode(buf);
}
const c: typeof decode = cache(decode) as any;
export function TextRenderer({file}: Renderer) {
  const src = useArrayBuffer(file);
  return <BaseText text={src ? c(src) : ""} />;
}

export function BaseText({text, class: cls}: {text: string; class?: string}) {
  return (
    <div
      class={[
        css({
          maxWidth: "50vw",
          overflow: "auto",
          maxHeight: "50vh",
          margin: "auto",
        }),
        cls,
      ].join(" ")}
    >
      <pre>{text}</pre>
    </div>
  );
}
