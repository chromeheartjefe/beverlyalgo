// Password rules, shared by the sign-up form (strength meter) and every API
// route that sets a password, so the form and the server always agree.
//
// Follows current guidance (NIST SP 800-63B): a minimum length, and a block
// on passwords that are known or trivially guessable. No "must contain a
// symbol / uppercase" rules; those annoy people without adding much. Long,
// ordinary passwords like "Password11122" are fine.

export const PASSWORD_MIN = 8
export const PASSWORD_MAX_BYTES = 72 // bcrypt only reads the first 72 bytes

export type PasswordLevel = 0 | 1 | 2 | 3 // 0 = too weak (blocked)

export type PasswordCheck = {
  ok:    boolean
  level: PasswordLevel
  label: "Too weak" | "Fair" | "Good" | "Strong"
  hint:  string
}

// Some of the most used passwords of 8+ characters (shorter ones already
// fail the length rule). Compared case-insensitively, whole password only.
const COMMON = new Set([
  "password", "password1", "password12", "password123", "password1234", "password!", "password01",
  "password11", "password2", "passw0rd", "p@ssw0rd", "p@ssword", "12345678", "123456789",
  "1234567890", "0123456789", "987654321", "87654321", "11111111", "00000000", "22222222",
  "33333333", "44444444", "55555555", "66666666", "77777777", "88888888", "99999999",
  "12341234", "11223344", "123123123", "12344321", "qwerty123", "qwertyui", "qwertyuiop",
  "qwerty12", "qwe12345", "123qweasd", "qweasdzxc", "1q2w3e4r", "1q2w3e4r5t", "q1w2e3r4",
  "1qaz2wsx", "zaq12wsx", "!qaz2wsx", "asdfghjk", "asdfghjkl", "asdf1234", "zxcvbnm1",
  "azerty123", "azertyui", "qwertz123", "abcd1234", "abc12345", "aa123456", "iloveyou",
  "iloveyou1", "sunshine", "princess", "football", "football1", "baseball", "baseball1",
  "welcome1", "welcome123", "superman", "batman123", "michael1", "jennifer", "whatever",
  "starwars", "computer", "internet", "trustno1", "letmein1", "letmein123", "admin123",
  "administrator", "changeme", "changeme1", "secret123", "test1234", "testtest", "hello123",
  "monkey12", "dragon12", "master12", "shadow12", "mustang1", "liverpool", "chelsea1",
  "arsenal1", "pokemon1", "naruto123", "minecraft", "fortnite", "samsung1", "google123",
  "facebook1", "loveyou1", "money123", "million1", "1million", "bitcoin1", "bitcoin123",
  "crypto123", "trading1", "trader123", "entrixalgo", "entrixalgo1", "entrixalgo123",
])

// Words that make a password weaker when little else is added to them
const WEAK_WORDS = ["password", "passw0rd", "qwerty", "letmein", "welcome", "iloveyou", "admin", "entrixalgo"]

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "qwertzuiop", "azertyuiop"]

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length
}

// abcdefgh, 12345678, 87654321, aaaaaaaa: mostly +1, -1 or 0 steps
function isRun(s: string): boolean {
  if (s.length < 2) return false
  let up = 0
  let down = 0
  let same = 0
  for (let i = 1; i < s.length; i++) {
    const d = s.charCodeAt(i) - s.charCodeAt(i - 1)
    if (d === 1) up++
    else if (d === -1) down++
    else if (d === 0) same++
  }
  const pairs = s.length - 1
  return up / pairs >= 0.8 || down / pairs >= 0.8 || same / pairs >= 0.8
}

function isKeyboardWalk(lower: string): boolean {
  return KEYBOARD_ROWS.some((row) => (row + row).includes(lower) || (row + row).split("").reverse().join("").includes(lower))
}

const letters = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")

const TOO_WEAK = (hint: string): PasswordCheck => ({ ok: false, level: 0, label: "Too weak", hint })

export function checkPassword(password: string, context: { email?: string | null; name?: string | null } = {}): PasswordCheck {
  const pw    = password ?? ""
  const lower = pw.toLowerCase()
  const len   = [...pw].length

  if (len < PASSWORD_MIN) return TOO_WEAK(`Use at least ${PASSWORD_MIN} characters.`)
  if (byteLength(pw) > PASSWORD_MAX_BYTES) return TOO_WEAK(`Use at most ${PASSWORD_MAX_BYTES} characters.`)
  if (COMMON.has(lower)) return TOO_WEAK("This is one of the most common passwords.")
  if (new Set(lower).size < 4 || isRun(lower) || isKeyboardWalk(lower)) return TOO_WEAK("Too easy to guess. Avoid repeats and sequences.")

  const email = (context.email ?? "").trim().toLowerCase()
  const local = email.split("@")[0] ?? ""
  const name  = letters(context.name ?? "")
  const plain = letters(pw)
  if ((email && lower === email) || (local.length >= 3 && plain === letters(local)) || (name.length >= 3 && plain === name)) {
    return TOO_WEAK("Don't use your name or email as your password.")
  }

  // Allowed. The level is guidance only.
  let score = 0
  if (len >= 10) score++
  if (len >= 14) score++
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  if (classes >= 2) score++
  if (classes >= 3 || len >= 16) score++
  const word = WEAK_WORDS.find((w) => lower.includes(w))
  if (word && lower.length - word.length < 6) score--

  if (score >= 4) return { ok: true, level: 3, label: "Strong", hint: "Strong password." }
  if (score >= 2) return { ok: true, level: 2, label: "Good", hint: "Good. A few more characters make it strong." }
  return { ok: true, level: 1, label: "Fair", hint: "Okay. A longer password is the easiest way to make it stronger." }
}
