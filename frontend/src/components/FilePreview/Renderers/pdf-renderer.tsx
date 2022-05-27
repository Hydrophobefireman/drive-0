import {css} from "catom";

import {Renderer} from "./types";
import {useObjectUrl} from "./use-file";

export function PdfRenderer({file}: Renderer) {
  const src = useObjectUrl(file);
  return <BasePdf src={src} />;
}
export function BasePdf({src, class: cls}: {src: string; class?: string}) {
  return <iframe src={src} class={css({maxHeight: "80%", width: "80%"})} />;
}
