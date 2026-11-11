import type { ComponentType } from "react"
import { SiteThemeToggle } from "@viglet/viglet-design-system/site"
import { SITE } from "./data/site.ts"

/* The page is static HTML; only these pieces run in the browser. Each interactive piece
   is an island: rendered with the page, then hydrated on its own from the props written
   beside it. Props are JSON, so no function crosses. */

const NEXT: Record<string, string> = { dark: "escuro", light: "claro" }
const ThemeToggle = () => <SiteThemeToggle storageKey={SITE.themeKey} label={(next) => `Mudar para o tema ${NEXT[next] ?? next}`} />

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ISLANDS: Record<string, ComponentType<any>> = {
  "theme-toggle": ThemeToggle,
}

export function Island({ name, props = {} }: { name: keyof typeof ISLANDS & string; props?: Record<string, string> }) {
  const C = ISLANDS[name]
  return (
    <span data-island={name} data-props={JSON.stringify(props)} style={{ display: "contents" }}>
      <C {...props} />
    </span>
  )
}
