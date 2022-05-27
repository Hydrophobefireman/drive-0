import {css} from "catom";

import {
  FILE_UPLOAD_EVENT_KEY,
  FileUploadEvent,
  UploadTarget,
} from "@/handlers/uploader";
import {useAuthState} from "@/util/bridge";
import {TextButton} from "@hydrophobefireman/kit/button";
import {Box} from "@hydrophobefireman/kit/container";
import {useFileDrop} from "@hydrophobefireman/kit/hooks";
import {PlusIcon} from "@hydrophobefireman/kit/icons";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

import {PendingFileProps} from "../../api-types/PendingFileProps";
import {UploadConfirm} from "./upload-confirm";

const uploadBtn = css({
  pseudo: {
    ":focus-visible": {outline: "2px solid"},
    ".kit-button": {
      borderRadius: "30px",
      height: "2.5rem",
      padding: "1.5rem",
      borderColor: "transparent",
      boxShadow: "var(--shadow-elevation-medium)",
      marginBottom: ".5rem",
    },
    ".kit-button:hover": {
      backgroundColor: "var(--kit-shade-1)",
      boxShadow: "var(--shadow-elevation-low)",
      transform: "scale(0.98)",
    },
  },
});
function getFiles() {
  return new Promise<File[]>((resolve) => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.multiple = true;
    inp.addEventListener(
      "change",
      () => {
        return resolve(Array.from(inp.files));
      },
      {once: true}
    );
    inp.click();
  });
}
export function Upload() {
  const [droppedFiles, _, reset] = useFileDrop(document.documentElement, {
    multiple: true,
  });
  const [user] = useAuthState();
  const [pendingFiles, setPendingFiles] = useState<Map<File, PendingFileProps>>(
    new Map()
  );
  function handleConfirm(f: File[]) {
    if (!f || !f.length || !user?.user) return;
    setPendingFiles((x: Map<File, PendingFileProps>) => {
      f.forEach(($) => x.set($, {shouldEncrypt: true, name: $.name}));
      return x;
    });
  }
  async function uploader() {
    const files = await getFiles();

    handleConfirm(files);
  }
  useEffect(() => {
    handleConfirm(droppedFiles);
  }, [droppedFiles]);
  function clear() {
    pendingFiles.clear();
    setPendingFiles(new Map());
    reset();
  }
  function updateFile(target: File, x: PendingFileProps) {
    setPendingFiles((f) => f.set(target, x));
  }
  function handleNext() {
    const detail: UploadTarget[] = Array.from(
      Array.from(pendingFiles.entries()).map(([file, d]) => ({
        file,
        fileData: d,
      }))
    );
    const ev: FileUploadEvent = new CustomEvent(FILE_UPLOAD_EVENT_KEY, {
      detail,
    });
    window.dispatchEvent(ev);
    clear();
  }
  return (
    <Box>
      <TextButton
        onClick={uploader}
        variant="custom"
        class={uploadBtn}
        prefix={<PlusIcon size={"2rem"} />}
      >
        Upload
      </TextButton>
      <UploadConfirm
        next={handleNext}
        files={pendingFiles}
        clear={clear}
        updateFile={updateFile}
        setFiles={setPendingFiles}
      />
    </Box>
  );
}
