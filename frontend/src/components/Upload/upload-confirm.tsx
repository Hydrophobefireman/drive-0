import {PendingFileProps} from "../../api-types/PendingFileProps";
import {css} from "catom";
import {Modal} from "@hydrophobefireman/kit/modal";
import {FilePreview} from "../FilePreview";
import {Box} from "@hydrophobefireman/kit/container";
import {LockClosedIcon, LockOpenIcon} from "@hydrophobefireman/kit/icons";
import {Switch} from "@hydrophobefireman/kit/input";
import {Text} from "@hydrophobefireman/kit/text";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";
import {TextButton} from "@hydrophobefireman/kit/button";

const fileModal = css({
  padding: "1rem",
});

export interface UploadConfirmProps {
  next(): void;
  setFiles(x: Map<File, PendingFileProps>): void;
  files: Map<File, PendingFileProps>;
  clear(): void;
  updateFile(t: File, x: PendingFileProps): void;
}

export function UploadConfirm({
  files,
  clear,
  next,
  setFiles,
  updateFile,
}: UploadConfirmProps) {
  const fileSize = files?.size ?? 0;
  const hasFiles = files && fileSize > 0;
  if (!hasFiles) return;
  const isEncryptingEveryFile = Array.from(files.values()).every(
    (x) => x.shouldEncrypt
  );

  return (
    <Modal
      class={css({
        //@ts-ignore
        "--kit-modal-min-width": "80%",
        overflow: "auto",
        maxHeight: "95%",
      })}
      active
      onEscape={clear}
    >
      <Modal.Body>
        <Modal.Title>Upload Files</Modal.Title>
        <div
          class={css({
            width: "80%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          })}
        >
          <TextButton mode="error" onClick={clear}>
            Cancel
          </TextButton>
          <TextButton mode="success" onClick={next}>
            Upload
          </TextButton>
        </div>
        {fileSize > 1 && (
          <Box>
            <Switch
              onInput={(e) => {
                const {checked} = e.currentTarget as HTMLInputElement;
                const tmp = new Map(files);
                for (const [k, v] of tmp) {
                  tmp.set(k, {name: v.name, shouldEncrypt: checked});
                }
                setFiles(tmp);
              }}
              label="encrypt every file"
              state={isEncryptingEveryFile ? "enabled" : "disabled"}
            />
            <Text.p color="kit-shade-4" size=".8rem">
              {!isEncryptingEveryFile ? "Not Encrypting " : "Encrypting "} every
              file
            </Text.p>
          </Box>
        )}
        <div class={fileModal}>
          {Array.from(files.entries()).map(([file, x]) => (
            <FilePreview file={file}>
              <FileEncryptionPrefs
                file={file}
                updateFile={updateFile}
                fileInfo={x}
              />
            </FilePreview>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}

function FileEncryptionPrefs({
  updateFile,
  fileInfo,
  file,
}: {
  file: File;
  fileInfo: PendingFileProps;
  updateFile(f: File, x: PendingFileProps): void;
}) {
  const [value, setValue] = useState("");

  function handleEncryptionPrefChange(
    e: JSX.TargetedMouseEvent<HTMLInputElement>
  ) {
    const {checked} = e.currentTarget;
    updateFile(file, {
      name: fileInfo.name,
      shouldEncrypt: checked,
    });
  }
  useEffect(() => {
    setValue(fileInfo.name);
  }, [file]);
  useEffect(() => {
    updateFile(file, {
      name: value,
      shouldEncrypt: fileInfo.shouldEncrypt,
    });
  }, [value]);
  return (
    <>
      <input
        value={value}
        onInput={(e) => {
          setValue(e.currentTarget.value);
        }}
        class={css({
          color: "var(--kit-shade-4)",
          border: "none",
          marginTop: "1rem",
          marginBottom: "1rem",
          textAlign: "center",
          pseudo: {
            ":focus": {
              outline: "2px solid var(--kit-shade-2)",
            },
          },
        })}
      />
      <Box row>
        <LockOpenIcon />
        <Switch
          label="Encrypt"
          state={fileInfo.shouldEncrypt ? "enabled" : "disabled"}
          onInput={handleEncryptionPrefChange}
        />
        <LockClosedIcon />
      </Box>
      <Text.p size=".8rem" color="kit-shade-4">
        File will {fileInfo.shouldEncrypt ? "" : "not "} be encrypted
      </Text.p>

      <hr
        class={css({
          borderColor: "var(--kit-shade-1)",
          width: "100%",
          marginTop: ".5rem",
          marginBottom: ".5rem",
        })}
      />
    </>
  );
}
