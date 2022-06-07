import {FileListResponse} from "@/api-types/files";
import {rangeObj} from "@/util/range";
import {loadURL, useEffect, useRef, useState} from "@hydrophobefireman/ui-lib";

export function useFileListSelection(files: FileListResponse) {
  const [selectedIndices, setSelectedIndices] = useState<
    Record<number, boolean>
  >({});
  const prevClicked = useRef<number>();
  function clearSelection() {
    prevClicked.current = null;
    setSelectedIndices({});
  }
  const [file, setFile] = useState<{
    selectedFile: FileListResponse["objects"][0];
    selectedFileIndex: number;
  }>({selectedFile: null, selectedFileIndex: null});
  useEffect(() => {
    clearSelection();
  }, [files]);
  function delegateClick(e: MouseEvent) {
    const {current} = prevClicked;
    const i = +(e.currentTarget as any).dataset.index;
    prevClicked.current = i;
    if (!(e.shiftKey || e.ctrlKey)) {
      setSelectedIndices({});
      setFile({selectedFile: files.objects[i], selectedFileIndex: i});
      return;
    }
    if (current != null /* can be 0 */) {
      if (e.shiftKey) {
        setSelectedIndices((curr) => ({
          ...curr,
          ...(current > i ? rangeObj(i, current) : rangeObj(current, i)),
        }));
        return true;
      }
      if (e.ctrlKey) {
        setSelectedIndices((curr) => {
          return {...curr, [i]: !curr[i]};
        });
        return true;
      }
    } else {
      setSelectedIndices({[i]: true});
      return true;
    }
    return false;
  }

  return {
    selectedIndices,
    clearSelection,
    delegateClick,
    openNextFile() {
      const curr = file?.selectedFileIndex;
      if (file && curr < files.objects.length - 1) {
        const next = curr + 1;
        setSelectedIndices({});
        setFile({
          selectedFile: files.objects[next],
          selectedFileIndex: next,
        });
      }
    },
    openPreviousFile() {
      const curr = file?.selectedFileIndex;
      if (file && curr > 0) {
        setSelectedIndices({});
        const next = curr - 1;
        setFile({
          selectedFile: files.objects[next],
          selectedFileIndex: next,
        });
      }
    },
    file,
    closeFile() {
      setFile({selectedFile: null, selectedFileIndex: null});
    },
  };
}
