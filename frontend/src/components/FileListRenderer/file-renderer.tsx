import {css} from "catom";

import {FileListResponse} from "@/api-types/files";
import {deleteFile} from "@/handlers/files";
import {useAuthState} from "@/util/bridge";
import {fileUrl} from "@/util/file-url";
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
  ExternalLinkIcon,
  LockClosedIcon,
  TrashIcon,
} from "@hydrophobefireman/kit/icons";
import {Text} from "@hydrophobefireman/kit/text";
import {useEffect, useRef, useState} from "@hydrophobefireman/ui-lib";

import {Img} from "../Img";
import {
  actionButton,
  gridEl,
  gridElDeleteState,
  menuActive,
  menuInactive,
  openLinkButton,
} from "./file-list-renderer.style";

export interface FileRendererProps {
  obj: FileListResponse["objects"][0];
  fetchResource(): void;
  index: number;
  delegate(e: MouseEvent): boolean;
  isSelected?: boolean;
}
export function FileRenderer({
  obj,
  fetchResource,
  index,
  delegate,
  isSelected,
}: FileRendererProps) {
  const {show} = useAlerts();
  const [user] = useAuthState();
  const {active, setActive} = useToggleState(false);
  const menuRef = useRef<HTMLDivElement>();
  const [fstate, setFstate] = useState<"idle" | "deleting">("idle");
  function closeMenu() {
    setActive(false);
  }
  function openMenu(e: JSX.TargetedMouseEvent<HTMLElement>) {
    if (isSelected) return;
    e.stopPropagation();
    setActive(true);
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
      <div ref={menuRef} class={active ? menuActive : menuInactive}>
        <Button
          onClick={handleDelete}
          variant="custom"
          class={actionButton}
          label="Delete file"
          prefix={<TrashIcon />}
        >
          Delete
        </Button>
        <a
          onClick={(e) => e.stopPropagation()}
          href={`/viewer/?key=${encodeURIComponent(obj.key)}`}
          target="_blank"
          class={openLinkButton}
          label="Open in new tab"
        >
          <ExternalLinkIcon />
          <span>Open in new tab</span>
        </a>
      </div>
      <Box horizontal="right">
        <button aria-label="Menu" disabled={isSelected} onClick={openMenu}>
          <DotsVerticalIcon />
        </button>
      </Box>
      {obj.customMetadata.upload.enc ? (
        <LockClosedIcon
          class={css({display: "block", margin: "auto"})}
          size={100}
        />
      ) : (
        <Img
          remount
          class={css({display: "block", margin: "auto", objectFit: "cover"})}
          height={100}
          width={100}
          src={
            obj.httpMetadata.contentType.includes("image")
              ? fileUrl(user.user, obj)
              : `https://icons.api.hpfm.dev/api/vs?mode=mime&name=${encodeURIComponent(
                  obj.httpMetadata.contentType
                )}`
          }
        />
      )}

      <Text.div align="center" class={css({wordBreak: "break-word"})}>
        {obj.customMetadata.upload.name}
      </Text.div>
    </div>
  );
}
