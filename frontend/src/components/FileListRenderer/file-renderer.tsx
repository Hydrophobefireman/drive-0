import {css} from "catom";

import {
  FileListResponse,
  PreviewMetadata,
  UploadCustomMetadata,
} from "@/api-types/files";
import {dec} from "@/crypto/string_enc";
import {deleteFile} from "@/handlers/files";
import {
  NEEDS_BLUR_HASH,
  useBlurHashDecode,
  useFileDecrypt,
} from "@/hooks/use-file-decrypt";
import {useAuthState} from "@/util/bridge";
import {fileUrl} from "@/util/file-url";
import {imagePreviewDownloadRoute} from "@/util/routes";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {Button} from "@hydrophobefireman/kit/button";
import {Box} from "@hydrophobefireman/kit/container";
import {
  useClickAway,
  useMount,
  useToggleState,
} from "@hydrophobefireman/kit/hooks";
import {
  DotsVerticalIcon,
  DownloadIcon,
  ExternalLinkIcon,
  LockClosedIcon,
  TrashIcon,
} from "@hydrophobefireman/kit/icons";
import {Text} from "@hydrophobefireman/kit/text";
import {useEffect, useMemo, useRef, useState} from "@hydrophobefireman/ui-lib";

import {useObjectUrl} from "../FilePreview/Renderers/use-file";
import {Img} from "../Img";
import {
  actionButton,
  gridEl,
  gridElDeleteState,
  imgPreview,
  menuActive,
  menuButton,
  menuInactive,
  openLinkButton,
} from "./file-list-renderer.style";

export interface FileRendererProps {
  obj: FileListResponse["objects"][0];
  fetchResource(): void;
  index: number;
  delegate(e: MouseEvent): boolean;
  isSelected?: boolean;
  accKey: string;
  download(n: JSX.TargetedMouseEvent<HTMLButtonElement>): void;
}

export function FileRenderer({
  obj,
  fetchResource,
  index,
  delegate,
  isSelected,
  accKey,
  download,
}: FileRendererProps) {
  const {show} = useAlerts();
  const [user] = useAuthState();
  const {active, setActive} = useToggleState(false);
  const menuRef = useRef<HTMLDivElement>();
  const [fstate, setFstate] = useState<"idle" | "deleting">("idle");
  function closeMenu() {
    setActive(false);
  }
  function toggleMenu(e: JSX.TargetedMouseEvent<HTMLElement>) {
    if (isSelected) return;
    e.stopPropagation();
    setActive((x) => !x);
  }
  useClickAway(closeMenu, active && menuRef.current);

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    closeMenu();
    setFstate("deleting");
    deleteFile(user.user, [obj.key]).result.then(({data, error}) => {
      if (error) {
        show({
          content: `Could not delete ${obj.customMetadata.upload.name}`,
          type: "error",
        });
        return setFstate("idle");
      }
      fetchResource();
    });
  }
  useEffect(() => {
    setFstate("idle");
    closeMenu();
  }, [obj]);
  useMount(() => () => closeMenu);
  if (!user) return;

  return (
    <div
      data-selected={isSelected}
      data-index={index}
      onClick={delegate}
      class={fstate === "deleting" ? gridElDeleteState : gridEl}
    >
      <Box horizontal="right">
        <button
          aria-label="Menu"
          class={menuButton}
          disabled={isSelected}
          onClick={toggleMenu}
        >
          <DotsVerticalIcon color="white" />
        </button>
      </Box>
      <div ref={menuRef} class={active ? menuActive : menuInactive}>
        <Button
          tabIndex={active ? 0 : -1}
          onClick={handleDelete}
          variant="custom"
          class={actionButton}
          label="Delete file"
          prefix={<TrashIcon />}
        >
          Delete
        </Button>
        <a
          tabIndex={active ? 0 : -1}
          onClick={(e) => e.stopPropagation()}
          href={`/viewer/?key=${encodeURIComponent(obj.key)}`}
          target="_blank"
          class={openLinkButton}
          label="Open in new tab"
        >
          <ExternalLinkIcon />
          <span>Open in new tab</span>
        </a>
        <Button
          tabIndex={active ? 0 : -1}
          onClick={download}
          variant="custom"
          data-index={index}
          class={actionButton}
          label="Download file"
          prefix={<DownloadIcon />}
        >
          Download
        </Button>
      </div>
      {obj.customMetadata.upload.preview ? (
        <OptimizedPreview
          accKey={accKey}
          preview={obj.customMetadata.upload.preview}
          user={user.user}
        />
      ) : obj.customMetadata.upload.enc ? (
        <EncryptedFilePreview
          accKey={accKey}
          meta={obj.customMetadata.upload}
          url={fileUrl(user.user, obj)}
        />
      ) : obj.httpMetadata.contentType.includes("image") ? (
        <div
          style={{backgroundImage: `url("${fileUrl(user.user, obj)}")`}}
          class={imgPreview}
        />
      ) : (
        <Img
          remount
          class={css({display: "block", margin: "auto", objectFit: "cover"})}
          height={100}
          width={100}
          src={`https://icons.api.hpfm.dev/api/vs?mode=mime&name=${encodeURIComponent(
            obj.httpMetadata.contentType
          )}`}
        />
      )}

      <Text.div
        color="kit-background"
        align="center"
        class={css({
          height: "3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: ".25rem",
          wordBreak: "break-word",
          backdropFilter: "brightness(0.5)",
        })}
      >
        {obj.customMetadata.upload.enc && "🔒"} {obj.customMetadata.upload.name}
      </Text.div>
    </div>
  );
}
interface EncrProps {
  url: string;
  meta: UploadCustomMetadata;
  accKey: string;
}
function EncryptedImagePreview({
  accKey,
  meta,
  url,
}: Omit<EncrProps, "meta"> & {meta: string}) {
  const {blob} = useFileDecrypt({url, meta, accKey, cache: true});
  const hash = useBlurHashDecode({accKey, meta});
  const src = useObjectUrl(blob);

  return blob && src ? (
    <div style={{backgroundImage: `url("${src}")`}} class={imgPreview} />
  ) : hash && hash !== NEEDS_BLUR_HASH ? (
    <div
      data-is="blur-hash"
      style={{backgroundImage: `url("${hash}")`}}
      class={imgPreview}
    />
  ) : (
    <loading-spinner />
  );
}
function EncryptedFilePreview({accKey, meta, url}: EncrProps) {
  const parsed = useMemo(() => JSON.parse(meta.enc), [meta.enc]);
  const decr = useMemo(() => dec(accKey), [accKey]);
  const ct = decr(parsed.type);
  if (ct.includes("image")) {
    return <EncryptedImagePreview accKey={accKey} meta={meta.enc} url={url} />;
  }
  return (
    <LockClosedIcon
      class={css({display: "block", margin: "auto"})}
      size={100}
    />
  );
}

function OptimizedPreview({
  accKey,
  preview,
  user,
}: {
  accKey: string;
  preview: PreviewMetadata;
  user: string;
}) {
  return (
    <EncryptedImagePreview
      accKey={accKey}
      meta={preview.meta}
      url={imagePreviewDownloadRoute(user, preview.id)}
    />
  );
}
