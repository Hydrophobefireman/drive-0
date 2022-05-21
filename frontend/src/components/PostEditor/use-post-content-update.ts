import {set} from "statedrive";

import {DecryptedPost} from "@/api-types/post";
import {getLocalPosts, setLocalPosts} from "@/caching/keys";
import {createPostMetadata} from "@/caching/pending-posts";
import {postMetadataStore} from "@/store/posts";
import {time} from "@/util/time";
import {useCallback, useRef} from "@hydrophobefireman/ui-lib";

export function usePostUpdater(_timeout: number = 500) {
  const timerRef = useRef<any>();
  const _handleInput = useCallback(async function handleInput(
    id: string,
    post: Partial<DecryptedPost>
  ) {
    const localPosts = await getLocalPosts();
    if (!(id in localPosts)) {
      throw new Error(`${id} : does not exist`);
    }

    localPosts[id] = {
      ...localPosts[id],
      ...post,
      updated_at: time(),
      flags: {is_new: post?.flags?.is_new, is_pending: true},
    };
    await setLocalPosts(localPosts);
    set(postMetadataStore, {
      isLoaded: true,
      posts: createPostMetadata(localPosts),
    });
  },
  []);
  return function (id: string, post: Partial<DecryptedPost>, cb?: () => void) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await _handleInput(id, post);
      cb();
    }, _timeout);
  };
}
