import {h, useCallback} from "@hydrophobefireman/ui-lib";

export function Img({
  remount,
  ...props
}: JSX.HTMLAttributes<HTMLImageElement> & {remount?: boolean}) {
  const jsx = useCallback(() => <img {...props} />, [props.src]);
  return h(jsx);
}
