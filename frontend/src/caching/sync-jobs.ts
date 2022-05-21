import {set} from "statedrive";

import {DecryptedPost, DecryptedPostMetadata} from "@/api-types/post";
import {
  apiDelete,
  createPost,
  fetchPostContent,
  postFetcher,
  updatePost,
} from "@/handlers/posts";
import {postMetadataStore, serverSyncTimeStampStore} from "@/store/posts";
import {timeError} from "@/store/time-error";
import {must} from "@/util/must";
import {time} from "@/util/time";
import {set as idbset} from "@hydrophobefireman/flask-jwt-jskit";

import {getLocalPosts, postsKey} from "./keys";
import {createPostMetadata} from "./pending-posts";

let _prevJob: any;
let _job_mode = {val: null as "server-sync" | "post-sync" | "completed"};
export class SyncJob {
  constructor(
    private type: typeof _job_mode["val"],
    private _time = 10_000,
    private options: {syncIdbOnPostUpdate?: boolean} = {
      syncIdbOnPostUpdate: false,
    }
  ) {}
  async _serverSync() {
    clearTimeout(_prevJob);
    let localPosts = await getLocalPosts();
    const onlyMeta = createPostMetadata(localPosts);
    set(postMetadataStore, {posts: onlyMeta, isLoaded: true});

    const resp = postFetcher();

    const {data: remotePosts, error} = await resp.result;
    const serverTime = +(await resp.headers).get("x-time-stamp");
    const currTime = time();
    if (Math.abs(serverTime - currTime) > 60) {
      console.log(serverTime, currTime);
      return set(timeError, serverTime > currTime ? "behind" : "ahead");
    }

    await this._syncLocal(localPosts, remotePosts);

    must(error);

    const remoteKeys = Object.keys(remotePosts);
    if (remoteKeys.length) {
      await Promise.all(
        remoteKeys.map(async (key) => {
          const serverObject = remotePosts[key];
          if (key in localPosts) {
            const localObject = localPosts[key];
            if (localObject.flags.is_pending_deletion) return;
            // server wins if it has new content
            // otherwise local wins
            if (serverObject.updated_at > localObject.updated_at) {
              const content = await fetchPostContent(key).result;
              localPosts[key] = {...serverObject, content};
            }
          } else {
            const content = await fetchPostContent(key).result;
            localPosts[key] = {...serverObject, content};
          }
          set(postMetadataStore, {
            posts: createPostMetadata(localPosts),
            isLoaded: true,
          });
          await this.pushToIdb(localPosts);
        })
      );
    } else {
      set(postMetadataStore, {
        posts: createPostMetadata(localPosts),
        isLoaded: true,
      });
      await this.pushToIdb(localPosts);
    }
    set(serverSyncTimeStampStore, +new Date());
  }
  async pushToIdb(localPosts: Record<string, DecryptedPost>) {
    await idbset(postsKey, localPosts);
  }
  async _syncLocal(
    localPosts: Record<string, DecryptedPost>,
    remote?: Record<string, DecryptedPostMetadata>
  ) {
    for (const key in localPosts) {
      let $id = key;
      // if another sync job started, we stop
      if (_job_mode.val !== this.type) return;
      const obj = localPosts[key];
      const {is_new, is_pending, is_pending_deletion} = obj.flags;
      if (is_pending_deletion) {
        const {error} = await apiDelete(key).result;
        // if error we leave it as is so it can be collected in the next sync job
        // whenever that is
        if (!error) {
          delete localPosts[key];
          if (remote) {
            delete remote[key];
          }
        }
      } else if (is_new) {
        const {data, error} = await createPost(obj);
        must(error);
        obj.id_ = data.id_;
        $id = obj.id_;
        obj.flags = {is_new: false, is_pending: false};
        delete localPosts[key];
        localPosts[data.id_] = obj;
        dispatchEvent(new CustomEvent(`${key}:updated`, {detail: data.id_}));
      } else if (is_pending) {
        const {error} = await updatePost(obj);
        must(error);
        obj.flags = {is_new: false, is_pending: false};
      } else if (remote && !(key in remote)) {
        delete localPosts[key];
        continue;
      }
    }
    return localPosts;
  }
  sync() {
    if (_job_mode.val && _job_mode.val !== "completed") return;
    clearTimeout(_prevJob);
    _job_mode.val = this.type;
    if (this.type === "server-sync") {
      this._serverSync()
        .catch((e) => {
          console.log("Caught:", e);
          _prevJob = setTimeout(
            () => this._serverSync().catch(() => console.log(e)),
            this._time
          );
        })
        .finally(() => (_job_mode.val = "completed"));
    } else {
      _prevJob = setTimeout(
        () =>
          getLocalPosts()
            .then((p) => this._syncLocal(p))
            .then(async (posts) => {
              if (this.options.syncIdbOnPostUpdate) {
                await this.pushToIdb(posts);
              }
              set(postMetadataStore, {
                posts: createPostMetadata(posts),
                isLoaded: true,
              });
            })
            .catch((e) => console.log("Caught:", e))
            .finally(() => (_job_mode.val = "completed")),
        this._time
      );
    }
  }
}
