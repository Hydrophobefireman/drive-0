export class Thumbnail {
  private type: "image" | "video";
  private url: string | null;
  constructor(private file: Blob, private width = 100, private height = 100) {
    const type: "image" | "video" | "unknown" = file.type.includes("image")
      ? "image"
      : file.type.includes("video")
      ? "video"
      : "unknown";
    if (type === "unknown") {
      throw new Error("Invalid blob");
    }
    this.url = null;
    this.type = type;
  }
  private _createObjectURL() {
    const url = URL.createObjectURL(this.file);
    this.url = url;
    return url;
  }
  private _canvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    if (ctx == null) throw new Error("");
    return {ctx, canvas};
  }
  private _fromImage() {
    const img = new Image();
    const prom = new Promise<Blob>((resolve, reject) => {
      img.onload = () => {
        const {ctx, canvas} = this._canvas();
        const imgAspect = img.naturalHeight / img.naturalWidth;
        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height || imgAspect * canvas.width
        );
        canvas.toBlob((b) => {
          if (b == null) return reject(null);
          resolve(b);
        }, "image/png");
      };
      img.onerror = () => {
        reject(null);
      };
    });
    img.src = this._createObjectURL();
    return prom;
  }
  _getRandomVideoFrame(video: HTMLVideoElement) {
    return new Promise<number>((resolve) => {
      video.addEventListener(
        "loadeddata",
        () => {
          resolve(Math.floor(Math.random() * Math.floor(video.duration)));
        },
        false
      );
    });
  }
  private async _fromVideo() {
    const video = document.createElement("video");
    const prom = new Promise<Blob>((resolve, reject) => {
      video.addEventListener("loadedmetadata", async () => {
        const frame = await this._getRandomVideoFrame(video);
        const seekedPromise = new Promise((resolve) =>
          video.addEventListener("seeked", resolve, {once: true})
        );
        video.currentTime = frame;
        await seekedPromise;
        const {canvas, ctx} = this._canvas();
        const aspect = video.videoHeight / video.videoWidth;
        ctx.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height || canvas.width * aspect
        );
        canvas.toBlob((b) => {
          if (b == null) return reject(null);
          resolve(b);
        }, "image/png");
      });
    });
    video.src = this._createObjectURL();
    return prom;
  }
  private collectGarbage() {
    if (!this.url) return;
    URL.revokeObjectURL(this.url);
  }
  async generate() {
    if (this.type === "image") {
      const ret = await this._fromImage();
      this.collectGarbage();
      return ret;
    }
    const ret = await this._fromVideo();
    this.collectGarbage();
    return ret;
  }
}
