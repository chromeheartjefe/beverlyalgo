import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u14-jobs-and-nfp",
  sources: ["U.S. Bureau of Labor Statistics: The Employment Situation"],
  steps: [
    {
      kind: "learn",
      title: "The jobs report",
      body: [
        "The US **Employment Situation** report, usually released on the **first Friday of the month at 8:30 am** New York time, is one of the biggest market events of all.",
        "Its headline is **non-farm payrolls (NFP)**: how many jobs the economy added outside farming. It also includes the **unemployment rate** and **average hourly earnings** (wage growth).",
      ],
    },
    {
      kind: "match",
      id: "parts",
      prompt: "Match each part of the jobs report to what it measures.",
      pairs: [
        ["Non-farm payrolls", "Jobs added outside farming"],
        ["Unemployment rate", "Share of the labour force without a job"],
        ["Average hourly earnings", "How fast wages are growing"],
      ],
      explain: "Together they show how strong the job market is, and whether wages are pushing inflation.",
    },
    {
      kind: "learn",
      title: "Reading the reaction",
      body: [
        "A strong report usually means a strong economy and potentially higher rates: often good for the dollar. Wage growth matters too, because fast-rising wages can feed inflation.",
        "Earlier months are also **revised**. A strong headline with big downward revisions can produce a confusing reaction, and the first spike often reverses.",
      ],
    },
    {
      kind: "choice",
      id: "nfp-time",
      prompt: "When is the US jobs report usually released?",
      options: ["The first Friday of the month at 8:30 am New York time", "Every Monday at noon", "The last day of each quarter", "Sunday evening"],
      answer: 0,
      explain: "First Friday, 8:30 am, right at the start of the New York killzone.",
    },
    {
      kind: "truefalse",
      id: "revisions",
      statement: "Previous months' jobs numbers can be revised in the new report.",
      answer: true,
      explain: "Revisions are common, and big ones can matter as much as the new headline number.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "NFP: usually first Friday of the month, 8:30 am New York.",
        "Headline jobs, unemployment rate and wage growth all matter.",
        "Revisions can change the story.",
        "The first spike often reverses.",
      ],
    },
  ],
}
