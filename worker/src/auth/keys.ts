function buf2hex(ui: Uint16Array) {
  return [...ui].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function generateKey() {
  return buf2hex(crypto.getRandomValues(new Uint16Array(32)));
}

const encoder = new TextEncoder();
export async function hash(str: string) {
  return buf2hex(
    new Uint16Array(
      await crypto.subtle.digest({name: "sha-512"}, encoder.encode(str))
    )
  );
}
