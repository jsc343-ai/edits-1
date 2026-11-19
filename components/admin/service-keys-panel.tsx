"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminHeaders } from "@/lib/admin-token";

type ServiceId = "resend" | "blob" | "neon" | "fal";
type Status = Record<ServiceId, { source: "env" | "saved" | "none"; hint: string }>;
type Diagnostic = {
  runtime: string;
  expected: { name: string; present: boolean }[];
  relatedNames: string[];
};

const SERVICES: { id: ServiceId; name: string; purpose: string; placeholder: string }[] = [
  { id: "resend", name: "Resend", purpose: "寄送郵箱驗證信", placeholder: "貼上以 re_ 開頭的金鑰" },
  { id: "blob", name: "Blob", purpose: "手機瀏覽器下載的暫存雲端", placeholder: "貼上以 vercel_blob_ 開頭的金鑰" },
  { id: "neon", name: "Neon", purpose: "資料庫（目前尚未使用）", placeholder: "貼上以 postgresql:// 開頭的連線網址" },
  { id: "fal", name: "Fal", purpose: "AI 3D 動態、換臉", placeholder: "貼上以 fal_sk_ 開頭的金鑰" },
];

const fetchStatus = (url: string) => fetch(url, { headers: adminHeaders() }).then((r) => r.json());

function ServiceRow({
  service,
  status,
  onChanged,
}: {
  service: (typeof SERVICES)[number];
  status: Status[ServiceId];
  onChanged: () => void;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function call(method: "POST" | "DELETE", body: Record<string, unknown>) {
    return fetch("/api/admin/service-keys", {
      method,
      headers: adminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ service: service.id, ...body }),
    });
  }

  async function save() {
    setBusy(true);
    setNote("");
    try {
      const res = await call("POST", { key: value });
      if (!res.ok) {
        setNote("格式不正確，請重新複製完整的內容。");
        return;
      }
      setValue("");
      setNote("已暫存。要永久使用，請同時放進專案的環境變數。");
      onChanged();
    } catch {
      setNote("儲存失敗，請稍後再試。");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await call("DELETE", {});
      setNote("已清除暫存。");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setNote("");
    try {
      const res = await call("POST", { test: true });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      setNote(`${data.ok ? "成功：" : "失敗："}${data.message ?? ""}`);
    } catch {
      setNote("連不到檢查服務，請稍後再試。");
    } finally {
      setBusy(false);
    }
  }

  const connected = status.source !== "none";
  const sourceText =
    status.source === "env"
      ? `已由專案環境變數提供（${status.hint}）`
      : status.source === "saved"
        ? `使用暫存金鑰（${status.hint}），重啟後會消失`
        : "尚未設定";

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
      <div className="flex items-start gap-2">
        {connected ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <CircleDashed className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">{service.name}</p>
          <p className="text-sm text-muted-foreground">{service.purpose}</p>
          <p className="text-sm">{sourceText}</p>
        </div>
      </div>
      <label htmlFor={`key-${service.id}`} className="sr-only">
        {service.name} 金鑰
      </label>
      <Input
        id={`key-${service.id}`}
        type="password"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={service.placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-11"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="h-11 flex-1" onClick={save} disabled={busy || value.trim().length < 8}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          暫存金鑰
        </Button>
        {service.id === "resend" ? (
          <Button type="button" variant="outline" className="h-11" onClick={test} disabled={busy || !connected}>
            測試金鑰
          </Button>
        ) : null}
        {status.source === "saved" ? (
          <Button type="button" variant="outline" className="h-11" onClick={remove} disabled={busy}>
            清除
          </Button>
        ) : null}
      </div>
      {note ? (
        <p role="status" className="text-sm text-muted-foreground">
          {note}
        </p>
      ) : null}
    </li>
  );
}

function EnvDiagnostic({ diagnostic }: { diagnostic: Diagnostic }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
      <h3 className="text-sm font-medium">環境變數診斷</h3>
      <p className="text-sm text-muted-foreground">
        目前這台伺服器的執行環境：{diagnostic.runtime}。只列出名稱，不會顯示任何金鑰。
      </p>
      <ul className="flex flex-col gap-1">
        {diagnostic.expected.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="font-mono">{item.name}</span>
            <span className={item.present ? "text-primary" : "text-destructive"}>
              {item.present ? "伺服器有讀到" : "伺服器讀不到"}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        伺服器看到的相關名稱：{diagnostic.relatedNames.length ? diagnostic.relatedNames.join("、") : "無"}
      </p>
    </div>
  );
}

export function ServiceKeysPanel() {
  const { data, mutate } = useSWR<Status & { error?: string; diagnostic?: Diagnostic }>(
    "/api/admin/service-keys",
    fetchStatus,
    { revalidateOnFocus: false },
  );

  if (!data || data.error) return null;

  return (
    <section aria-label="服務連線設定" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">服務連線設定</h2>
        <p className="text-sm text-muted-foreground">
          這裡可以查看四項服務是否已連上，也能先貼金鑰測試。在這裡貼的金鑰只存在伺服器記憶體，
          重啟或重新發布後會消失。要永久使用，請在專案的環境變數頁填寫，名稱分別是 RESEND_API_KEY、
          BLOB_READ_WRITE_TOKEN、DATABASE_URL、FAL_KEY。
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {SERVICES.map((s) => (
          <ServiceRow key={s.id} service={s} status={data[s.id]} onChanged={() => mutate()} />
        ))}
      </ul>
      {data.diagnostic ? <EnvDiagnostic diagnostic={data.diagnostic} /> : null}
    </section>
  );
}
