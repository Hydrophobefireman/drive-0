const BASE = location.href.includes("localhost")
  ? "http://localhost:8787"
  : "https://r2-cdn.hpfm.dev/";

function getURL(path: string) {
  return new URL(path, BASE).href;
}

export const loginRoute = getURL("/api/-/auth/login");
export const registerRoute = getURL("/api/-/auth/register");
export const revokeTokenRoute = getURL("/api/-/auth/revoke-token");
export const refreshTokenRoute = getURL("/api/-/auth/refresh");
export const initialAuthCheckRoute = getURL("/api/-/auth/me");

export const listFilesRoute = (u: string) => getURL(`/api/user/${u}/list`);
export const getUploadTokenRoute = (u: string) =>
  getURL(`/api/user/${u}/upload-token`);

export const getFileBinaryRoute = (
  user: string,
  key: string,
  filename: string
) => getURL(`/o/${user}/${key}/${filename}`);
export const getFileFromKeyRoute = (k: string) => getURL(`/o/${k}`);
export const uploadFileRoute = getFileBinaryRoute;

export const deleteFileRoute = (user: string) =>
  getURL(`/o/${user}/batch-delete`);

export const uploadImagePreviewRoute = getURL("/o/-/image-previews");
export const imagePreviewDownloadRoute = (u: string, id: string) =>
  getURL(`/o/-/image-previews/${u}/${id}`);
