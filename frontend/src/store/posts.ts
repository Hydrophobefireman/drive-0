import {createState} from "statedrive";

import {DecryptedPostMetadata} from "@/api-types/post";

export const postMetadataStore = createState<{
  posts: Record<string, DecryptedPostMetadata>;
  isLoaded: boolean;
}>({name: "posts"});

export const serverSyncTimeStampStore = createState<number>({
  name: "serverSyncTimeStamp",
});
