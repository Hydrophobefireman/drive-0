import {useSharedState} from "statedrive";

import {FileListResponse} from "@/api-types/files";
import {FileListRenderer} from "@/components/FileListRenderer";
import {Filter} from "@/components/FilterFiles";
import {GetAccKey} from "@/components/GetAccKey";
import {Nav} from "@/components/Nav";
import {Search} from "@/components/SearchFiles";
import {Upload} from "@/components/Upload";
import {UploadHandler} from "@/components/UploadHandler";
import {getFileList} from "@/handlers/files";
import {useAuthGuard} from "@/hooks/use-auth-guard";
import {accountKeyStore} from "@/store/account-key-store";
import {fileMetaStore} from "@/store/file-meta-data-store";
import {useAuthState} from "@/util/bridge";
import {_util} from "@hydrophobefireman/kit";
import {useCachingResource} from "@hydrophobefireman/kit/hooks";
import {useState} from "@hydrophobefireman/ui-lib";

function App({accountKey}: {accountKey: string}) {
  const [user] = useAuthState();
  const {resp, fetchResource} = useCachingResource(
    getFileList,
    [user?.user],
    fileMetaStore,
    [(user && user.user) || null]
  );
  const [filtered, setFiltered] = useState<FileListResponse>();
  const [sorted, setSorted] = useState<FileListResponse>();

  return (
    <>
      <Nav />
      <Upload />
      <Search resp={resp} setFiltered={setFiltered} />
      <Filter
        files={filtered}
        setSortedFiles={setSorted}
        accountKey={accountKey}
      />
      <FileListRenderer fetchResource={fetchResource} files={sorted} />
      <UploadHandler fetchResource={fetchResource} accountKey={accountKey} />
    </>
  );
}

export default function _App() {
  const loggedIn = useAuthGuard("/app");
  const [accKey, setKey] = useSharedState(accountKeyStore);
  if (!accKey) return <GetAccKey setKey={setKey} />;
  if (!loggedIn) return <></>;
  return <App accountKey={accKey} />;
}
