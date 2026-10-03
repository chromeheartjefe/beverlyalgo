// Switches for features that are built but not released yet.
//
// Paper Trading is unfinished (2026-10-03). It stays invisible everywhere,
// in production and locally, unless NEXT_PUBLIC_PAPER_TRADING=1 is set:
// no sidebar entry, the page and its API answer "not found", and nothing in
// the Academy, the Glossary, the support chat or the policies mentions it.
// To work on it locally, add that line to .env.development.local (never to
// Vercel until it is ready to release).
export const PAPER_TRADING = process.env.NEXT_PUBLIC_PAPER_TRADING === "1"
