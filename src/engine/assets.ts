/** Checks which optional files (photo, screenshots, resume) actually exist, so the scenes can adapt. */
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const url = (path: string) => (path.startsWith("http") ? path : base + path);

const cache = new Map<string, boolean>();

/** Resolves true when the image loads (or the file answers 200 for non-images). Times out quickly. */
export function probe(path: string, timeoutMs = 1500): Promise<boolean> {
  if (!path) return Promise.resolve(false);
  const hit = cache.get(path);
  if (hit !== undefined) return Promise.resolve(hit);
  const done = (ok: boolean) => { cache.set(path, ok); return ok; };
  const isImage = /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(path);
  const p: Promise<boolean> = isImage
    ? new Promise((res) => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = url(path); })
    : fetch(url(path), { method: "HEAD" }).then((r) => r.ok && !/text\/html/.test(r.headers.get("content-type") || ""), () => false);
  const timeout = new Promise<boolean>((res) => setTimeout(() => res(false), timeoutMs));
  return Promise.race([p, timeout]).then(done);
}

export const exists = (path: string) => cache.get(path) === true;
