import {css} from "catom";

import {requests} from "@/util/bridge";
import {AbortableFetchResponse} from "@hydrophobefireman/flask-jwt-jskit";
import {cache} from "@hydrophobefireman/j-utils";
import {useResource} from "@hydrophobefireman/kit/hooks";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

import {Renderer} from "./types";
import {useArrayBuffer, useObjectUrl} from "./use-file";

const decoder = new TextDecoder();
function decode(buf: ArrayBuffer) {
  return decoder.decode(buf);
}
const c: typeof decode = cache(decode) as any;
export function TextRenderer({file}: Renderer) {
  const src = useObjectUrl(file);
  return <BaseText src={src} />;
}
function downloadText(url: string) {
  return requests.getBinary(url);
}

export function BaseText({src, class: cls}: {src: string; class?: string}) {
  const [text, setText] = useState<string>();
  useEffect(() => {
    (async () => {
      const {result} = downloadText(src);
      const res = await result;
      if ("error" in res) return;
      setText(c(res as ArrayBuffer));
    })();
  }, [src]);

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
