import {FileListResponse} from "@/api-types/files";

import {getFileBinaryRoute} from "./routes";

export const fileUrl = (user: string, obj: FileListResponse["objects"][0]) => {
  const [, k, f] = obj.key.split("/");
  return getFileBinaryRoute(user, k, f);
};
