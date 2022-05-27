import {json} from "./json";

export function notFoundObject(objectName: string): Response {
  return json(
    {
      status: "Object not found",
      message: `${objectName} was not found`,
    },
    404
  );
}

export function notFound(path: string): Response {
  return json(
    {
      status: "Not found",
      message: `Requested url '${path}' was not found`,
    },
    404
  );
}
