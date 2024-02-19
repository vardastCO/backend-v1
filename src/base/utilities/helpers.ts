import * as crypto from "crypto";

export function generateSecureRandomNumberString(length) {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  return randomBytes
    .readUIntBE(0, Math.ceil(length / 2))
    .toString()
    .slice(0, length);
}

export function filterObject(obj: object): object {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}
