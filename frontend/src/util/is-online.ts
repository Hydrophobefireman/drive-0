const HAS_NAVIGATOR_ONLINE = "onLine" in navigator;
export async function isOnline() {
  let isOnline = false;
  if (!HAS_NAVIGATOR_ONLINE || navigator.onLine) {
    try {
      await fetch("/check-sw");
      isOnline = true;
    } catch (e) {
      // still offline
      isOnline = false;
    }
  }
  return isOnline;
}
