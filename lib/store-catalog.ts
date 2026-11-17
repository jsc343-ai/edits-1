// Module prices follow the Fal generation cost, plus a markup, converted to Pi.
// Adjust these three numbers to re-price the whole store.
export const MARKUP = 1.5;
export const USD_PER_PI = 0.2;

export type StoreKind = "static3d" | "dynamic3d";
export type StoreGroup = "people" | "actions" | "outfits" | "poses";

export const FAL_COST_USD: Record<StoreKind, number> = {
  static3d: 0.05,
  dynamic3d: 0.4,
};

export interface StoreModule {
  slug: string;
  kind: StoreKind;
  group: StoreGroup;
  zh: string;
  en: string;
}

export function priceInPi(kind: StoreKind): number {
  const raw = (FAL_COST_USD[kind] * MARKUP) / USD_PER_PI;
  return Math.max(0.1, Math.ceil(raw * 10) / 10);
}

export const GROUPS: { id: StoreGroup; zh: string; en: string }[] = [
  { id: "people", zh: "男女老少", en: "People" },
  { id: "actions", zh: "行住坐臥", en: "Daily actions" },
  { id: "outfits", zh: "服裝造型", en: "Outfits" },
  { id: "poses", zh: "姿勢動作", en: "Poses" },
];

const BASE: Omit<StoreModule, "slug" | "kind">[] = [
  { group: "people", zh: "男士", en: "Man" },
  { group: "people", zh: "女士", en: "Woman" },
  { group: "people", zh: "長者", en: "Elder" },
  { group: "people", zh: "孩童", en: "Child" },
  { group: "actions", zh: "行走", en: "Walking" },
  { group: "actions", zh: "站立", en: "Standing" },
  { group: "actions", zh: "坐下", en: "Sitting" },
  { group: "actions", zh: "躺臥", en: "Lying down" },
  { group: "outfits", zh: "正式服裝", en: "Formal wear" },
  { group: "outfits", zh: "休閒服裝", en: "Casual wear" },
  { group: "outfits", zh: "傳統服飾", en: "Traditional dress" },
  { group: "outfits", zh: "運動服裝", en: "Sportswear" },
  { group: "poses", zh: "揮手招呼", en: "Waving" },
  { group: "poses", zh: "比讚", en: "Thumbs up" },
  { group: "poses", zh: "雙手比心", en: "Heart hands" },
  { group: "poses", zh: "跳躍", en: "Jumping" },
];

const KINDS: StoreKind[] = ["static3d", "dynamic3d"];

export const STORE_MODULES: StoreModule[] = KINDS.flatMap((kind) =>
  BASE.map((b, i) => ({ ...b, kind, slug: `${kind}_${b.group}_${i}` })),
);
