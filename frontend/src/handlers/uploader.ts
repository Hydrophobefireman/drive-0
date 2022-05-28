import {PendingFileProps} from "@/api-types/PendingFileProps";
import {requests} from "@/util/bridge";
import {getUploadTokenRoute, uploadFileRoute} from "@/util/routes";
import {AbortableFetchResponse, get} from "@hydrophobefireman/flask-jwt-jskit";

export const FILE_UPLOAD_EVENT_KEY = "r2::file::upload";
export interface UploadTarget {
  file: File;
  fileData: PendingFileProps;
}
export type FileUploadEvent = CustomEvent<UploadTarget[]>;
export interface UploaderProps {
  file: Blob;
  completionCallback: Uploader["completionCallback"];
  progressHook: Uploader["progressHook"];
  user: string;
  onError: Uploader["onError"];
}

const ACCESS_TOKEN = "auth_tokens.access";
const REFRESH_TOKEN = "auth_tokens.refresh";

export function _headers(_tokens: {accessToken: string; refreshToken: string}) {
  return {
    Authorization: `Bearer ${_tokens.accessToken}`,
    "X-Refresh-Token": _tokens.refreshToken,
  };
}

export const getAuthenticationHeaders = async function () {
  const access = await get<string>(ACCESS_TOKEN);
  const refresh = await get<string>(REFRESH_TOKEN);
  return _headers({accessToken: access, refreshToken: refresh});
};
export class Uploader {
  private _fetch: AbortableFetchResponse<{}>;
  private file: Blob;
  private user: string;
  private completionCallback: (u: Uploader) => void;
  private progressHook: (completed: number, total: number) => void;
  private onError: (e: ProgressEvent<any>) => void;
  private resRequest: ProgressRequest;
  public beginCb: () => Promise<void>;
  cancel: () => void;
  constructor({
    file,
    completionCallback,
    progressHook,
    onError,
    user,
  }: UploaderProps) {
    this.file = file;
    this.completionCallback = completionCallback;
    this.progressHook = progressHook;
    this.user = user;
    this.onError = onError;
  }

  createBeginCb(metadata: Record<string, any>) {
    if (this.beginCb) return this.beginCb;
    this.beginCb = () => this.begin(metadata);
    return this.beginCb;
  }
  begin(metadata: Record<string, any>) {
    return new Promise<void>(async (resolve) => {
      this._fetch = requests.get<{token: string}>(
        getUploadTokenRoute(this.user)
      );
      try {
        const {data, error} = await (this._fetch
          .result as AbortableFetchResponse<{
          token: string;
        }>["result"]);
        if (error) {
          this.onError(error as any);
          resolve();
        }
        const {token} = data;

        const uploadUrl = uploadFileRoute(this.user, token, metadata.name);
        const authHeaders = await getAuthenticationHeaders();
        const headers = new Headers({
          "content-type": this.file.type,
          "x-upload-metadata": JSON.stringify(metadata),
          ...authHeaders,
        });
        this.resRequest = new ProgressRequest(uploadUrl, {
          onError: (e) => {
            this.onError(e);
            resolve(null);
          },
          onComplete: () => {
            this.completionCallback(this);
            resolve(null);
          },
          onProgress: (e) => this.progressHook(e.loaded, e.total),
        });
        this.resRequest.headers(headers);
        this.resRequest.send(this.file);
        this.cancel = () => {
          try {
            this._fetch.controller.abort();
            this.resRequest.abort();
          } catch (e) {
            console.warn(e);
          }
          this.onError(null);
          resolve();
        };
      } catch (e) {
        resolve();
      }
    });
  }
}
interface ProgressRequestProps {
  onProgress(e: ProgressEvent): void;
  onComplete(e: ProgressEvent): void;
  onError(e: ProgressEvent<any>): void;
}
class ProgressRequest {
  private xhr: XMLHttpRequest;

  constructor(private url: string, private options: ProgressRequestProps) {
    const {onComplete, onProgress, onError} = options;
    this.xhr = new XMLHttpRequest();
    this.xhr.open("POST", this.url);
    this.xhr.upload.onprogress = onProgress;
    this.xhr.onload = onComplete;
    this.xhr.onerror = onError;
  }
  headers(h: Headers) {
    for (const [key, val] of h) {
      this.xhr.setRequestHeader(key, val);
    }
  }
  send(body: XMLHttpRequestBodyInit) {
    if (false) {
      let i = setInterval(() => {
        const b = body as Blob;

        this.options.onProgress({
          loaded: Math.floor(Math.random() * b.size),
          total: b.size,
        } as any);
        clearInterval(i);
      }, 1000);
      return;
    }
    this.xhr.send(body);
  }
  abort() {
    this.xhr.abort();
  }
}
