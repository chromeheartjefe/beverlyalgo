// Landing page testimonials (components/sections/testimonials/default.tsx).
// Text is kept exactly as the users wrote it. To add a profile picture, drop
// the image in /public/testimonials/ and set `avatar: "/testimonials/name.jpg"`;
// without one the card shows the person's initials.

export interface Testimonial {
  name: string
  text: string
  /** Market or context the quote is about, shown as a small tag */
  tag?: string
  avatar?: string
}

export const TESTIMONIALS: Testimonial[] = [
  { name: "georgi", tag: "MNQ", text: "ngl this chart analyser caught a bearish setup on MNQ that I was about to long into. Sat that one out and price dumped right after." },
  { name: "rodizzzz", text: "way less chart staring now lol" },
  { name: "Sokol", tag: "NY open", text: "I've been using entrixalgo before the NY open and my chart prep went from like 30 mins to maybe 10." },
  { name: "Benqiun_", text: "caught a level i completely missed" },
  { name: "hudson", tag: "BTC", text: "I started using it on BTC and it's helped me spot when the move is actually breaking structure vs just making noise." },
  { name: "kali", text: "saved me from a dumb entry" },
  { name: "ILIAS", tag: "Prop account", text: "I trade a prop account and started running my setups through the chart analyzer before entering, mostly to see if I'm missing something." },
  { name: "wyck", text: "smart money levels have been really useful" },
  { name: "Nicholas Zamani", tag: "NQ", text: "The other day I was convinced NQ was gonna keep pushing and the analyser flagged the weakening momentum. Waited instead of chasing and got a much cleaner entry later." },
  { name: "MattTrades", tag: "Futures", text: "actually pretty solid for futures" },
  { name: "Jacob Swan", text: "I use it more for confirmation than signals, but having it break down the chart before I trade has made my entries way more intentional." },
  { name: "JaySPX", text: "good second opinion when i'm stuck" },
  { name: "Ethan Satkowski", tag: "ETH", text: "Tried it on ETH during a messy session and it helped me stay out of a trade that looked good" },
  { name: "Fidel Cashflow", text: "the pattern recognition is crazy sometimes" },
  { name: "Zac Garrett", tag: "SPY", text: "Started using the chart analyzer for SPY and I'm spending way less time marking random levels that don't end up mattering." },
  { name: "sam.r", text: "kept me from revenge trading lol" },
  { name: "Mikey P", tag: "MNQ", text: "I mostly scalp MNQ and the pre-trade breakdown is nice when the market is moving stupid fast." },
  { name: "bagcha$$a", text: "lowkey part of my routine now" },
  { name: "fl0w.fx", tag: "BTC", text: "Entrix helped me catch a liquidity sweep on BTC that I would've probably ignored. Ended up being one of my cleaner trades that week." },
  { name: "Markkk.", text: "not a magic signal, just really useful" },
]
