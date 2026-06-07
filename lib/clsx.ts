/** Tiny className joiner (avoids pulling in a dependency). */
export function clsx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
