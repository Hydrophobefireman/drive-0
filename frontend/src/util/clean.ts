export const sanitizeRegExp = /([^\w]|_)/g;
export const clean = (x: string) => (x || "").replace(sanitizeRegExp, "");

export const includes = (hay: string, needle: string) =>
  clean(hay).toLowerCase().includes(clean(needle).toLowerCase());
