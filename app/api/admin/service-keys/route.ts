import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import {
  SERVICE_IDS,
  clearServiceKey,
  getResendKey,
  saveServiceKey,
  serviceHint,
  serviceSource,
  validateServiceKey,
  type ServiceId,
} from "@/lib/server/service-keys";

function statusAll() {
  return Object.fromEntries(
    SERVICE_IDS.map((id) => [id, { source: serviceSource(id), hint: serviceHint(id) }]),
  );
}

function asService(value: unknown): ServiceId | null {
  return typeof value === "string" && (SERVICE_IDS as string[]).includes(value) ? (value as ServiceId) : null;
}

async function guard(req: Request) {
  return (await isAdmin(req).catch(() => false)) ? null : NextResponse.json({ error: "forbidden" }, { status: 403 });
}

const EXPECTED_ENV_NAMES = ["RESEND_API_KEY", "BLOB_READ_WRITE_TOKEN", "DATABASE_URL", "FAL_KEY"];
const RELATED_PATTERN = /RESEND|BLOB|DATABASE|NEON|POSTGRES|FAL/i;

function envDiagnostic() {
  return {
    runtime: process.env.VERCEL_ENV ?? "unknown",
    expected: EXPECTED_ENV_NAMES.map((name) => ({ name, present: Boolean(process.env[name]?.trim()) })),
    relatedNames: Object.keys(process.env)
      .filter((name) => RELATED_PATTERN.test(name))
      .sort(),
  };
}

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  return NextResponse.json({ ...statusAll(), diagnostic: envDiagnostic() });
}

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { service?: unknown; key?: unknown; test?: unknown };
  const service = asService(body.service);
  if (!service) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (body.test === true) {
    if (service !== "resend") return NextResponse.json({ ok: false, message: "此項目沒有線上測試，請改用實際功能測試。" });
    const key = getResendKey();
    if (!key) return NextResponse.json({ ok: false, message: "還沒有 Resend 金鑰。" });
    try {
      const res = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${key}` } });
      if (res.ok) return NextResponse.json({ ok: true, message: "Resend 金鑰有效。" });
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({ ok: false, message: "Resend 金鑰無效或權限不足，請確認是否為完整的金鑰。" });
      }
      return NextResponse.json({ ok: false, message: `Resend 回應異常（${res.status}）。` });
    } catch {
      return NextResponse.json({ ok: false, message: "連不到 Resend，請稍後再試。" });
    }
  }

  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!validateServiceKey(service, key)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  saveServiceKey(service, key);
  return NextResponse.json(statusAll());
}

export async function DELETE(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { service?: unknown };
  const service = asService(body.service);
  if (!service) return NextResponse.json({ error: "invalid" }, { status: 400 });
  clearServiceKey(service);
  return NextResponse.json(statusAll());
}

export const dynamic = "force-dynamic";
