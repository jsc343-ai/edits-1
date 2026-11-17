import { AppShell } from "@/components/app-shell";

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialMode = mode === "hand" || mode === "ai" ? mode : undefined;
  return <AppShell initialMode={initialMode} />;
}
