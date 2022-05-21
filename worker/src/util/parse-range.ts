export function parseRange(
  encoded: string | null
): undefined | {offset: number; length: number} | {offset: number; rest: true} {
  if (encoded === null) {
    return;
  }

  const parts = encoded.split("bytes=")[1]?.split("-");
  if (parts.length !== 2) {
    return;
  }
  let [a, b] = parts;
  if (!a) a = "0";
  if (!b) {
    return {offset: Number(a), rest: true};
  }
  return {
    offset: Number(a),
    length: Number(b) + 1 - Number(a),
  };
}
