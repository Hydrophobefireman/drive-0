import {set} from "statedrive";

import {DecryptedPost, DecryptedPostMetadata, Post} from "@/api-types/post";
import {getLocalPosts, getPasswd, setLocalPosts} from "@/caching/keys";
import {createPostMetadata} from "@/caching/pending-posts";
import {decrypt} from "@/crypto/decrypt";
import {encrypt} from "@/crypto/encrypt";
import {dec, enc} from "@/crypto/string_enc";
import {postMetadataStore} from "@/store/posts";
import {requests} from "@/util/bridge";
import {
  createPostRoute,
  deletePostRoute,
  getPostsRoute,
  postContentRoute,
  updatePostRoute,
} from "@/util/routes";
import {time} from "@/util/time";
import {redirect} from "@hydrophobefireman/ui-lib";

const textDecoder = new TextDecoder();
export function postFetcher() {
  const {result, controller, headers} = requests.get<{posts: Post[]}>(
    getPostsRoute
  );
  return {
    controller,
    headers,
    result: result.then(async ({data, error}) => {
      const pass = await getPasswd();
      const decr = dec(pass);
      if (error)
        return {data: null as Record<string, DecryptedPostMetadata>, error};
      return {
        data: data.posts
          .map((x) => {
            const parsed = JSON.parse(x._secure_.meta_data);
            return {
              created_at: x.created_at,
              flags: {is_new: false, is_pending: false},
              id_: x.id_,
              title: decr(parsed.title),
              updated_at: +decr(parsed.updated_at),
              user: x.user,
            } as DecryptedPostMetadata;
          })
          .reduce((acc, prev) => {
            acc[prev.id_] = prev;
            return acc;
          }, {} as Record<string, DecryptedPostMetadata>),
      };
    }),
  };
}
export function fetchPostContent(id: string) {
  const {controller, headers, result} = requests.getBinary(
    postContentRoute(id)
  );
  return {
    controller,
    headers,
    result: result.then(async (val) => {
      if ("error" in val || !(val instanceof ArrayBuffer))
        throw new Error(val.error);
      const pass = await getPasswd();
      return textDecoder.decode(
        await decrypt(
          {
            encryptedBuf: val,
            meta: (await headers).get("x-meta-data"),
          },
          pass
        )
      );
    }),
  };
}

async function encryptLocalPost(post: DecryptedPost) {
  const pass = await getPasswd();
  const efn = enc(pass);
  const encryptedTitle = efn(post.title);
  return await encrypt(encoder.encode(post.content), pass, {
    title: encryptedTitle,
    updated_at: efn(post.updated_at.toString()),
  });
}
export async function createPost(post: DecryptedPost) {
  const {encryptedBuf, meta} = await encryptLocalPost(post);
  return await requests.postBinary<Post>(createPostRoute, encryptedBuf, {
    "x-meta-data": meta,
  }).result;
}

export async function deletePost(id: string) {
  const localPosts = await getLocalPosts();
  if (!(id in localPosts)) {
    throw new Error(`${id} : does not exist`);
  }
  localPosts[id] = {
    id_: id,
    content: null,
    created_at: 0,
    title: null,
    user: null,
    updated_at: time(),
    flags: {is_pending_deletion: true},
  };
  await setLocalPosts(localPosts);
  set(postMetadataStore, {
    isLoaded: true,
    posts: createPostMetadata(localPosts),
  });
}
export function apiDelete(id: string) {
  return requests.del(deletePostRoute(id));
}
// export function __getAllPosts() {
//   const ret = requests.get<{posts: PostContent[]}>(getAllPostsRoute);
//   const {controller, headers, result} = ret;
//   return {
//     controller,
//     headers,
//     result: result.then(async ({data, error}) => {
//       const pass = await getPasswd();
//       if (error) return {data: null as Record<string, DecryptedPost>, error};
//       return {
//         data: (
//           await Promise.all(
//             data.posts.map(async (post): Promise<DecryptedPost> => {
//               const binary = await base64ToArrayBuffer(post._secure_.content);
//               const decrypted = await decrypt(
//                 {encryptedBuf: binary, meta: post._secure_.meta_data},
//                 pass
//               );
//               const title = JSON.parse(post._secure_.meta_data).title;

//               return {
//                 id_: post.id_,
//                 created_at: post.created_at,
//                 flags: {is_new: false, is_pending: false},

//                 content: textDecoder.decode(decrypted),
//                 title: title ? dec(pass)(title) : "",

//                 updated_at: post.updated_at,
//                 user: post.user,
//               };
//             })
//           )
//         ).reduce((acc, prev) => {
//           acc[prev.id_] = prev;
//           return acc;
//         }, {} as Record<string, DecryptedPost>),
//       };
//     }),
//   };
// }
const encoder = new TextEncoder();
export async function updatePost(post: DecryptedPost) {
  const {encryptedBuf, meta} = await encryptLocalPost(post);
  return await requests.postBinary<Post>(
    updatePostRoute(post.id_),
    encryptedBuf,
    {
      "x-meta-data": meta,
    }
  ).result;
}
