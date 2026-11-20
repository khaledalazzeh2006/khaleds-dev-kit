/** UTF-8 safe Base64 (handles Arabic, emoji...). */
export function base64Encode(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

export function base64Decode(b64: string): string {
  const clean = b64.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(padded);
  } catch (e) {
    throw new Error("Not valid Base64.", { cause: e });
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, " "));
  } catch (e) {
    throw new Error("Contains an invalid % escape.", { cause: e });
  }
}

export interface UrlParts {
  protocol: string;
  host: string;
  port: string;
  path: string;
  hash: string;
  params: [string, string][];
}

/** Split a URL into parts and decoded query parameters. Null if it isn't an absolute URL. */
export function parseUrl(text: string): UrlParts | null {
  try {
    const u = new URL(text.trim());
    return {
      protocol: u.protocol.replace(/:$/, ""),
      host: u.hostname,
      port: u.port,
      path: decodeURIComponent(u.pathname),
      hash: u.hash,
      params: [...u.searchParams.entries()],
    };
  } catch {
    return null;
  }
}
