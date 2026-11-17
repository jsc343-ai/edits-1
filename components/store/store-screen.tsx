"use client";

import { useState } from "react";
import { Box, Gem, Orbit } from "lucide-react";
import { toast } from "sonner";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { usePurchase } from "@/lib/pi-payment";
import { useApp, postJson } from "@/lib/app-state";
import { GROUPS, STORE_MODULES, priceInPi, type StoreKind } from "@/lib/store-catalog";
import { PageShell } from "@/components/page-shell";
import { StorePanel } from "@/components/store-panel";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function StoreScreen() {
  const { t, lang, uid, username } = useApp();
  const zh = lang.startsWith("zh");
  const { products } = usePiAuth();
  const { makePurchase } = usePurchase();
  const [kind, setKind] = useState<StoreKind>("static3d");
  const [busy, setBusy] = useState<string | null>(null);

  const tabs: { id: StoreKind; icon: typeof Box; label: string; hint: string }[] = [
    { id: "static3d", icon: Box, label: zh ? "靜態 3D 立體" : "Static 3D", hint: zh ? "單張立體造型" : "Single 3D looks" },
    { id: "dynamic3d", icon: Orbit, label: zh ? "動態 AI 3D" : "Dynamic AI 3D", hint: zh ? "會動的 3D 影片" : "Animated 3D clips" },
  ];

  const listed = new Map((products ?? []).filter((p) => p.is_active).map((p) => [p.id, p]));

  async function buy(slug: string) {
    setBusy(slug);
    try {
      const result = await makePurchase(slug);
      postJson("/api/payments", {
        uid,
        username,
        productId: result.productId,
        paymentId: result.paymentId,
        txid: result.txid,
      }).catch(() => {});
      toast.success(t("purchaseOk"));
    } catch (e) {
      const message = e instanceof Error ? e.message.toLowerCase() : "";
      toast.error(message.includes("cancel") ? t("purchaseCancel") : t("purchaseFail"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <PageShell title={zh ? "模組商店" : "Module store"}>
      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
        {zh
          ? "挑選需要的模組另外付費套用，價格以 Pi 計算，依 AI 生成成本加成。"
          : "Pick the modules you need and pay separately. Prices are in Pi, based on AI generation cost plus a markup."}
      </p>

      <div role="tablist" aria-label={zh ? "模組類型" : "Module type"} className="grid grid-cols-2 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={kind === tab.id}
            onClick={() => setKind(tab.id)}
            className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors ${
              kind === tab.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            <tab.icon className="size-6" aria-hidden="true" />
            <span className="font-semibold">{tab.label}</span>
            <span className="text-sm opacity-80">{tab.hint}</span>
          </button>
        ))}
      </div>

      {GROUPS.map((g) => {
        const items = STORE_MODULES.filter((m) => m.kind === kind && m.group === g.id);
        return (
          <section key={g.id} aria-label={zh ? g.zh : g.en} className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">{zh ? g.zh : g.en}</h2>
            <ul className="grid grid-cols-2 gap-3">
              {items.map((m) => {
                const onSale = listed.has(m.slug);
                return (
                  <li key={m.slug} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
                    <p className="font-medium">{zh ? m.zh : m.en}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Gem className="size-4 text-accent" aria-hidden="true" />
                      {priceInPi(m.kind)} Pi
                    </p>
                    <Button
                      onClick={() => buy(m.slug)}
                      disabled={!onSale || busy !== null}
                      variant={onSale ? "default" : "secondary"}
                      className="h-11"
                    >
                      {busy === m.slug ? <Spinner /> : null}
                      {onSale ? t("buy") : zh ? "即將上架" : "Coming soon"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <StorePanel />
    </PageShell>
  );
}
