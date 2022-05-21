import {useEffect, useRef, useState} from "@hydrophobefireman/ui-lib";

export function DelayedRender({
  children,
  time = 2000,
}: {
  children?: any;
  time?: number;
}) {
  const [ready, setReady] = useState(false);
  const timerRef = useRef<any>();
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setReady(true);
    }, time);
    return () => {
      clearTimeout(timerRef.current);
    };
  });
  if (ready) return children;
  return <></>;
}
