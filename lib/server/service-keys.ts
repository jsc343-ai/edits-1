import { clearSavedFalKey, falKeyHint, falKeySource, saveFalKey } from "@/lib/server/fal-key";

export type ServiceId = "resend" | "blob" | "neon" | "fal";
export type KeySource = "env" | "saved" | "none";

export const SERVICE_IDS: ServiceId[] = ["resend", "blob", "neon", "fal"];

const g = globalThis as unknown as { __jscServiceKeys?: Partial<Record<ServiceId, string>> };
const saved = (g.__jscServiceKeys ??= {});

function envValue(service: ServiceId): string {
  switch (service) {
    case "resend":
      return process.env.RESEND_API_KEY || "";
    case "blob": {
      if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
      const name = Object.keys(process.env).find((k) => k.endsWith("_READ_WRITE_TOKEN") && process.env[k]);
      return name ? process.env[name] || "" : "";
    }
    case "neon":
      return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
    case "fal":
      return process.env.FAL_KEY || "";
  }
}

export function getServiceKey(service: ServiceId): string {
  if (service === "fal") return process.env.FAL_KEY || saved.fal || "";
  return envValue(service) || saved[service] || "";
}

export function getResendKey(): string {
  return getServiceKey("resend");
}

export function getBlobToken(): string {
  return getServiceKey("blob");
}

export function serviceSource(service: ServiceId): KeySource {
  if (service === "fal") return falKeySource();
  if (envValue(service)) return "env";
  if (saved[service]) return "saved";
  return "none";
}

export function serviceHint(service: ServiceId): string {
  if (service === "fal") return falKeyHint();
  const key = getServiceKey(service);
  return key ? `…${key.slice(-4)}` : "";
}

export function validateServiceKey(service: ServiceId, value: string): boolean {
  if (value.length < 8 || value.length > 600 || /\s/.test(value)) return false;
  switch (service) {
    case "resend":
      return value.startsWith("re_");
    case "blob":
      return value.includes("_");
    case "neon":
      return /^postgres(ql)?:\/\//.test(value);
    case "fal":
      return value.length >= 20 && value.length <= 200;
  }
}

export function saveServiceKey(service: ServiceId, value: string): void {
  if (service === "fal") {
    saveFalKey(value);
    return;
  }
  saved[service] = value;
}

export function clearServiceKey(service: ServiceId): void {
  if (service === "fal") {
    clearSavedFalKey();
    return;
  }
  delete saved[service];
}
