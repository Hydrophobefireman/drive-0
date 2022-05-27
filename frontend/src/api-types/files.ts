export interface UploadCustomMetadata {
  enc: string;
  name: string;
}
export interface FileListResponse {
  objects: Array<{
    customMetadata: {upload: UploadCustomMetadata};
    httpMetadata: {contentType: string};
    uploaded: string;
    httpEtag: string;
    etag: string;
    size: number;
    version: string;
    key: string;
  }>;
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}
