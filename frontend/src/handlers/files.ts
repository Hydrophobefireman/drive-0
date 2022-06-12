import {FileListResponse} from "@/api-types/files";
import {requests} from "@/util/bridge";
import {
  deleteFileRoute,
  getFileFromKeyRoute,
  listFilesRoute,
} from "@/util/routes";

export function getFileList(u: string) {
  const {controller, headers, result} = requests.get<FileListResponse>(
    listFilesRoute(u)
  );
  return {
    controller,
    headers,
    result: result.then(({data, error}) => {
      if (error) return {data: null, error};
      const obj = data.objects.map((x) => {
        return {
          ...x,
          customMetadata: {
            upload: JSON.parse(x.customMetadata.upload as unknown as string),
          },
        };
      });
      data.objects = obj;
      return {data, error};
    }),
  };
}

export function deleteFile(u: string, keys: string[]) {
  return requests.postJSON(deleteFileRoute(u), keys);
}

export function headFile(key: string) {
  return requests.head(getFileFromKeyRoute(key));
}
