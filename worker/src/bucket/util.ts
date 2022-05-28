export function createObjectName(user: string, key: string, file: string) {
  return `${user}/${key}/${file}`;
}

export function getPreviewKey(u: string, id: string) {
  return `${u}:preview:${id}`;
}
