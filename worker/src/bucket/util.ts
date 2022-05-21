export function createObjectName(user: string, key: string, file: string) {
  return `${user}/${key}-${file}`;
}
