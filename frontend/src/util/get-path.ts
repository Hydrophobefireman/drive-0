export function getEventPath(event: Event) {
  let __path: EventTarget[];
  const $path = event.composedPath
    ? event.composedPath()
    : (__path = (event as any).path) && __path.length
    ? __path
    : [];
  return $path;
}
