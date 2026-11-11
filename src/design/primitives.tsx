import type { ReactNode } from "react"

/* The site's primitives (JN15), drawn from the artboards in design/ and styled by
   primitives.css on the tokens of tokens.css. Pages compose these; a page that needs a
   variant adds it here, not as a one-off style. */

type ButtonProps = {
  href: string
  variant?: "solid" | "outline"
  compact?: boolean
  children: ReactNode
}

/** A link styled as a button: solid green with ink text, or outlined in ink. */
export function Button({ href, variant = "solid", compact = false, children }: ButtonProps) {
  const cls = ["jn-button", `jn-button-${variant}`, compact && "jn-button-compact"].filter(Boolean).join(" ")
  return (
    <a className={cls} href={href}>
      {children}
    </a>
  )
}

/** A pill linking a term or a filter. */
export function Chip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="jn-chip" href={href}>
      {children}
    </a>
  )
}

/** The uppercase subject line above a title. */
export function Kicker({ small = false, muted = false, children }: { small?: boolean; muted?: boolean; children: ReactNode }) {
  const cls = ["jn-kicker", small && "jn-kicker-small", muted && "jn-kicker-muted"].filter(Boolean).join(" ")
  return <p className={cls}>{children}</p>
}

/** A hairline between blocks, or the ink rule that opens a section. */
export function Rule({ ink = false }: { ink?: boolean }) {
  return <hr className={ink ? "jn-rule jn-rule-ink" : "jn-rule"} />
}

type FieldProps = {
  id: string
  label: string
  hint?: string
  children: ReactNode
}

/** A label over its control; the control carries className="jn-field-control" and the id. */
export function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div className="jn-field">
      <label className="jn-field-label" htmlFor={id}>
        {label} {hint && <span className="jn-field-hint">({hint})</span>}
      </label>
      {children}
    </div>
  )
}
