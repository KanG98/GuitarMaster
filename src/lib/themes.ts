export interface ThemeColors {
  id: string;
  name: string;
  emoji: string;
  primary: string;        // oklch value
  primaryForeground: string;
  ring: string;
}

export const THEMES: ThemeColors[] = [
  { id: "default", name: "Charcoal", emoji: "🎸", primary: "oklch(0.205 0 0)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.708 0 0)" },
  { id: "blue", name: "Ocean Blue", emoji: "🌊", primary: "oklch(0.55 0.2 255)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.65 0.15 255)" },
  { id: "pink", name: "Soft Pink", emoji: "🌸", primary: "oklch(0.65 0.15 350)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.75 0.1 350)" },
  { id: "teal", name: "Teal", emoji: "🧊", primary: "oklch(0.55 0.15 180)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.65 0.1 180)" },
  { id: "orange", name: "Warm Orange", emoji: "🔥", primary: "oklch(0.65 0.2 50)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.75 0.15 50)" },
  { id: "purple", name: "Purple", emoji: "💜", primary: "oklch(0.55 0.2 300)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.65 0.15 300)" },
  { id: "green", name: "Forest", emoji: "🌿", primary: "oklch(0.55 0.15 145)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.65 0.1 145)" },
  { id: "rose-navy", name: "Rose & Navy", emoji: "🌙", primary: "oklch(0.6 0.17 0)", primaryForeground: "oklch(0.985 0 0)", ring: "oklch(0.7 0.12 0)" },
];

export const STORAGE_KEY = "guitar-master-theme";

export function applyTheme(theme: ThemeColors): void {
  // Use a <style> tag instead of inline styles on <html> to avoid hydration mismatch
  let styleEl = document.getElementById("gm-theme") as HTMLStyleElement | null;
  if (theme.id === "default") {
    // Remove override style to fall back to CSS defaults
    styleEl?.remove();
    return;
  }
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "gm-theme";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `:root{--primary:${theme.primary};--primary-foreground:${theme.primaryForeground};--ring:${theme.ring}}`;
}

export function loadSavedTheme(): ThemeColors {
  if (typeof window === "undefined") return THEMES[0];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const found = THEMES.find(t => t.id === saved);
    if (found) return found;
  }
  return THEMES[0];
}

export function saveTheme(theme: ThemeColors): void {
  localStorage.setItem(STORAGE_KEY, theme.id);
  applyTheme(theme);
}