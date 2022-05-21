import {css} from "catom";
import {useSharedStateValue} from "statedrive";

import {DecryptedPost} from "@/api-types/post";
import {createPendingPost, patchPost} from "@/caching/pending-posts";
import {SyncJob} from "@/caching/sync-jobs";
import {Nav} from "@/components/Nav";
import {PostEditor} from "@/components/PostEditor";
import {useAuthGuard} from "@/hooks/use-auth-guard";
import {useCachedAuth} from "@/hooks/use-cached-auth";
import {postMetadataStore} from "@/store/posts";
import {time} from "@/util/time";
import {Button} from "@hydrophobefireman/kit/button";
import {Box} from "@hydrophobefireman/kit/container";
import {
  useInterval,
  useLocation,
  useRerender,
} from "@hydrophobefireman/kit/hooks";
import {DocumentTextIcon, PlusCircleIcon} from "@hydrophobefireman/kit/icons";
import {Text} from "@hydrophobefireman/kit/text";
import {loadURL, useEffect, useMemo, useState} from "@hydrophobefireman/ui-lib";

const rtf =
  typeof Intl !== "undefined"
    ? new Intl.RelativeTimeFormat("en")
    : {format: (x: any) => x};
function timeDifference(timestamp: number) {
  const sPerMinute = 60;
  const sPerHour = sPerMinute * 60;
  const msPerDay = sPerHour * 24;
  const sPerMonth = msPerDay * 30;
  const sPerYear = msPerDay * 365;

  const current = time();
  const elapsed = current - timestamp;

  if (elapsed < sPerMinute) {
    return rtf.format(-Math.floor(elapsed), "seconds");
  } else if (elapsed < sPerHour) {
    return rtf.format(-Math.floor(elapsed / sPerMinute), "minutes");
  } else if (elapsed < msPerDay) {
    return rtf.format(-Math.floor(elapsed / sPerHour), "hours");
  } else if (elapsed < sPerMonth) {
    return rtf.format(-Math.floor(elapsed / sPerMonth), "months");
  } else if (elapsed < sPerYear) {
    return rtf.format(-Math.floor(elapsed / sPerYear), "years");
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}

const postLink = css({
  //@ts-ignore
  "--shade": "#0000004a",
  textDecoration: "none",
  color: "inherit",
  height: "3rem",
  marginLeft: ".5rem",
  marginRight: ".5rem",
  width: "100%",
  overflowWrap: "break-word",
  padding: ".25rem",
  transition: "var(--kit-transition)",
  outline: "none",
  display: "flex",
  borderRadius: "var(--kit-radius)",
  alignItems: "center",
  justifyContent: "space-between",
  media: {
    "(max-width:600px)": {
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      marginTop: ".5rem",
      marginBottom: ".5rem",
    },
  },
  pseudo: {
    ":hover": {background: "var(--kit-shade-2)"},
    ":focus": {
      background: "var(--kit-shade-2)",
    },
    ":focus-visible": {
      outline: "2px solid var(--kit-shade-2)",
    },
  },
});

export default function App() {
  useAuthGuard.cached("/app");
  const [obj] = useCachedAuth();
  const {id_: userId} = obj || {};
  const {isLoaded, posts} = useSharedStateValue(postMetadataStore) || {};
  const {qs} = useLocation();
  const params = useMemo(() => new URLSearchParams(qs), [qs]);
  const [editing, setEditing] = useState(() => params.has("post"));

  async function syncContent() {
    // if (params.has("post")) return;
    const job = new SyncJob("server-sync");
    job.sync();
  }
  useEffect(syncContent, [params]);
  async function createPost() {
    const post: DecryptedPost = createPendingPost(userId, "", "");
    await patchPost(post);
    loadURL(`/app?post=${encodeURIComponent(post.id_)}`);
    setEditing(true);
  }
  useEffect(() => {
    setEditing(params.has("post"));
  }, [params]);
  function openInlineEditor(e: JSX.TargetedMouseEvent<HTMLAnchorElement>) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    const {
      currentTarget: {href},
    } = e;
    loadURL(href);
    setEditing(true);
    const {activeElement} = document;
    if (activeElement) {
      (activeElement as HTMLAnchorElement).blur();
    }
  }
  const sorted = useMemo(
    () =>
      posts &&
      Object.values(posts).sort((a, b) => {
        return b.created_at - a.created_at;
      }),
    [posts]
  );
  const rerender = useRerender();
  useInterval(() => {
    // refresh times
    rerender();
  }, 60_000);

  if (!isLoaded) return;

  return (
    <>
      <Nav />
      <Box element={"section"}>
        <Text.h1 class={css({fontWeight: "bold", fontSize: "2rem"})}>
          My Journals
        </Text.h1>
        <Box class={css({marginTop: "1rem"})}>
          {
            <Button
              onClick={createPost}
              mode="secondary"
              variant="custom"
              label="Create Post"
              style={editing && {opacity: "0", pointerEvents: "none"}}
              class={css({
                //@ts-ignore
                "--kit-radius": "100px",
                "--kit-background": "var(--kit-theme-fg)",
                "--kit-foreground": "white",
                borderWidth: "0",
                fontWeight: "bold",
                height: "3rem",
              })}
            >
              <PlusCircleIcon color="white" />
              <span
                class={css({
                  fontWeight: "bold",
                  marginLeft: "5px",
                })}
              >
                Create
              </span>
            </Button>
          }
        </Box>
        <Box
          horizontal="left"
          class={css({
            marginTop: "1rem",
            width: "95%",
          })}
        >
          {sorted.map(
            (x) =>
              !x.flags.is_pending_deletion && (
                <a
                  data-id={x.id_}
                  href={`/app?post=${encodeURIComponent(x.id_)}`}
                  onClick={openInlineEditor}
                  class={postLink}
                >
                  <span
                    class={css({
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    })}
                  >
                    <DocumentTextIcon color="var(--shade)" />
                    <span
                      class={css({
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                        textDecorationColor: "var(--shade)",
                      })}
                    >
                      {x.title}
                    </span>
                  </span>
                  <span>
                    <Text.span color="kit-shade-3" size=".8rem">
                      {x.created_at && timeDifference(x.created_at)}
                    </Text.span>
                  </span>
                </a>
              )
          )}
        </Box>

        <PostEditor
          id={params.get("post")}
          active={editing}
          close={() => {
            setEditing(false);
            loadURL("/app");
          }}
        />
      </Box>
    </>
  );
}
