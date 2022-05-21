export function json(obj: object, ret: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
    ...ret,
  });
}
