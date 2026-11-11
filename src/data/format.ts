/* How a date and a length read in Portuguese, the same on every page. */

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

/** "2026-11-11" as "11 de novembro de 2026", without a time zone to shift the day. */
export const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} de ${MONTHS[m - 1]} de ${y}`
}

/** 315 seconds as "5 min 15 s". */
export const minutes = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s ? `${m} min ${s} s` : `${m} min`
}

const SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

/** "2026-11-11" as "11 nov 2026", the bylines' and the cards' date (JN19). */
export const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} ${SHORT[m - 1]} ${y}`
}

/** 315 seconds as "5:15", a video's length the way a player shows it (JN19). */
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

/** The minutes an article takes to read, at 200 words a minute, never under one (JN19). */
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 200))
