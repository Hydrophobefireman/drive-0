import {css} from "catom";
import {useSharedStateValue} from "statedrive";

import {FileListResponse} from "@/api-types/files";
import {deleteFile} from "@/handlers/files";
import {accountKeyStore} from "@/store/account-key-store";
import {useAuthState} from "@/util/bridge";
import {getEventPath} from "@/util/get-path";
import {getFileFromKeyRoute} from "@/util/routes";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {TextButton} from "@hydrophobefireman/kit/button";
import {Box} from "@hydrophobefireman/kit/container";
import {_useHideScrollbar, useClickAway} from "@hydrophobefireman/kit/hooks";
import {ChevronLeftIcon} from "@hydrophobefireman/kit/icons";
import {Modal} from "@hydrophobefireman/kit/modal";
import {Select} from "@hydrophobefireman/kit/select";
import {useCallback, useRef, useState} from "@hydrophobefireman/ui-lib";
import {Skeleton} from "@kit/skeleton";

import {ObjectView} from "../FilePreview";
import {Paginate} from "../Paginate";
import {
  buttonWrapperCls,
  gridElLoader,
  gridRoot,
  viewerControlButton,
} from "./file-list-renderer.style";
import {FileRenderer} from "./file-renderer";
import {useFileListSelection} from "./use-file-list-selection";

const renderCountOptions = [{value: 10}, {value: 15}, {value: 20}, {value: 50}];

export function FileListRenderer({
  files,
  fetchResource,
}: {
  files: FileListResponse;
  fetchResource(): void;
}) {
  const [user] = useAuthState();
  const accKey = useSharedStateValue(accountKeyStore);
  const {
    clearSelection,
    delegateClick,
    selectedIndices,
    file: {selectedFile, selectedFileIndex},
    closeFile,
    openNextFile,
    openPreviousFile,
  } = useFileListSelection(files);

  const render = useCallback(
    (obj: FileListResponse["objects"][0], i: number) => (
      <FileRenderer
        accKey={accKey}
        fetchResource={fetchResource}
        index={i}
        obj={obj}
        delegate={delegateClick}
        isSelected={selectedIndices[i]}
      />
    ),
    [selectedIndices]
  );
  const boxRef = useRef<HTMLDivElement>();
  const menuRef = useRef<HTMLElement>();
  const modalRef = useRef<HTMLDivElement>();
  useClickAway((e) => {
    const p = getEventPath(e);
    if (p.includes(modalRef.current) || p.includes(menuRef.current)) return;
    clearSelection();
  }, boxRef.current);

  const [listState, setListState] = useState<"delete" | "deleting" | "idle">(
    "idle"
  );
  const {show} = useAlerts();
  const [renderCount, setRenderCount] = useState<10 | 15 | 20 | 50>(10);
  if (!files)
    return (
      <div style={{gap: "10px"}} class={gridRoot}>
        {Array.from({length: 5}).map(() => (
          <Skeleton>
            <div style={{height: "100px"}} class={gridElLoader} />
          </Skeleton>
        ))}
      </div>
    );

  function handleDelete() {
    setListState("delete");
  }

  function confDelete() {
    const toDelete = Object.keys(selectedIndices).map(
      (x) => files.objects[x as any as number].key
    );

    setListState("deleting");
    deleteFile(user.user, toDelete).result.then(({data, error}) => {
      setListState("idle");
      clearSelection();
      if (error) {
        show({
          content: `Could not delete files`,
          type: "error",
        });
      }

      fetchResource();
    });
  }
  const selectedIndiceValues = Object.values(selectedIndices);
  const hasSelections = selectedIndiceValues.some(Boolean);
  return (
    <>
      <Modal
        onClickOutside={closeFile}
        onEscape={closeFile}
        active={!!selectedFile}
        class={css({
          //@ts-ignore
          "--kit-modal-min-width": "95vw",
          minHeight: "60vh",
        })}
      >
        {selectedFile && (
          <Modal.Body>
            <Modal.Title
              class={css({
                margin: "0px",
                maxWidth: "80%",
                overflow: "hidden",
                textOverflow: "clip",
              })}
            >
              {selectedFile.customMetadata.upload.name}
            </Modal.Title>
            <Box class={css({position: "relative", width: "100%"})}>
              <ObjectView
                onBack={closeFile}
                accKey={accKey}
                ct={selectedFile.httpMetadata.contentType}
                meta={selectedFile.customMetadata.upload}
                url={getFileFromKeyRoute(selectedFile.key)}
              >
                <Box row>
                  <TextButton
                    mode="secondary"
                    variant="shadow"
                    prefix={<ChevronLeftIcon />}
                    class={viewerControlButton}
                    onClick={openPreviousFile}
                  >
                    Prev
                  </TextButton>
                  <TextButton
                    mode="secondary"
                    variant="shadow"
                    suffix={
                      <ChevronLeftIcon
                        class={css({transform: "rotate(180deg)"})}
                      />
                    }
                    class={viewerControlButton}
                    onClick={openNextFile}
                  >
                    Next
                  </TextButton>
                </Box>
              </ObjectView>
            </Box>
          </Modal.Body>
        )}
      </Modal>
      <Modal active={hasSelections && listState === "delete"}>
        <div ref={modalRef}>
          <Modal.Body>
            <Modal.Title>Confirm delete</Modal.Title>
            <Modal.Body>
              Are you sure you want to delete {selectedIndiceValues.length}{" "}
              items?
            </Modal.Body>
          </Modal.Body>
          <Modal.Actions>
            <Modal.Action onClick={confDelete}>Delete</Modal.Action>
            <Modal.Action
              onClick={() => {
                clearSelection();
                setListState("idle");
              }}
            >
              Cancel
            </Modal.Action>
          </Modal.Actions>
        </div>
      </Modal>
      <Box
        ref={menuRef}
        horizontal="right"
        style={!hasSelections && {pointerEvents: "none"}}
        class={css({padding: "1rem"})}
      >
        <TextButton
          tabIndex={hasSelections ? 0 : -1}
          onClick={handleDelete}
          style={!hasSelections && {opacity: 0}}
          class={css({transition: "var(--kit-transition)"})}
          variant="shadow"
          mode="error"
        >
          Delete
        </TextButton>
      </Box>
      <Box>
        <Select
          label="Show"
          options={renderCountOptions}
          setValue={(x) => setRenderCount(x as any)}
          value={renderCount}
        />
      </Box>
      <div style={listState === "deleting" && {display: "none"}} ref={boxRef}>
        <Paginate
          dualButtons
          buttonClass="kit-button kit-button-secondary"
          buttonWrapperClass={buttonWrapperCls}
          listParentClass={gridRoot}
          atOnce={renderCount}
          items={files.objects}
          render={render}
        />
      </div>
    </>
  );
}
