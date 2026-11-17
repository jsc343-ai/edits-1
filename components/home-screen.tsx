"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clapperboard,
  Gem,
  Megaphone,
  MessageSquare,
  Mic,
  PenLine,
  Settings,
  Sparkles,
  Type,
} from "lucide-react";
import { useApp } from "@/lib/app-state";
import { LanguagePicker } from "@/components/language-picker";
import { AccountCard } from "@/components/account-card";
import { GuideSection } from "@/components/guide-section";
import { Button } from "@/components/ui/button";

const HIDDEN_TAPS = 7;

export function HomeScreen() {
  const { t, mode, setMode, lang } = useApp();
  const zh = lang.startsWith("zh");
  const router = useRouter();
  const taps = useRef({ count: 0, last: 0 });

  function onBrandTap() {
    const now = Date.now();
    taps.current.count = now - taps.current.last < 800 ? taps.current.count + 1 : 1;
    taps.current.last = now;
    if (taps.current.count >= HIDDEN_TAPS) {
      taps.current.count = 0;
      router.push("/admin");
    }
  }

  const modes = [
    {
      icon: PenLine,
      href: "/pro?mode=hand",
      step: zh ? "第一步，自己來" : "Start here",
      title: zh ? "自助手工編輯" : "Manual editing",
      desc: zh ? "10 種工具，自己動手完成作品" : "10 hands-on tools to craft your work",
      tone: "bg-primary text-primary-foreground",
      chip: "bg-primary-foreground/20",
    },
    {
      icon: Sparkles,
      href: "/pro?mode=ai",
      step: zh ? "或者，交給 AI" : "Or let AI help",
      title: zh ? "AI 助理編輯" : "AI assistant editing",
      desc: zh ? "10 種 AI 功能，容量更大、功能升級" : "10 AI features with bigger capacity",
      tone: "bg-accent text-accent-foreground",
      chip: "bg-accent-foreground/20",
    },
  ];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pb-16 pt-4">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBrandTap}
          className="flex items-center gap-2 rounded-lg py-1 text-left"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Clapperboard className="size-5" aria-hidden="true" />
          </span>
          <span className="font-semibold">{t("appName")}</span>
        </button>
        <div className="flex items-center gap-1">
          <LanguagePicker />
          <Button asChild variant="ghost" size="icon" className="size-10">
            <Link href="/settings" aria-label={t("settings")}>
              <Settings className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3 pt-2 text-center">
        <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">{t("heroTitle")}</h1>
        <p className="mx-auto max-w-xl text-pretty leading-relaxed text-muted-foreground">{t("heroSub")}</p>
      </section>

      <section aria-label={zh ? "選擇編輯方式" : "Choose how to edit"} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {modes.map((m, i) => (
          <Link
            key={m.href}
            href={m.href}
            style={{ animationDelay: `${i * 120}ms` }}
            className={`group flex min-h-40 flex-col justify-between gap-6 rounded-3xl p-5 shadow-sm transition-transform active:scale-[0.98] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:fill-mode-both ${m.tone}`}
          >
            <span className="flex items-start justify-between">
              <span className={`flex size-12 items-center justify-center rounded-2xl ${m.chip}`}>
                <m.icon className="size-6" aria-hidden="true" />
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${m.chip}`}>{m.step}</span>
            </span>
            <span className="flex items-end justify-between gap-3">
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-xl font-bold">{m.title}</span>
                <span className="text-sm opacity-90">{m.desc}</span>
              </span>
              <ArrowRight
                className="size-6 shrink-0 transition-transform group-hover:translate-x-1 motion-safe:animate-pulse"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
        <p className="text-center text-sm text-muted-foreground sm:col-span-2">{t("notSaved")}</p>
      </section>

      <section className="flex flex-col gap-2" aria-label={t("modeText")}>
        <p className="text-sm font-medium text-muted-foreground">
          {zh ? "AI 對話方式" : "AI chat input"}
        </p>
        <div className="grid grid-cols-2 gap-2" role="group">
          {(
            [
              { id: "text", icon: Type, title: "modeText" },
              { id: "voice", icon: Mic, title: "modeVoice" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
                mode === m.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
              }`}
            >
              <m.icon className="size-4" aria-hidden="true" />
              {t(m.title)}
            </button>
          ))}
        </div>
      </section>

      <nav aria-label={zh ? "快速連結" : "Quick links"} className="grid grid-cols-3 gap-2">
        {[
          { href: "/store", icon: Gem, label: zh ? "模組商店" : "Store" },
          { href: "/announcements", icon: Megaphone, label: t("announcements") },
          { href: "/feedback", icon: MessageSquare, label: t("feedbackTitle") },
        ].map((l) => (
          <Button key={l.href} asChild variant="outline" className="h-16 flex-col gap-1 rounded-2xl px-2 text-xs">
            <Link href={l.href}>
              <l.icon className="size-5 text-primary" aria-hidden="true" />
              <span className="truncate">{l.label}</span>
            </Link>
          </Button>
        ))}
      </nav>

      <AccountCard />
      <GuideSection />
    </div>
  );
}
