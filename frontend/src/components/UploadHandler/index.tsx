import {css} from "catom";

import {User} from "@/api-types/user";
import {
  FILE_UPLOAD_EVENT_KEY,
  FileUploadEvent,
  UploadTarget,
} from "@/handlers/uploader";
import {useUpload} from "@/hooks/use-upload";
import {useAuthState} from "@/util/bridge";
import {useMount} from "@hydrophobefireman/kit/hooks";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  MenuAlt3Icon,
  XCircleIcon,
} from "@hydrophobefireman/kit/icons";
import {Text} from "@hydrophobefireman/kit/text";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

const uploaderSheetDesktop = css({
  position: "fixed",
  bottom: "1rem",
  right: "1rem",
  padding: "1rem",
  maxHeight: "80vh",
  overflow: "auto",
  boxShadow: "var(--shadow-elevation-medium)",
  width: "80%",
  maxWidth: "500px",
  zIndex: "var(--kit-z-index-major)",
  background: "var(--kit-background)",
});

const uploaderSheetDesktopMinimized = [
  uploaderSheetDesktop,
  css({
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: ".5rem",
  }),
].join(" ");

const deletedFileMap = new WeakMap<File, {deleted?: boolean}>();

export function UploadHandler({
  accountKey,
  fetchResource,
}: {
  accountKey: string;
  fetchResource(): void;
}) {
  const [uploads, setUploads] = useState<Set<UploadTarget>>();
  const [user] = useAuthState();

  function removeUploads(toRemove: UploadTarget[]) {
    setUploads((uploads) => {
      const clone = new Set(uploads);
      toRemove.forEach((upload) => {
        deletedFileMap.set(upload.file, {deleted: true});
      });
      return clone;
    });
  }
  function addUploads(toAdd: UploadTarget[]) {
    setUploads((uploads) => {
      const clone = new Set(uploads);
      toAdd.forEach((x) => clone.add(x));
      return clone;
    });
  }
  useMount(() => {
    const listener = function (e: FileUploadEvent) {
      const files = e.detail;
      addUploads(files);
    };
    window.addEventListener(FILE_UPLOAD_EVENT_KEY, listener);
    return () => window.removeEventListener(FILE_UPLOAD_EVENT_KEY, listener);
  });
  const [sizeState, setSizeState] = useState<"minimized" | "maximized">(
    "maximized"
  );
  useEffect(() => {
    if (!uploads) return;
    const vals = [...uploads.values()];
    if (vals.length && vals.every((x) => deletedFileMap.has(x.file))) {
      setUploads(new Set());
    }
  }, [uploads]);
  return (
    uploads &&
    accountKey &&
    user &&
    uploads.size > 0 && (
      <div
        class={
          sizeState === "minimized"
            ? uploaderSheetDesktopMinimized
            : uploaderSheetDesktop
        }
      >
        <div
          class={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          })}
        >
          <button
            aria-label="Clear downloads"
            onClick={() => {
              removeUploads(Array.from(uploads));
            }}
            style={
              (!uploads.size || sizeState === "maximized") && {
                opacity: 0,
                pointerEvents: "none",
              }
            }
          >
            <MenuAlt3Icon />
          </button>
          <button
            onClick={() =>
              setSizeState((x) =>
                x === "maximized" ? "minimized" : "maximized"
              )
            }
            aria-label="minimise"
          >
            <ChevronDownIcon
              class={[
                css({transition: "var(--kit-transition)"}),
                sizeState === "minimized"
                  ? css({transform: "rotate(180deg)"})
                  : "",
              ].join(" ")}
            />
          </button>
        </div>
        {sizeState === "minimized" && <Text>{uploads.size} Uploads</Text>}
        {Array.from(uploads).map((upload) =>
          deletedFileMap.has(upload.file) ? (
            <x-upload-deleted />
          ) : (
            <UploadComponent
              fetchResource={fetchResource}
              removeUpload={removeUploads}
              minimized={sizeState === "minimized"}
              accountKey={accountKey}
              target={upload}
              user={user}
            />
          )
        )}
      </div>
    )
  );
}
const fileName = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});
const progressBar = css({
  border: "2px solid",
  marginTop: ".25rem",
  borderColor: "var(--kit-theme-fg)",
  borderRadius: "50px",
  transformOrigin: "left",
  transform: "scaleX(var(--scale))",
});
export interface UploadComponentProps {
  target: UploadTarget;
  user: User;
  accountKey: string;
  minimized: boolean;
  removeUpload(t: UploadTarget[]): void;
  fetchResource(): void;
}

function UploadComponent({
  target,
  accountKey,
  removeUpload,
  user,
  minimized,
  fetchResource,
}: UploadComponentProps) {
  const {progress, status, uploader} = useUpload(
    target,
    user,
    accountKey,
    fetchResource
  );

  if (minimized) return null;
  return (
    <div
      class={css({
        marginTop: ".5rem",
        marginBottom: ".5rem",
        cursor: "pointer",
        pseudo: {
          ":hover button": {
            opacity: "1",
          },
        },
      })}
    >
      <div class={fileName}>
        {status === "encrypting" || status === "in-progress" ? (
          <loading-spinner size={12} />
        ) : status === "errored" ? (
          <ExclamationCircleIcon />
        ) : (
          <CheckCircleIcon />
        )}{" "}
        <span
          class={css({
            whiteSpace: "nowrap",
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          })}
        >
          {target.fileData.name}
        </span>
        <button
          onClick={() => {
            if (status !== "finished") {
              uploader.current.cancel();
            }
            removeUpload([target]);
          }}
          class={css({
            height: "24px",
            opacity: 0,
            media: {
              "(max-width:600px)": {
                opacity: 1,
              },
            },
            transition: "var(--kit-transition)",
          })}
          aria-label={`Delete download status for ${target.fileData.name}`}
        >
          <XCircleIcon />
        </button>
      </div>
      <div class={progressBar} style={{"--scale": progress}} />
    </div>
  );
}
