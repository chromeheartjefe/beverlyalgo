// "Did you mean gmail.com?" for sign-up. Two people typed @gmaik.com and
// @gmail.con, so their verification emails could never arrive. Suggests a
// fix for close misspellings of popular providers and for impossible TLDs.

import { editDistance } from "@/lib/edit-distance"

const DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "msn.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "gmx.de",
  "mail.ru",
  "inbox.ru",
  "yandex.ru",
  "ukr.net",
  "hotmail.co.uk",
  "yahoo.co.uk",
]

/** Real providers that are one letter away from a popular one: never "correct" these */
const ALSO_VALID = [
  "mail.com",
  "email.com",
  "ymail.com",
  "gmx.net",
  "mac.com",
  "aim.com",
  "pm.me",
  "protonmail.ch",
  "web.de",
  "live.co.uk",
  "hotmail.fr",
  "hotmail.it",
  "yahoo.fr",
  "yahoo.de",
  "outlook.fr",
  "bk.ru",
  "list.ru",
  "qq.com",
  "163.com",
  "naver.com",
  "zoho.com",
]

/** Provider names (the part before the first dot) of the list above */
const PROVIDER_NAMES = new Set([...DOMAINS, ...ALSO_VALID].map((d) => d.split(".")[0]))

/** Endings that are typos of .com even though some are real country codes */
const TYPO_SUFFIX = new Set(["co", "cm", "om", "con", "cmo", "ocm", "vom", "xom", "comm", "coom", "cpm", "c", "m", "cim", "ner", "nte"])

/** Endings that are clearly typos of .com and similar */
const TLD_FIX: Record<string, string> = {
  con: "com",
  cmo: "com",
  ocm: "com",
  vom: "com",
  xom: "com",
  comm: "com",
  coom: "com",
  cpm: "com",
  ner: "net",
  nte: "net",
}

/** A corrected address, or null when the address looks fine */
export function suggestEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase()
  const at = email.lastIndexOf("@")
  if (at < 1 || at === email.length - 1) return null
  const local = email.slice(0, at)
  let domain = email.slice(at + 1)
  if (DOMAINS.includes(domain) || ALSO_VALID.includes(domain)) return null

  // A provider spelled exactly right with a real country ending is a real
  // address (yahoo.co.in, hotmail.ca, yandex.ua), not a typo. Gmail has no
  // country domains, and endings like .con/.co/.cm are typos of .com.
  const [label, ...rest] = domain.split(".")
  const suffix = rest.join(".")
  if (label !== "gmail" && PROVIDER_NAMES.has(label) && !TYPO_SUFFIX.has(suffix) && /^[a-z]{2,3}(\.[a-z]{2})?$/.test(suffix)) return null

  // Fix an impossible ending first: gmail.con -> gmail.com
  const dot = domain.lastIndexOf(".")
  if (dot > 0) {
    const tld = domain.slice(dot + 1)
    if (TLD_FIX[tld]) domain = `${domain.slice(0, dot)}.${TLD_FIX[tld]}`
  } else if (domain.length >= 4) {
    // Missing dot entirely: gmailcom -> gmail.com
    const hit = DOMAINS.find((d) => d.replace(".", "") === domain)
    if (hit) domain = hit
  }
  if (DOMAINS.includes(domain)) return `${local}@${domain}`

  // Close misspelling of a popular provider: gmaik.com, gmial.com, hotmial.com
  let best: { d: string; n: number } | null = null
  for (const d of DOMAINS) {
    const n = editDistance(domain, d)
    if (!best || n < best.n) best = { d, n }
  }
  const limit = domain.length <= 8 ? 1 : 2
  if (best && best.n > 0 && best.n <= limit) return `${local}@${best.d}`

  // Only the ending was wrong (and it isn't one of the providers above)
  return domain !== email.slice(at + 1) ? `${local}@${domain}` : null
}
