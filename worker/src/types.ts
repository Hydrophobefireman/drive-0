export interface Env {
  B_GALLERY: R2Bucket;
  B_PREVIEWS: R2Bucket;
  CHECK: "yes" | "no";
  AUTH: KVNamespace;
  JWT_SIGNING_KEY: string;
}

export interface UserType {
  user: string;
  account_key_hash: string;
  created_at: number;
  is_approved: boolean;
  // used for destroying refresh tokens
  // if the user wants the account to be logged out
  // they can request us to change the integrity and their
  // refresh tokens will be invalidated
  _integrity: string;
}
