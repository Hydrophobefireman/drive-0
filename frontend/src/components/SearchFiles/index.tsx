import {css} from "catom";

import {FileListResponse} from "@/api-types/files";
import {includes} from "@/util/clean";
import {_util} from "@hydrophobefireman/kit";
import {Box} from "@hydrophobefireman/kit/container";
import {Input} from "@hydrophobefireman/kit/input";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

export function Search({
  resp,
  setFiltered,
}: {
  resp: FileListResponse;
  setFiltered(a: FileListResponse): void;
}) {
  const [search, setSearch] = useState("");
  const filterResults = (e?: string) => {
    if (resp && resp.objects) {
      const clone = {...resp};
      clone.objects = resp.objects.filter(
        (x) => !e || includes(x.customMetadata.upload.name, e || search)
      );
      setFiltered(clone);
    }
  };
  function handleInput(e: string) {
    setSearch(e);
    _util.raf(() => _util.raf(() => filterResults(e)));
  }
  useEffect(() => {
    filterResults();
  }, [resp]);
  return (
    <Box
      class={css({
        marginTop: "1rem",
        //@ts-ignore
        "--kit-label-jump": "-115%",
      })}
    >
      <Input
        variant="material"
        value={search}
        setValue={handleInput}
        label="Search"
      />
    </Box>
  );
}
