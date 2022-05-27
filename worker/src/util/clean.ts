export const sanitizeRegExp = /([^\w]|_)/g;
export const clean = (x: string) => (x || "").replace(sanitizeRegExp, "");
