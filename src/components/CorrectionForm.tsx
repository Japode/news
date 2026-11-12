import { useRef, useState } from "react"
import { SITE } from "../data/site.ts"

/* The correction form (JN23), as a click-to-load facade. The page prerenders a button
   that is a plain link to the form's public page on cognitoforms.com, so it works with
   scripts off. Hydrated as an island, the click loads Cognito's seamless.js in place,
   the reader's own act, as the video facade does for YouTube: nothing from Cognito runs,
   and no cookie of its is set, before it. Embedded the way viglet.org's CognitoForm.tsx
   does, with the form's key and number (SITE.cognito).

   The form is the Alexandre's "Contato" (2026-11-11): name and e-mail required, phone,
   and a comment. The plan drew "Vídeo", "O que está errado", "Onde está o certo" and an
   optional e-mail; the text above the form asks for those in the comment instead. */

export function CorrectionForm() {
  const slot = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  return (
    <div className="jn-correction">
      {!open && (
        <a
          className="jn-button jn-button-solid"
          href={SITE.cognito.page}
          data-cognito-facade=""
          onClick={(e) => {
            e.preventDefault()
            setOpen(true)
            const script = document.createElement("script")
            script.src = "https://www.cognitoforms.com/f/seamless.js"
            script.dataset.key = SITE.cognito.key
            script.dataset.form = SITE.cognito.form
            script.async = true
            slot.current?.appendChild(script)
          }}
        >
          Abrir o formulário
        </a>
      )}
      <div ref={slot} />
    </div>
  )
}
