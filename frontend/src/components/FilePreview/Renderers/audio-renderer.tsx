import {Renderer} from "./types";
import {useObjectUrl} from "./use-file";

export function AudioRenderer({file}: Renderer) {
  const src = useObjectUrl(file);
  return <BaseAudio src={src} />;
}

export function BaseAudio({src, class: cls}: {src: string; class?: string}) {
  return <audio controls src={src || null} />;
}
