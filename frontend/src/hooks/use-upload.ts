import {User} from "@/api-types/user";
import {encrypt} from "@/crypto/encrypt";
import {enc} from "@/crypto/string_enc";
import {UploadTarget, Uploader} from "@/handlers/uploader";
import {blobToArrayBuffer} from "@hydrophobefireman/j-utils";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {useEffect, useRef, useState} from "@hydrophobefireman/ui-lib";

class TaskQueue<T extends () => Promise<void>> {
  tasks: T[] = [];
  isWorking = false;
  async start() {
    if (this.isWorking) return;
    if (!this.tasks.length) return;
    this.isWorking = true;
    while (this.tasks.length) {
      await this.tasks.pop()();
    }
    this.isWorking = false;
    this.start();
  }
  push(task: T) {
    this.tasks.push(task);
    if (!this.isWorking) {
      this.start();
    }
  }
}
const queue = new TaskQueue();
export function useUpload(
  target: UploadTarget,
  user: User,
  accountKey: string,
  onFinish: () => void
) {
  const [status, setStatus] = useState<
    "in-progress" | "finished" | "errored" | "encrypting"
  >("in-progress");
  const [progress, setProgress] = useState<number>();

  const uploaderRef = useRef<Uploader>();
  const {show} = useAlerts();
  function onError() {
    show({content: `Failed upload for ${target.fileData.name}`});
  }

  useEffect(async () => {
    setProgress(0);
    setStatus("in-progress");
    function completionCallback() {
      setStatus("finished");
      onFinish();
    }
    function progressHook(completed: number, total: number) {
      setProgress(completed / total);
    }
    let metadata: Record<string, any>;
    if (target.fileData.shouldEncrypt) {
      setStatus("encrypting");
      try {
        const encr = enc(accountKey);
        const res = await encrypt(
          await blobToArrayBuffer(target.file),
          accountKey,
          {
            type: encr(target.file.type),
            tags: encr(JSON.stringify(target.fileData.tags)),
          }
        );
        const bin = new Blob([res.encryptedBuf], {
          type: "application/octet-stream",
        });
        uploaderRef.current = new Uploader({
          file: bin,
          completionCallback,
          progressHook,
          user: user.user,
          onError,
          originalFile: target.file,
        });
        metadata = {enc: res.meta, name: target.fileData.name};
      } catch (e) {
        setStatus("errored");
        return;
      }
    } else {
      uploaderRef.current = new Uploader({
        file: target.file,
        completionCallback,
        progressHook,
        user: user.user,
        onError,
      });
      metadata = {enc: null, name: target.fileData.name};
    }
    setStatus("in-progress");
    queue.push(uploaderRef.current.createBeginCb(metadata));
  }, [target.file]);
  return {status, progress, uploader: uploaderRef};
}
