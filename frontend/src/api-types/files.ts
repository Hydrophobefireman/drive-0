export interface PreviewMetadata {
  id: string;
  meta: string;
  // hash?: string;
  // thumbData: string;
}
export interface UploadCustomMetadata {
  enc: string;
  name: string;
  preview?: PreviewMetadata;
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
