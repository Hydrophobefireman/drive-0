import {css} from "catom";

import {FileListResponse} from "@/api-types/files";
import {dec} from "@/crypto/string_enc";
import {_util} from "@hydrophobefireman/kit";
import {Box} from "@hydrophobefireman/kit/container";
import {Select} from "@hydrophobefireman/kit/select";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

const sortOptions = [
  {value: "Newest"},
  {value: "Oldest"},
  {value: "A-Z"},
  {value: "Z-A"},
] as const;
export function Filter({
  files,
  setSortedFiles,
  accountKey,
}: {
  files: FileListResponse;
  setSortedFiles(x: FileListResponse): void;
  accountKey: string;
}) {
  const [sort, setSort] =
    useState<typeof sortOptions[number]["value"]>("Newest");
  useEffect(() => {
    const decr = dec(accountKey);
    _util.raf(() => {
      setSortedFiles(
        files
          ? {
              ...files,
              objects: files.objects.sort((x, y) => {
                switch (sort) {
                  case "A-Z":
                    return decr(x.customMetadata.upload.name).localeCompare(
                      decr(y.customMetadata.upload.name)
                    );
                  case "Z-A":
                    return -decr(x.customMetadata.upload.name).localeCompare(
                      decr(y.customMetadata.upload.name)
                    );
                  case "Newest":
                    return +new Date(y.uploaded) - +new Date(x.uploaded);
                  case "Oldest":
                    return +new Date(x.uploaded) - +new Date(y.uploaded);
                  default:
                    return 0;
                }
              }),
            }
          : files
      );
    });
  }, [sort, files]);
  return (
    <Box horizontal="right" class={css({margin: ".5rem"})}>
      <Select
        buttonClass={css({
          width: "100px",
          pseudo: {
            "> span": {
              flex: 1,
            },
          },
        })}
        label="Sort"
        options={sortOptions as any}
        setValue={setSort as any}
        value={sort}
      />
    </Box>
  );
}
