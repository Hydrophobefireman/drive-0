export function must(x: string) {
  if (x) {
    throw new Error(x);
  }
}
