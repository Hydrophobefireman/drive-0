import {css} from "catom";
import {createState, useSharedState} from "statedrive";

import {FileListResponse} from "@/api-types/files";
import {FileListRenderer} from "@/components/FileListRenderer";
import {Form} from "@/components/Form";
import {GetAccKey} from "@/components/GetAccKey";
import {Nav} from "@/components/Nav";
import {Upload} from "@/components/Upload";
import {UploadHandler} from "@/components/UploadHandler";
import {getFileList} from "@/handlers/files";
import {useAuthGuard} from "@/hooks/use-auth-guard";
import {
  ACCOUNT_SESSION_STORAGE_KEY,
  accountKeyStore,
} from "@/store/account-key-store";
import {fileMetaStore} from "@/store/file-meta-data-store";
import {useAuthState} from "@/util/bridge";
import {includes} from "@/util/clean";
import {_util} from "@hydrophobefireman/kit";
import {TextButton} from "@hydrophobefireman/kit/button";
import {Box} from "@hydrophobefireman/kit/container";
import {useCachingResource} from "@hydrophobefireman/kit/hooks";
import {Checkbox, Input, useCheckbox} from "@hydrophobefireman/kit/input";
import {Modal} from "@hydrophobefireman/kit/modal";
import {Text} from "@hydrophobefireman/kit/text";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

function Search({
  resp,
  setFiltered,
}: {
  resp: FileListResponse;
  setFiltered(a: FileListResponse): void;
}) {
  const [search, setSearch] = useState("");
  const filterResults = (e?: string) => {
    if (resp && resp.objects) {
      const clone = {...resp};
      clone.objects = resp.objects.filter(
        (x) => !e || includes(x.customMetadata.upload.name, e || search)
      );
      setFiltered(clone);
    }
  };
  function handleInput(e: string) {
    setSearch(e);
    _util.raf(() => _util.raf(() => filterResults(e)));
  }
  useEffect(() => {
    filterResults();
  }, [resp]);
  return (
    <Box
      class={css({
        marginTop: "1rem",
        //@ts-ignore
        "--kit-label-jump": "-115%",
      })}
    >
      <Input
        variant="material"
        value={search}
        setValue={handleInput}
        label="Search"
      />
    </Box>
  );
}
function App({accountKey}: {accountKey: string}) {
  const [user] = useAuthState();
  const {resp, fetchResource} = useCachingResource(
    getFileList,
    [user?.user],
    fileMetaStore,
    [(user && user.user) || null]
  );
  const [filtered, setFiltered] = useState<FileListResponse>();

  return (
    <>
      <Nav />
      <Upload />
      <Search resp={resp} setFiltered={setFiltered} />
      <FileListRenderer fetchResource={fetchResource} files={filtered} />
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
