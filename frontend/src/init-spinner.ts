import("@hydrophobefireman/qwc").then(({init}) =>
  init({
    "loading-spinner": {
      observedAttributes: [
        {
          prop: "display",
          listener(_: string, nv: string) {
            const style = this.shadowRoot.querySelector(".spinner").style;
            style.display = nv;
          },
        },
        {
          prop: "size",
          listener(_: string, nv: string) {
            const h = nv ? `${nv}${nv.includes("px") ? "" : "px"}` : "50px";
            const style = this.shadowRoot.querySelector(".spinner").style;
            style.height = style.width = h;
          },
        },
      ],
    },
  })
);
