"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { Button } from "@/components/ui/button";

export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useApp();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        <Button asChild variant="ghost" size="icon" className="size-11 shrink-0">
          <Link href="/" aria-label={t("back")}>
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        </Button>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs text-muted-foreground">{t("appName")}</span>
          <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
        </div>
      </header>
      <main className="flex flex-col gap-4 px-4 pb-16 pt-5">{children}</main>
    </div>
  );
}
