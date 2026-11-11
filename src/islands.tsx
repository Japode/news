import type { ComponentType } from "react"
import { VideoFacade } from "./components/VideoFacade.tsx"

/* The page is static HTML; only these pieces run in the browser. Each interactive piece
   is an island: rendered with the page, then hydrated on its own from the props written
   beside it. Props are JSON, so no function crosses. The theme toggle left with the
   Viglet design system (JN15): the artboards draw one light theme. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ISLANDS: Record<string, ComponentType<any>> = {
  "video-facade": VideoFacade,
}

export function Island({ name, props = {} }: { name: keyof typeof ISLANDS & string; props?: Record<string, string> }) {
  const C = ISLANDS[name]
  return (
    <span data-island={name} data-props={JSON.stringify(props)} style={{ display: "contents" }}>
      <C {...props} />
    </span>
  )
}
