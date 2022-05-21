// import {css} from "catom";

import {css} from "catom";
import {useSharedState} from "statedrive";

import {getLocalPosts} from "@/caching/keys";
import {SyncJob} from "@/caching/sync-jobs";
import {deletePost} from "@/handlers/posts";
import {useTrixFile} from "@/hooks/use-trix-file";
import {postMetadataStore, serverSyncTimeStampStore} from "@/store/posts";
import {buildPortal} from "@hydrophobefireman/kit/build-portal";
import {Button} from "@hydrophobefireman/kit/button";
import {Box} from "@hydrophobefireman/kit/container";
import {_useHideScrollbar, useMount} from "@hydrophobefireman/kit/hooks";
import {TrashIcon, XCircleIcon} from "@hydrophobefireman/kit/icons";
import {Input} from "@hydrophobefireman/kit/input";
import {Text} from "@hydrophobefireman/kit/text";
import {
  A,
  loadURL,
  redirect,
  useEffect,
  useMemo,
  useRef,
} from "@hydrophobefireman/ui-lib";

import {Form} from "../Form";
import {usePostUpdater} from "./use-post-content-update";

const modalRoot = css({
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#00000030",
});
export interface EditorProps {
  close?(): void;
  id: string;
}

const win: any = window;
win.__PostEditorRenderCount = 0;
function Editor({close, id}: EditorProps) {
  win.__PostEditorRenderCount++;
  const trix = useRef<any>();

  // usePostMetadataUpdate(title, post);
  const syncJob = useMemo(
    () => new SyncJob("post-sync", 0, {syncIdbOnPostUpdate: true}),
    []
  );
  const [postMetadata] = useSharedState(postMetadataStore);
  const [serverSyncTs] = useSharedState(serverSyncTimeStampStore);
  const currentPost = postMetadata?.posts?.[id];
  const postUpdater = usePostUpdater();
  const isSyncingValue = useRef(false);
  useTrixFile();
  async function handleInput(content: string) {
    if (isSyncingValue.current) {
      isSyncingValue.current = false;
      return;
    }
    postUpdater(id, {content, flags: currentPost.flags}, () => syncJob.sync());
  }
  async function setTitle(title: string) {
    postUpdater(id, {title, flags: currentPost.flags}, () => syncJob.sync());
  }
  useEffect(() => {
    const listenerKey = `${id}:updated`;
    const listener = function (e: CustomEvent) {
      loadURL(`/app?post=${encodeURIComponent(e.detail)}`);
    };
    window.addEventListener(listenerKey, listener);
    return () => window.removeEventListener(listenerKey, listener);
  }, [id]);

  useEffect(async () => {
    const localPosts = await getLocalPosts();
    if (trix.current) {
      const nextValue = currentPost ? localPosts[currentPost.id_].content : "";
      if (trix.current.value !== nextValue) {
        isSyncingValue.current = true;
        trix.current.value = nextValue;
      }
    }
  }, [id, serverSyncTs]);

  async function handleDelete() {
    await deletePost(id);
    redirect("/app");
  }
  if (!currentPost && postMetadata.isLoaded)
    return (
      <div class={modalRoot}>
        Note not found
        <div>
          <A href="/app">Go back</A>
        </div>
      </div>
    );
  if (!currentPost) return <div class={modalRoot}>Fetching...</div>;
  return (
    <Form>
      <div class={modalRoot}>
        <div
          class={css({
            background: "var(--kit-background)",
            padding: "1rem",
            height: "80vh",
            media: {
              "(max-width:600px)": {
                height: "95vh",
              },
            },
            maxWidth: "95vw",
            animation: "anim-in 0.3s ease",
            animationFillMode: "forwards",
          })}
        >
          <Box
            horizontal="right"
            class={css({
              display: "flex",
              marginTop: ".5rem",
              marginBottom: "1rem",
            })}
          >
            <button
              type="button"
              class={css({
                height: "2rem",
                width: "2rem",
              })}
              onClick={() => close && close()}
            >
              <XCircleIcon />
            </button>
          </Box>
          <Box>
            <Input
              variant="material"
              label="Title"
              value={currentPost.title}
              setValue={setTitle}
            />
          </Box>
          <div
            class={css({
              maxHeight: "70%",
              overflowY: "auto",
              marginBottom: "1rem",
            })}
          >
            <trix-editor
              //@ts-ignore
              ontrix-change={(e: any) => handleInput(e.target.value)}
              ref={trix}
            ></trix-editor>
          </div>
          <div
            class={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            })}
          >
            <Text.span aria-hidden></Text.span>
            <Button
              mode="error"
              variant="custom"
              label="delete"
              onClick={handleDelete}
            >
              <TrashIcon color="white" />
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
}
function _Editor({active, ...rest}: EditorProps & {active: boolean}) {
  _useHideScrollbar(active);
  if (active) return <Editor {...rest} />;
}
export const PostEditor = buildPortal<
  EditorProps & {active: boolean},
  typeof _Editor
>("PostEditor", _Editor);
