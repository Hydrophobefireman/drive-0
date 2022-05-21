import {set} from "statedrive";

import {DecryptedPost, DecryptedPostMetadata} from "@/api-types/post";
import {postMetadataStore} from "@/store/posts";
import {time} from "@/util/time";
import {set as idbset} from "@hydrophobefireman/flask-jwt-jskit";

import {getLocalPosts, postsKey} from "./keys";

export const PENDING_POST_KEY_PREFIX = "journo:new:";
function random() {
  if (window.crypto) {
    if ("randomUUID" in crypto)
      return `${PENDING_POST_KEY_PREFIX + crypto.randomUUID()}`;

    return `${PENDING_POST_KEY_PREFIX}${crypto
      .getRandomValues(new Uint8Array(10))
      .join("-")}`;
  }
  return `${PENDING_POST_KEY_PREFIX}${Math.random()
    .toString(32)
    .replace("0.", "mr-")}`;
}

/**
 *
 * create a post that will be uploaded later sometime
 */
export function createPendingPost(
  user: string,
  content: string,
  title: string
): DecryptedPost {
  return {
    id_: random(),
    created_at: time(),
    user,
    content,
    flags: {is_new: true, is_pending: false},
    title,
    updated_at: time(),
  };
}

export function createPostMetadata(localPosts: Record<string, DecryptedPost>) {
  const onlyMeta: Record<string, DecryptedPostMetadata> = {};
  for (const k in localPosts) {
    const {content, ...rest} = localPosts[k];
    onlyMeta[k] = rest;
  }
  return onlyMeta;
}

export async function patchPost(post: DecryptedPost) {
  const localPosts = await getLocalPosts();
  const meta = createPostMetadata(localPosts);
  const {id_} = post;
  const {content, ...rest} = post;
  meta[id_] = rest;
  localPosts[id_] = post;
  set(postMetadataStore, {posts: {...meta}, isLoaded: true});
  await idbset(postsKey, localPosts);
}
