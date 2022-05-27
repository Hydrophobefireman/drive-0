import {createState} from "statedrive";

import {FileListResponse} from "@/api-types/files";

export const fileMetaStore = createState<FileListResponse>({
  name: "file-meta",
  initialValue: null,
});
