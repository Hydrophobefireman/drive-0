import {DecryptedPost, PostContent} from "@/api-types/post";
import {get, set} from "@hydrophobefireman/flask-jwt-jskit";

export const pswKey = "client.auth.user.pass";
export const authStateKey = "client.auth.user.info";
export const postsKey = "client.posts";

export async function getPasswd(): Promise<string> {
  return await get(pswKey);
}
export async function setPasswrd(val: string) {
  return await set(pswKey, val);
}

export async function getLocalPosts(): Promise<Record<string, DecryptedPost>> {
  return (await get(postsKey)) || {};
}
export async function setLocalPosts(
  v: Record<string, DecryptedPost>
): Promise<void> {
  return set(postsKey, v);
}
