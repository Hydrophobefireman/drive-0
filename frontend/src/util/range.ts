export function range(a: number, b: number) {
  return Array.from({length: b - a + 1}, (_, index) => a + index);
}

export function rangeObj(a: number, b: number) {
  const obj = {};
  for (let i = a; i <= b; i++) {
    obj[i] = true;
  }
  return obj;
}
