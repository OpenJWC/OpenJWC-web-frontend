export type UIColorTone = "amber" | "ocean" | "forest" | "plum";

export type UIFontPreset = "editorial" | "modern" | "literary";

export interface UIPreferences {
  colorTone: UIColorTone;
  fontPreset: UIFontPreset;
}

export const UI_PREFERENCES_STORAGE_KEY = "openjwc-ui-preferences";

export const DEFAULT_UI_PREFERENCES: UIPreferences = {
  colorTone: "amber",
  fontPreset: "editorial",
};

export const COLOR_TONE_OPTIONS: Array<{
  value: UIColorTone;
  label: string;
  description: string;
}> = [
  {
    value: "amber",
    label: "琥珀暖调",
    description: "温暖米白底，适合当前控制台风格。",
  },
  {
    value: "ocean",
    label: "海雾蓝调",
    description: "偏冷静的蓝灰色层次，视觉更清爽。",
  },
  {
    value: "forest",
    label: "松林绿调",
    description: "沉稳绿色强调，适合长时间查看数据。",
  },
  {
    value: "plum",
    label: "梅夜紫调",
    description: "更有识别度的深紫灰配色。",
  },
];

export const FONT_PRESET_OPTIONS: Array<{
  value: UIFontPreset;
  label: string;
  description: string;
}> = [
  {
    value: "editorial",
    label: "杂志衬线",
    description: "标题更有展示感，正文保持轻盈。",
  },
  {
    value: "modern",
    label: "现代无衬线",
    description: "整体更干净利落，适合后台面板。",
  },
  {
    value: "literary",
    label: "书卷阅读",
    description: "标题更柔和，正文更偏阅读风格。",
  },
];

function isColorTone(value: unknown): value is UIColorTone {
  return ["amber", "ocean", "forest", "plum"].includes(String(value));
}

function isFontPreset(value: unknown): value is UIFontPreset {
  return ["editorial", "modern", "literary"].includes(String(value));
}

export function normalizeUIPreferences(value: unknown): UIPreferences {
  const record = typeof value === "object" && value !== null ? value : {};
  const colorTone = (record as { colorTone?: unknown }).colorTone;
  const fontPreset = (record as { fontPreset?: unknown }).fontPreset;

  return {
    colorTone: isColorTone(colorTone)
      ? colorTone
      : DEFAULT_UI_PREFERENCES.colorTone,
    fontPreset: isFontPreset(fontPreset)
      ? fontPreset
      : DEFAULT_UI_PREFERENCES.fontPreset,
  };
}

export function applyUIPreferences(preferences: UIPreferences) {
  document.documentElement.dataset.colorTone = preferences.colorTone;
  document.documentElement.dataset.fontPreset = preferences.fontPreset;
}

export function loadUIPreferences(): UIPreferences {
  try {
    const raw = window.localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_UI_PREFERENCES;
    }

    return normalizeUIPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_UI_PREFERENCES;
  }
}

export function saveUIPreferences(preferences: UIPreferences) {
  const normalized = normalizeUIPreferences(preferences);
  window.localStorage.setItem(
    UI_PREFERENCES_STORAGE_KEY,
    JSON.stringify(normalized)
  );
  applyUIPreferences(normalized);
}

export function initializeUIPreferences() {
  applyUIPreferences(loadUIPreferences());
}
