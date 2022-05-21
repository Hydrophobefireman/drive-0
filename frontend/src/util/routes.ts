const BASE = location.href.includes("localhost")
  ? "http://localhost:5000"
  : "https://journo-api.herokuapp.com";

function getURL(path: string) {
  return new URL(path, BASE).href;
}

export const loginRoute = getURL("/users/-/login");
export const registerRoute = getURL("/users/-/register");
export const refreshTokenRoute = getURL("/users/-/token/refresh");
export const initialAuthCheckRoute = getURL("/users/-/me");

export const getPostsRoute = getURL("/posts/");
export const getAllPostsRoute = getURL("/posts/all");
export const createPostRoute = getPostsRoute;
export const updatePostRoute = (id: string) => getURL(`/posts/${id}`);
export const deletePostRoute = updatePostRoute;
export const postContentRoute = updatePostRoute;
export const uploadRoute = getURL("/uploads");
export const uploadMetaRoute = (x: string) => {
  const u = new URL(getURL("/uploads/meta-data"));
  u.searchParams.set("url", x);
  return u.href;
};
