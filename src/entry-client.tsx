import "./main.css"
import { hydrateRoot } from "react-dom/client"
import { ISLANDS } from "./islands.tsx"

for (const el of document.querySelectorAll<HTMLElement>("[data-island]")) {
  const C = ISLANDS[el.dataset.island!]
  if (C) hydrateRoot(el, <C {...JSON.parse(el.dataset.props || "{}")} />)
}
