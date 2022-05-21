export interface Post {
  id_: string;
  user: string;
  created_at: number;
  updated_at: number;
  flags: {
    is_new?: boolean;
    is_pending?: boolean;
    is_pending_deletion?: boolean;
  };
  _secure_: {
    meta_data: string;
  };
}
export interface PostContent extends Post {
  _secure_: {
    meta_data: string;
    content: string;
  };
}

export interface DecryptedPost extends Omit<Post, "_secure_"> {
  content: string;
  title: string;
}

export interface DecryptedPostMetadata extends Omit<DecryptedPost, "content"> {}
