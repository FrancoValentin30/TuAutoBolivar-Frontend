import { headers } from "next/headers";

export function getOrigin() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) throw new Error("No host header");
  return `${proto}://${host}`;
}
