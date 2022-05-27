export function json(
  obj: Record<string, any>,
  status: number = 200,
  headers: Record<string, string> = {},
  ret: ResponseInit = {}
) {
  return new Response(JSON.stringify(obj.error ? obj : {data: obj}), {
    status,
    ...ret,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      ...headers,
    },
  });
}
