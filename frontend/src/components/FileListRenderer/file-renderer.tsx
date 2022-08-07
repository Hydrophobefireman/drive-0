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
import {Checkbox} from "@hydrophobefireman/kit/input";
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
    if (isSelected) {
      return;
    }
    e.stopPropagation();
    dispatchEvent(new CustomEvent("toggle:menu", {detail: menuRef}));
    setActive((x) => !x);
  }
  useEffect(() => {
    const listener = (e: CustomEvent) => {
      if (e.detail !== menuRef) {
        closeMenu();
      }
    };
    addEventListener("toggle:menu", listener);
    return () => removeEventListener("toggle:menu", listener);
  });
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
  const checkboxClick = (e: MouseEvent) => {
    dispatchEvent(new CustomEvent("toggle:menu", {detail: menuRef}));
    e.stopPropagation();
    delegate(e);
    closeMenu();
  };
  return (
    <div
      data-selected={isSelected}
      data-index={index}
      onClick={delegate}
      class={fstate === "deleting" ? gridElDeleteState : gridEl}
    >
      <Box
        style={{"--kit-justify-content": "space-between"}}
        row={true}
        horizontal="right"
        class={css({paddingLeft: ".25rem", paddingRight: ".25rem"})}
      >
        {
          <button
            aria-label="uncheck"
            data-index={index}
            style={
              isSelected
                ? {"--opacity-desktop": "1", "--button-bg": "#00000078"}
                : {"--button-bg": "transparent", "--opacity-desktop": "0"}
            }
            class={[
              menuButton,
              css({
                "--span-margin": 0,
                "--pt": 0,
                "--pl": 0,
                "--pb": 0,
                "--radius": "0",
                "--b-padding": ".5rem",
              } as any),
            ]}
            data-is="checkbox"
            onClick={checkboxClick}
          >
            <SelectionCheckbox active={active} isSelected={isSelected} />
          </button>
        }
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

        {/* <button
          data-is="checkbox"
          data-index={index}
          class={css({
            width: "100%",
            transition: "var(--kit-transition)",
            pseudo: {
              ":hover": {
                background: "var(--kit-shade-2)",
              },
              ":focus-visible": {
                background: "var(--kit-shade-2)",
              },
            },
          })}
          onClick={checkboxClick}
        >
          <SelectionCheckbox active={active} isSelected={isSelected}>
            Select
          </SelectionCheckbox>
        </button> */}

        {/* <Button
          tabIndex={active ? 0 : -1}
          onClick={download}
          variant="custom"
          data-index={index}
          class={actionButton}
          label="Download file"
          prefix={<DownloadIcon />}
        >
          
        </Button> */}
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
    <Img
      remount
      class={css({display: "block", margin: "auto", objectFit: "cover"})}
      height={100}
      width={100}
      src={`https://icons.api.hpfm.dev/api/vs?mode=mime&name=${encodeURIComponent(
        ct
      )}`}
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

function SelectionCheckbox({
  active,
  isSelected,
  children,
}: {
  active: boolean;
  isSelected: boolean;
  children?: any;
}) {
  return (
    <Checkbox
      tabIndex={active ? 0 : -1}
      boxClass={css({
        pointerEvents: "none",
        paddingLeft: "var(--pl,1.1rem)",
        paddingTop: "var(--pt,.25rem)",
        paddingBottom: "var(--pb,.25rem)",
        "--kit-border": "var(--kit-theme-fg)",

        pseudo: {
          " .kit-cb-icon-container, .kit-radio-span": {
            border: "2px solid var(--kit-border)",
            margin: "var(--span-margin,0 5px 0 0)",
          },
        },
      } as any)}
      boxStyle={{
        "--kit-justify-content": "flex-start",
      }}
      checked={isSelected}
      onCheck={null}
    >
      {children}
    </Checkbox>
  );
}
