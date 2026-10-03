// Facts the legal pages (Terms, Privacy Policy, Cookie Policy) are built from.
// Fill in the company details exactly as they appear on the trade licence:
// privacy law requires the operator to be named, and the Terms need a party
// to contract with. Empty fields are left out of the pages rather than guessed.

export const legal = {
  /** Registered company name, e.g. "Entrix Technologies FZ-LLC" */
  companyName: "",
  /** Trade licence or registration number */
  licenceNumber: "",
  /** Registered address, on one line */
  address: "",
  country: "United Arab Emirates",
  /** Emirate whose courts hear disputes, e.g. "Dubai". Leave empty until confirmed. */
  emirate: "",

  /** Shown at the top of every legal page */
  lastUpdated: "October 3, 2026",
}

/** "Example FZ-LLC, a company registered in the United Arab Emirates (licence no. 123), Address" */
export function operatorDescription(): string {
  const who = legal.companyName ? `${legal.companyName}, a company` : "a company"
  const licence = legal.licenceNumber ? ` (licence number ${legal.licenceNumber})` : ""
  const where = legal.address ? `, with its registered address at ${legal.address}` : ""
  return `${who} registered in the ${legal.country}${licence}${where}`
}

export function courtsDescription(): string {
  return legal.emirate ? `the courts of the Emirate of ${legal.emirate}, ${legal.country}` : `the competent courts of the ${legal.country}`
}

export const LEGAL_DOCS = [
  { href: "/terms", title: "Terms of Service" },
  { href: "/privacy", title: "Privacy Policy" },
  { href: "/cookies", title: "Cookie Policy" },
] as const
