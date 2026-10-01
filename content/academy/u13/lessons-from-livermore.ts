import type { LessonContent } from "@/lib/academy/types"

// All quotes are verbatim from the Project Gutenberg text (#60979), 1923 edition.
export const lesson: LessonContent = {
  id: "u13-lessons-from-livermore",
  sources: ["Lefèvre, Reminiscences of a Stock Operator (1923), public domain, Project Gutenberg #60979"],
  steps: [
    {
      kind: "learn",
      title: "A book traders still read",
      body: [
        "**Reminiscences of a Stock Operator**, written by Edwin Lefèvre in 1923, tells the story of a speculator called Larry Livingston, closely based on the real trader **Jesse Livermore**, who made and lost several fortunes in the early 1900s.",
        "A century later, it is still one of the most recommended trading books, because the markets changed and people didn't.",
      ],
    },
    {
      kind: "learn",
      title: "Nothing new",
      body: [
        "\"...there is nothing new in Wall Street. There can't be because speculation is as old as the hills. Whatever happens in the stock market to-day has happened before and will happen again.\"",
        "Stop hunts, manias and panics are not inventions of the algorithm age. The tools change; human behaviour repeats.",
      ],
    },
    {
      kind: "learn",
      title: "Hope and fear",
      body: [
        "\"The speculator's chief enemies are always boring from within. It is inseparable from human nature to hope and to fear.\"",
        "\"Instead of hoping he must fear; instead of fearing he must hope. He must fear that his loss may develop into a much bigger loss, and hope that his profit may become a big profit.\"",
        "That is loss aversion and the disposition effect, described half a century before the research.",
      ],
    },
    {
      kind: "choice",
      id: "hope-fear",
      prompt: "According to the book, what should a speculator fear?",
      options: [
        "That a loss may grow into a much bigger loss",
        "That a winning trade will become a big winner",
        "Missing out on a move",
        "Other traders' opinions",
      ],
      answer: 0,
      explain: "Fear the loss growing (so cut it), hope the profit grows (so hold it). Most people do the opposite.",
    },
    {
      kind: "learn",
      title: "They beat themselves",
      body: [
        "\"The market does not beat them. They beat themselves, because though they have brains they cannot sit tight.\"",
        "Livermore himself learned this the hard way, losing fortunes when he broke his own rules. Knowledge was never his problem. Discipline was.",
      ],
    },
    {
      kind: "match",
      id: "quote-lesson",
      prompt: "Match each idea from the book to the modern lesson.",
      pairs: [
        ["Nothing new in Wall Street", "Patterns repeat because people repeat"],
        ["Fear the loss, hope the profit", "Cut losers, let winners run"],
        ["They beat themselves", "Discipline matters more than knowledge"],
      ],
      explain: "Each idea maps onto something you've learned in this course.",
    },
    {
      kind: "truefalse",
      id: "knowledge-enough",
      statement: "According to the book, losing traders mostly lack intelligence.",
      answer: false,
      explain: "\"Though they have brains\" they still lose, because they can't follow through. The problem is behaviour, not brains.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Reminiscences of a Stock Operator (1923) is based on Jesse Livermore.",
        "Human behaviour in markets repeats; nothing is new.",
        "Fear losses growing; hope profits grow.",
        "Most traders beat themselves. Discipline is the edge.",
      ],
    },
  ],
}
