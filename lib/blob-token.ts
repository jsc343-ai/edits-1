import { getBlobToken } from "@/lib/server/service-keys";

// Covers the default BLOB_READ_WRITE_TOKEN, a custom-prefixed `<PREFIX>_READ_WRITE_TOKEN`,
// and a token an admin saved in the back office.
export function findBlobToken(): string | undefined {
  return getBlobToken() || undefined;
}
