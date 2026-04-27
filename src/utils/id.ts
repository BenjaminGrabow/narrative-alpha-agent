import { createHash } from "node:crypto";

export const stableId = (prefix: string, input: string): string => {
  const hash = createHash("sha256").update(input).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
};
