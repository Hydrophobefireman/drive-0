/// <reference lib="WebWorker" />
/// <reference lib="scripthost" />

/**
 *
 * @param {FetchEvent} event
 */
function fetchListener(event) {
  const {request} = event;
  const {url} = request;
  const U = new URL(url);
  if (event.clientId)
    if (U.pathname.includes("/_/decrypt")) {
      event.respondWith(
        (async () => {
          const url = U.searchParams.get("url");
          const client = await clients.get(event.clientId);
          const {decryptedImage, ct} = await decryptImage(url, client);
          return new Response(decryptedImage, {headers: {"content-type": ct}});
        })()
      );
    }
}
self.addEventListener("fetch", fetchListener);

/**
 * @type {Map<string,()=>void>}
 */
const listenerMap = new Map();
/**
 *
 * @param {MessageEvent} param0
 */
function baseListener({data}) {
  const {code} = data || {};
  if (!code) return;
  const listener = listenerMap.get(code);
  if (listener) {
    listener({data});
  }
}
self.addEventListener("message", baseListener);
let id = 0;
/**
 *
 * @param {string} url
 * @param {client} client
 * @returns {Promise<ArrayBuffer>}
 */

function decryptImage(url, client) {
  return new Promise(async (resolve) => {
    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();
    const code = `decryption-job:${id}:${Math.random()}`;

    const listener = async (ev) => {
      listenerMap.delete(code);
      return resolve({decryptedImage: ev.data.decryptedBuffer, ct: ev.data.ct});
    };
    listenerMap.set(code, listener);
    client.postMessage({code, buffer, url, type: "decryption-job"}, [buffer]);
  }).catch(() => ({ct: "", decryptImage: new ArrayBuffer(0)}));
}
