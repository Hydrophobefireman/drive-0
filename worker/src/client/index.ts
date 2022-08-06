import {GetObjectCommand, PutObjectCommand, S3} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

import {Env} from "../types";

export function createClient(env: Env) {
  return new S3({
    region: "auto",
    endpoint: `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_ACCESS_KEY_SECRET,
    },
  });
}

export function generateSignedURL(
  bucket: string,
  key: string,
  action: "get" | "put",
  client: S3
) {
  const args = {Bucket: bucket, Key: key};
  const command = {
    get: () => new GetObjectCommand(args),
    put: () => new PutObjectCommand(args),
  } as const;
  return getSignedUrl(client, command[action](), {expiresIn: 86_400});
}
