import {PendingFileProps} from "@/api-types/PendingFileProps";
import {createState} from "statedrive";

export interface UploadJob {
  file: File;
  fileMeta: PendingFileProps;
}

export const uploadJobStore = createState({
  name: "upload-jobs",
  initialValue: new Set<UploadJob>(),
});
