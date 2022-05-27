import {useSharedState} from "statedrive";

import {FileListResponse, UploadCustomMetadata} from "@/api-types/files";
import {ObjectView} from "@/components/FilePreview";
import {GetAccKey} from "@/components/GetAccKey";
import {headFile} from "@/handlers/files";
import {accountKeyStore} from "@/store/account-key-store";
import {fileMetaStore} from "@/store/file-meta-data-store";
import {useAuthState} from "@/util/bridge";
import {fileUrl} from "@/util/file-url";
import {getFileFromKeyRoute} from "@/util/routes";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {useResource} from "@hydrophobefireman/kit/hooks";
import {useEffect, useRoute, useState} from "@hydrophobefireman/ui-lib";

export default function Viewer() {
  const {search} = useRoute();
  const [auth] = useAuthState();
  const [meta] = useSharedState(fileMetaStore);
  const key = search.get("key");
  const [accKey, setKey] = useSharedState(accountKeyStore);
  const fileMeta = meta && meta.objects.find((x) => x.key === key);
  if (auth && !accKey) {
    return <GetAccKey setKey={setKey} />;
  }
  if (!key) return;
  if (fileMeta) {
    return (
      <ObjectView
        accKey={accKey}
        url={getFileFromKeyRoute(key)}
        meta={fileMeta.customMetadata.upload}
        ct={fileMeta.httpMetadata.contentType}
      />
    );
  }
  return <FileBlobViewer fileKey={key} accKey={accKey} />;
}

function FileBlobViewer({fileKey, accKey}: {fileKey: string; accKey: string}) {
  const {show} = useAlerts();
  const [contentType, setContentType] = useState<string>();
  const [meta, setMeta] = useState<UploadCustomMetadata>();
  useEffect(() => {
    if (!fileKey) return;
    const req = headFile(fileKey);
    (async () => {
      const {headers} = req;
      const h = await headers;
      const fileMeta = h.get("x-file-meta");
      if (!fileMeta) {
        return show({content: "Could not find file metadata", type: "error"});
      }
      const parsed: UploadCustomMetadata = JSON.parse(fileMeta);
      const ct = h.get("content-type");
      setMeta(parsed);
      setContentType(ct);
    })();
    return () => req.controller.abort();
  }, [fileKey]);
  if (!meta || !fileKey) return <loading-spinner />;
  return (
    <ObjectView
      url={getFileFromKeyRoute(fileKey)}
      ct={contentType}
      meta={meta}
      accKey={accKey}
    />
  );
}
