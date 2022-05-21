import {initListener} from "./crypto/decryption-worker";

export function sw() {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          {updateViaCache: "none"}
        );
        initListener();
        console.log("SW registered: ", registration);
      } catch (registrationError) {
        console.log("SW registration failed: ", registrationError);
      }
    });
  }
}
