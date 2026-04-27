import { PrismaClient, Domain, ItemType, Difficulty } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const SEED_USER = {
  email: "alice.yh7@gmail.com",
  name: "Alice",
}

// --- Schedule data ---
// Each entry: { date, items[] }
// date: "YYYY-MM-DD"
// items: [ { title, domain, type, url, estimatedMinutes, difficulty? } ]

type ScheduleItem = {
  title: string
  domain: Domain
  type: ItemType
  url?: string
  estimatedMinutes: number
  difficulty?: Difficulty
}

type DayPlan = {
  date: string
  items: ScheduleItem[]
}

const baseSchedule: DayPlan[] = [
  // ── Week 1: Apr 27 – May 3 ──────────────────────────────────
  {
    date: "2026-04-27",
    items: [
      { title: "NC Arrays #1 — Contains Duplicate", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/contains-duplicate/", estimatedMinutes: 35, difficulty: "EASY" },
      { title: "Karpathy ep 1 — intro + Value class (first 45 min)", domain: "ML_RECSYS", type: "VIDEO", url: "https://www.youtube.com/watch?v=VMj-3S1tku0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 1 (Vectors) + learncpp ch 0", domain: "MATH_STATS", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-04-28",
    items: [
      { title: "NC Arrays #2 — Valid Anagram", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/valid-anagram/", estimatedMinutes: 30, difficulty: "EASY" },
      { title: "Karpathy ep 1 — autograd internals (next 45 min)", domain: "ML_RECSYS", type: "VIDEO", url: "https://www.youtube.com/watch?v=VMj-3S1tku0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 2 (Span & basis) + learncpp ch 1.1–1.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-04-29",
    items: [
      { title: "NC Arrays #3 — Two Sum", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/two-sum/", estimatedMinutes: 30, difficulty: "EASY" },
      { title: "Karpathy ep 1 — training a tiny neuron (next 45 min)", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 3 (Linear transformations) + learncpp ch 1.5–1.7", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-04-30",
    items: [
      { title: "NC Arrays #4 — Group Anagrams", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/group-anagrams/", estimatedMinutes: 40, difficulty: "MEDIUM" },
      { title: "MOOC: enroll Course 1 + Module 1 intro", domain: "ML_RECSYS", type: "COURSE", url: "https://www.coursera.org/specializations/recommender-systems", estimatedMinutes: 60 },
      { title: "3B1B Linalg ep 4 (Matrix multiplication) + learncpp ch 1.8–1.10", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-01",
    items: [
      { title: "NC Arrays #5 — Top K Frequent Elements", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/top-k-frequent-elements/", estimatedMinutes: 40, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 1 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 60 },
      { title: "3B1B Linalg ep 5 (3D linear transformations)", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 30 },
    ],
  },
  {
    date: "2026-05-02",
    items: [
      { title: "NC Arrays #6 — Encode/Decode Strings + review #1–2", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/encode-and-decode-strings/", estimatedMinutes: 60, difficulty: "MEDIUM" },
      { title: "Karpathy ep 1 finish + recreate micrograd notebook", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 150 },
      { title: "learncpp ch 1 finish", domain: "CPP_SYSTEMS", type: "READING", url: "https://www.learncpp.com/", estimatedMinutes: 45 },
    ],
  },
  {
    date: "2026-05-03",
    items: [
      { title: "NC Arrays #7 — Product of Array Except Self", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/product-of-array-except-self/", estimatedMinutes: 40, difficulty: "MEDIUM" },
      { title: "Write note: 'what backprop actually computes'", domain: "ML_RECSYS", type: "REVIEW", estimatedMinutes: 30 },
      { title: "3B1B Linalg ep 6 (Determinant) + weekly review", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 45 },
    ],
  },
  // ── Week 2: May 4 – May 10 ──────────────────────────────────
  {
    date: "2026-05-04",
    items: [
      { title: "NC Arrays #8 — Valid Sudoku", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/valid-sudoku/", estimatedMinutes: 45, difficulty: "MEDIUM" },
      { title: "Karpathy ep 2 (makemore bigrams) — first 45 min", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 7 (Inverse, column space, null space)", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 35 },
    ],
  },
  {
    date: "2026-05-05",
    items: [
      { title: "NC Arrays #9 — Longest Consecutive Sequence", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/longest-consecutive-sequence/", estimatedMinutes: 45, difficulty: "MEDIUM" },
      { title: "Karpathy ep 2 — next 45 min", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 8 (Nonsquare matrices) + learncpp ch 2.1–2.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-06",
    items: [
      { title: "NC Two Pointers #1 — Valid Palindrome", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/valid-palindrome/", estimatedMinutes: 30, difficulty: "EASY" },
      { title: "MOOC: Course 1 Module 2 lecture A", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 9 (Dot products) + learncpp ch 2.5–2.7", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-07",
    items: [
      { title: "NC Two Pointers #2 — Two Sum II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", estimatedMinutes: 35, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 2 lecture B", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 10 (Cross products) + learncpp ch 2.8–2.10", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-08",
    items: [
      { title: "NC Two Pointers #3 — 3Sum", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/3sum/", estimatedMinutes: 45, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 2 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 11 (Cramer's rule) + learncpp ch 2 finish", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-09",
    items: [
      { title: "NC Two Pointers #4 — Container With Most Water + review 3Sum", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/container-with-most-water/", estimatedMinutes: 60, difficulty: "MEDIUM" },
      { title: "Karpathy ep 2 finish + recreate bigram notebook", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 120 },
      { title: "Write note: 'counting vs neural net — what changes'", domain: "ML_RECSYS", type: "REVIEW", estimatedMinutes: 20 },
    ],
  },
  {
    date: "2026-05-10",
    items: [
      { title: "NC Two Pointers #5 — Trapping Rain Water", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/trapping-rain-water/", estimatedMinutes: 60, difficulty: "HARD" },
      { title: "MOOC: Course 1 Module 3 start", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "Weekly review + plan adjustments", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 },
    ],
  },
  // ── Week 3: May 11 – May 17 ──────────────────────────────────
  {
    date: "2026-05-11",
    items: [
      { title: "NC Sliding Window #1 — Best Time to Buy/Sell Stock", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", estimatedMinutes: 30, difficulty: "EASY" },
      { title: "Karpathy ep 3 (makemore MLP) — first 45 min", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 12 (Change of basis)", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 30 },
    ],
  },
  {
    date: "2026-05-12",
    items: [
      { title: "NC SW #2 — Longest Substring Without Repeating Chars", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", estimatedMinutes: 40, difficulty: "MEDIUM" },
      { title: "Karpathy ep 3 — next 45 min", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 13 (Eigenvectors pt 1) + learncpp ch 3.1–3.5", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-13",
    items: [
      { title: "NC SW #3 — Longest Repeating Character Replacement", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", estimatedMinutes: 45, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 3 lecture A", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 14 (Eigenvectors pt 2) + learncpp ch 3.6–3.10", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-14",
    items: [
      { title: "NC SW #4 — Permutation in String", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/permutation-in-string/", estimatedMinutes: 40, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 3 lecture B", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 15 (Abstract vector spaces) + learncpp ch 4.1–4.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-15",
    items: [
      { title: "NC SW #5 — Minimum Window Substring", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/minimum-window-substring/", estimatedMinutes: 50, difficulty: "HARD" },
      { title: "MOOC: Course 1 Module 3 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "3B1B Linalg ep 16 (finale) + learncpp ch 4.5–4.8", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-16",
    items: [
      { title: "NC SW #6 — Sliding Window Maximum + review #5", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/sliding-window-maximum/", estimatedMinutes: 60, difficulty: "HARD" },
      { title: "Karpathy ep 3 finish + redo MLP notebook with different hyperparams", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 120 },
      { title: "learncpp ch 4 finish", domain: "CPP_SYSTEMS", type: "READING", estimatedMinutes: 40 },
    ],
  },
  {
    date: "2026-05-17",
    items: [
      { title: "Review 2 Hard problems from this week (no new)", domain: "LEETCODE", type: "REVIEW", estimatedMinutes: 60 },
      { title: "Paper #1 (skim): Koren et al. Matrix Factorization Techniques §2", domain: "ML_RECSYS", type: "PAPER", url: "https://datajobs.com/data-science-repo/Recommender-Systems-[Netflix].pdf", estimatedMinutes: 45, difficulty: "MEDIUM" },
      { title: "Weekly review", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 20 },
    ],
  },
  // ── Week 4: May 18 – May 24 ──────────────────────────────────
  {
    date: "2026-05-18",
    items: [
      { title: "NC Stack #1 — Valid Parentheses", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/valid-parentheses/", estimatedMinutes: 30, difficulty: "EASY" },
      { title: "Karpathy ep 4 — first 45 min (BatchNorm)", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 },
      { title: "Stat 110 lecture 1 (Probability and Counting)", domain: "MATH_STATS", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo", estimatedMinutes: 50 },
    ],
  },
  {
    date: "2026-05-19",
    items: [
      { title: "NC Stack #2 — Min Stack", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/min-stack/", estimatedMinutes: 35, difficulty: "MEDIUM" },
      { title: "Karpathy ep 4 — next 45 min", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 },
      { title: "Stat 110 lecture 2 (Story Proofs) + learncpp ch 5.1–5.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 },
    ],
  },
  {
    date: "2026-05-20",
    items: [
      { title: "NC Stack #3 — Evaluate Reverse Polish Notation", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", estimatedMinutes: 35, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 4 lecture A", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "Stat 110 lecture 3 (Birthday Problem) + learncpp ch 5.5–5.7", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 },
    ],
  },
  {
    date: "2026-05-21",
    items: [
      { title: "NC Stack #4 — Generate Parentheses", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/generate-parentheses/", estimatedMinutes: 40, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 4 lecture B", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "learncpp ch 5.8–5.10", domain: "CPP_SYSTEMS", type: "READING", estimatedMinutes: 35 },
    ],
  },
  {
    date: "2026-05-22",
    items: [
      { title: "NC Stack #5 — Daily Temperatures", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/daily-temperatures/", estimatedMinutes: 40, difficulty: "MEDIUM" },
      { title: "MOOC: Course 1 Module 4 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 },
      { title: "learncpp ch 5 finish", domain: "CPP_SYSTEMS", type: "READING", estimatedMinutes: 35 },
    ],
  },
  {
    date: "2026-05-23",
    items: [
      { title: "NC Stack #6 — Car Fleet + review #4", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/car-fleet/", estimatedMinutes: 60, difficulty: "MEDIUM" },
      { title: "Karpathy ep 4 finish + turn off BatchNorm experiment", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 120 },
      { title: "Note: 'why BatchNorm helps, in one paragraph'", domain: "ML_RECSYS", type: "REVIEW", estimatedMinutes: 20 },
    ],
  },
  {
    date: "2026-05-24",
    items: [
      { title: "NC Stack #7 — Largest Rectangle in Histogram", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", estimatedMinutes: 60, difficulty: "HARD" },
      { title: "MOOC: finish Course 1 (Intro to RecSys) — write 3-bullet summary", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 60 },
      { title: "Weekly review + Phase 1 retrospective", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 },
    ],
  },
  // ── Weeks 5–14 abbreviated (key milestones) ─────────────────
  // Week 5
  { date: "2026-05-25", items: [{ title: "NC Binary Search #1 — Binary Search", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/binary-search/", estimatedMinutes: 30, difficulty: "EASY" }, { title: "Karpathy ep 5 — first 60 min (manual backprop)", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 60 }, { title: "Stat 110 lecture 4 (Conditional Probability)", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-05-26", items: [{ title: "NC BS #2 — Search a 2D Matrix", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/search-a-2d-matrix/", estimatedMinutes: 35, difficulty: "MEDIUM" }, { title: "Karpathy ep 5 — next 60 min", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 60 }, { title: "Stat 110 lecture 5 + learncpp ch 6.1–6.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-05-27", items: [{ title: "NC BS #3 — Koko Eating Bananas", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/koko-eating-bananas/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "MOOC: Course 2 Module 1 lecture A", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 }, { title: "Stat 110 lecture 6 + learncpp ch 6.5–6.7", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-05-28", items: [{ title: "NC BS #4 — Find Min in Rotated Sorted Array", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", estimatedMinutes: 35, difficulty: "MEDIUM" }, { title: "MOOC: Course 2 Module 1 lecture B", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 }, { title: "Stat 110 lecture 7 + learncpp ch 6.8–6.10", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-05-29", items: [{ title: "NC BS #5 — Search in Rotated Sorted Array", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #1 FULL READ: Koren et al. Matrix Factorization Techniques", domain: "ML_RECSYS", type: "PAPER", url: "https://datajobs.com/data-science-repo/Recommender-Systems-[Netflix].pdf", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "MOOC: Course 2 Module 1 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 30 }] },
  { date: "2026-05-30", items: [{ title: "NC BS #6 — Time Based Key-Value Store + review #5", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/time-based-key-value-store/", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Karpathy ep 5 finish + redo manual backprop without looking", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 120 }, { title: "learncpp ch 6 finish", domain: "CPP_SYSTEMS", type: "READING", estimatedMinutes: 40 }] },
  { date: "2026-05-31", items: [{ title: "NC BS #7 — Median of Two Sorted Arrays", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", estimatedMinutes: 60, difficulty: "HARD" }, { title: "Re-read Paper #1 + polish note", domain: "ML_RECSYS", type: "PAPER", estimatedMinutes: 45 }, { title: "Weekly review", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 20 }] },
  // Week 6
  { date: "2026-06-01", items: [{ title: "NC Linked List #1 — Reverse Linked List", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/reverse-linked-list/", estimatedMinutes: 30, difficulty: "EASY" }, { title: "Karpathy ep 6 — first 45 min (WaveNet)", domain: "ML_RECSYS", type: "VIDEO", estimatedMinutes: 45 }, { title: "Stat 110 lecture 8 (Random Variables)", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-06-05", items: [{ title: "NC LL #5 — Copy List with Random Pointer", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/copy-list-with-random-pointer/", estimatedMinutes: 45, difficulty: "MEDIUM" }, { title: "Paper #2 FULL READ: Rendle BPR — Bayesian Personalized Ranking", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/1205.2618", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "MOOC: Course 2 Module 2 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 30 }] },
  // Week 7
  { date: "2026-06-12", items: [{ title: "NC LL #10 — Merge K Sorted Lists", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/merge-k-sorted-lists/", estimatedMinutes: 60, difficulty: "HARD" }, { title: "Paper #3 FULL READ: Cheng et al. Wide & Deep Learning", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/1606.07792", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Karpathy ep 7 finish + recreate GPT notebook", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 180 }] },
  // Week 8
  { date: "2026-06-16", items: [{ title: "NC Trees #4 — Subtree of Another Tree", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/subtree-of-another-tree/", estimatedMinutes: 35, difficulty: "EASY" }, { title: "Paper #4 FULL READ: Covington et al. Deep Neural Networks for YouTube Recs", domain: "ML_RECSYS", type: "PAPER", url: "https://dl.acm.org/doi/10.1145/2959100.2959190", estimatedMinutes: 75, difficulty: "MEDIUM" }, { title: "Stat 110 lecture 17 + learncpp ch 9.1–9.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-06-19", items: [{ title: "NC Trees #7 — Binary Tree Right Side View", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/binary-tree-right-side-view/", estimatedMinutes: 35, difficulty: "MEDIUM" }, { title: "Paper #5 FULL READ: Guo et al. DeepFM", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/1703.04247", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "MOOC: Course 3 Module 1 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 30 }] },
  // Week 9 — Two-Tower papers (critical)
  { date: "2026-06-26", items: [{ title: "NC Tries #1 — Implement Trie", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #6 FULL READ: Yi et al. Sampling-Bias-Corrected Two-Tower", domain: "ML_RECSYS", type: "PAPER", url: "https://dl.acm.org/doi/10.1145/3298689.3346996", estimatedMinutes: 90, difficulty: "HARD" }, { title: "MOOC: Course 3 Module 2 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 30 }] },
  { date: "2026-06-27", items: [{ title: "NC Tries #2 — Design Add and Search Words + review Tree Hards", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Paper #6 RE-READ — write 3-paragraph note: retrieval, sampling bias, batch negatives", domain: "ML_RECSYS", type: "REVIEW", estimatedMinutes: 60 }, { title: "learncpp ch 10 finish", domain: "CPP_SYSTEMS", type: "READING", estimatedMinutes: 40 }] },
  { date: "2026-06-28", items: [{ title: "NC Tries #3 — Word Search II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/word-search-ii/", estimatedMinutes: 60, difficulty: "HARD" }, { title: "Paper #7 FULL READ: Yang et al. Mixed Negative Sampling", domain: "ML_RECSYS", type: "PAPER", estimatedMinutes: 60, difficulty: "HARD" }, { title: "Weekly review", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 20 }] },
  // Week 10 — MMoE, PLE
  { date: "2026-07-02", items: [{ title: "NC Heap #3 — K Closest Points to Origin", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/k-closest-points-to-origin/", estimatedMinutes: 35, difficulty: "MEDIUM" }, { title: "Paper #8 FULL READ: Ma et al. MMoE", domain: "ML_RECSYS", type: "PAPER", url: "https://dl.acm.org/doi/10.1145/3219819.3220007", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "MOOC: finish Course 3 (Eval & Metrics)", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 45 }] },
  { date: "2026-07-03", items: [{ title: "NC Heap #4 — Kth Largest Element in Array", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #9 FULL READ: Tang et al. PLE (RecSys 2020 best paper)", domain: "ML_RECSYS", type: "PAPER", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "MOOC: Course 4 Module 1 start", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 30 }] },
  // Week 11 — Sequence models
  { date: "2026-07-07", items: [{ title: "NC Backtracking #2 — Combination Sum", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/combination-sum/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #10 FULL READ: Kang & McAuley SASRec", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/1808.09781", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Stat 110 lecture 29 + learncpp ch 12.1–12.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-07-08", items: [{ title: "NC Backtracking #3 — Permutations", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/permutations/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #11 FULL READ: Sun et al. BERT4Rec", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/1904.06690", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Stat 110 lecture 30 + learncpp ch 12.5–12.7", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-07-10", items: [{ title: "NC Backtracking #5 — Combination Sum II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/combination-sum-ii/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #12 FULL READ: Naumov et al. DLRM", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/1906.00091", estimatedMinutes: 75, difficulty: "HARD" }, { title: "MOOC: Course 4 Module 2 lecture B", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 30 }] },
  // Week 12 — Industrial scale, PinSAGE, Netflix
  { date: "2026-07-14", items: [{ title: "NC Backtracking #9 — N-Queens", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/n-queens/", estimatedMinutes: 60, difficulty: "HARD" }, { title: "Paper #13 FULL READ: Liu et al. Monolith", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/2209.07663", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Stat 110 lecture 33 + learncpp ch 13.1–13.4", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-07-15", items: [{ title: "NC Graphs #1 — Number of Islands", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/number-of-islands/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #14 FULL READ: Ying et al. PinSAGE (GNNs in production)", domain: "ML_RECSYS", type: "PAPER", url: "https://dl.acm.org/doi/10.1145/3219819.3219890", estimatedMinutes: 75, difficulty: "HARD" }, { title: "Stat 110 lecture 34 (final) + learncpp ch 13.5–13.7", domain: "MATH_STATS", type: "VIDEO", estimatedMinutes: 50 }] },
  { date: "2026-07-17", items: [{ title: "NC Graphs #3 — Max Area of Island", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/max-area-of-island/", estimatedMinutes: 35, difficulty: "MEDIUM" }, { title: "Paper #15 FULL READ: Steck — Calibrated Recommendations (Netflix 2018)", domain: "ML_RECSYS", type: "PAPER", url: "https://dl.acm.org/doi/10.1145/3240323.3240372", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "MOOC: Course 4 Module 3 finish", domain: "ML_RECSYS", type: "COURSE", estimatedMinutes: 30 }] },
  // Week 13 — Netflix deep dive
  { date: "2026-07-20", items: [{ title: "NC Graphs #6 — Rotting Oranges", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/rotting-oranges/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Paper #16 FULL READ: Steck et al. Deep Learning for RecSys — Netflix Case Study", domain: "ML_RECSYS", type: "PAPER", url: "https://ojs.aaai.org/index.php/aimagazine/article/view/18140", estimatedMinutes: 90, difficulty: "MEDIUM" }, { title: "VMLS ch 4 (Clustering)", domain: "MATH_STATS", type: "READING", estimatedMinutes: 45 }] },
  { date: "2026-07-21", items: [{ title: "NC Graphs #7 — Walls and Gates", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/walls-and-gates/", estimatedMinutes: 40, difficulty: "MEDIUM" }, { title: "Netflix Tech Blog post #1 — most recent recsys post", domain: "ML_RECSYS", type: "READING", url: "https://netflixtechblog.com/tagged/recommendations", estimatedMinutes: 45 }, { title: "VMLS ch 5 + learncpp ch 14.1–14.4", domain: "MATH_STATS", type: "READING", estimatedMinutes: 45 }] },
  { date: "2026-07-23", items: [{ title: "NC Graphs #9 — Course Schedule II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/course-schedule-ii/", estimatedMinutes: 45, difficulty: "MEDIUM" }, { title: "Paper #17 FULL READ: Joachims et al. Counterfactual Learning-to-Rank", domain: "ML_RECSYS", type: "PAPER", url: "https://dl.acm.org/doi/10.1145/3077136.3080685", estimatedMinutes: 75, difficulty: "HARD" }, { title: "VMLS ch 7 + learncpp ch 14.8–14.10", domain: "MATH_STATS", type: "READING", estimatedMinutes: 45 }] },
  { date: "2026-07-25", items: [{ title: "NC Graphs #11 — Number of Connected Components + #12 Graph Valid Tree", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Paper #18 FULL READ: Schnabel et al. Recommendations as Treatments", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/1602.05352", estimatedMinutes: 60, difficulty: "MEDIUM" }, { title: "Netflix Tech Blog post #3", domain: "ML_RECSYS", type: "READING", estimatedMinutes: 30 }] },
  { date: "2026-07-26", items: [{ title: "NC Graphs #13 — Word Ladder", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/word-ladder/", estimatedMinutes: 60, difficulty: "HARD" }, { title: "Netflix Tech Blog post #4", domain: "ML_RECSYS", type: "READING", estimatedMinutes: 30 }, { title: "Write synthesis: 'what to expect doing recsys at scale at Netflix'", domain: "ML_RECSYS", type: "REVIEW", estimatedMinutes: 60 }] },
  // Week 14 — Frontier papers
  { date: "2026-07-27", items: [{ title: "NC Advanced Graphs #1 — Reconstruct Itinerary", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/reconstruct-itinerary/", estimatedMinutes: 60, difficulty: "HARD" }, { title: "Paper #19 FULL READ: Tay et al. Transformer Memory as Differentiable Search Index", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/2202.06991", estimatedMinutes: 75, difficulty: "HARD" }, { title: "VMLS ch 8 (Linear equations)", domain: "MATH_STATS", type: "READING", estimatedMinutes: 40 }] },
  { date: "2026-07-28", items: [{ title: "NC Advanced Graphs #2 — Min Cost to Connect Points", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/min-cost-to-connect-all-points/", estimatedMinutes: 45, difficulty: "MEDIUM" }, { title: "Paper #20 FULL READ: Rajput et al. TIGER: Generative Retrieval with Semantic IDs", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/2305.05065", estimatedMinutes: 75, difficulty: "HARD" }, { title: "VMLS ch 9 (Linear dynamical systems)", domain: "MATH_STATS", type: "READING", estimatedMinutes: 40 }] },
  { date: "2026-07-30", items: [{ title: "NC Advanced Graphs #4 — Cheapest Flights Within K Stops", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", estimatedMinutes: 45, difficulty: "MEDIUM" }, { title: "Paper #21 FULL READ: Zhai et al. HSTU / Actions Speak Louder than Words", domain: "ML_RECSYS", type: "PAPER", url: "https://arxiv.org/abs/2402.17152", estimatedMinutes: 90, difficulty: "HARD" }, { title: "VMLS ch 10", domain: "MATH_STATS", type: "READING", estimatedMinutes: 40 }] },
  { date: "2026-07-31", items: [{ title: "NC 1-D DP #1 — Climbing Stairs", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/climbing-stairs/", estimatedMinutes: 25, difficulty: "EASY" }, { title: "Re-read Paper #21 + write conceptual arc note: CF→DLRM→Two-Tower→MMoE→HSTU", domain: "ML_RECSYS", type: "REVIEW", estimatedMinutes: 60 }, { title: "Netflix Tech Blog post #6", domain: "ML_RECSYS", type: "READING", estimatedMinutes: 30 }] },
  { date: "2026-08-01", items: [{ title: "NC 1-D DP #2 + #3 — Min Cost Climbing Stairs + House Robber", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/min-cost-climbing-stairs/", estimatedMinutes: 50, difficulty: "EASY" }, { title: "Netflix Tech Blog posts #7 and #8", domain: "ML_RECSYS", type: "READING", estimatedMinutes: 60 }, { title: "Mock interview: explain a recent paper in 5 min out loud", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 }] },
  { date: "2026-08-02", items: [{ title: "NC 1-D DP #4 — House Robber II (light day)", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/house-robber-ii/", estimatedMinutes: 35, difficulty: "MEDIUM" }, { title: "Skim paper notes — re-read 3 flagged as 'want to remember'", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 45 }, { title: "Final Phase 4 retrospective + plan roadmaps for Aug 4 onward", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 40 }] },
]

const ADVANCED_LEETCODE_BY_DATE: Record<string, ScheduleItem> = {
  "2026-04-27": { title: "Python Drill — Subarray Sum Equals K", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/subarray-sum-equals-k/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-04-28": { title: "Python Drill — Binary Tree Maximum Path Sum", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-04-29": { title: "Python Drill — Accounts Merge", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/accounts-merge/", estimatedMinutes: 55, difficulty: "MEDIUM" },
  "2026-04-30": { title: "Python Drill — Longest Increasing Subsequence", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/longest-increasing-subsequence/", estimatedMinutes: 50, difficulty: "MEDIUM" },
  "2026-05-01": { title: "Python Drill — Design Add and Search Words", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", estimatedMinutes: 55, difficulty: "MEDIUM" },
  "2026-05-02": { title: "Python Drill — Word Ladder", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/word-ladder/", estimatedMinutes: 75, difficulty: "HARD" },
  "2026-05-03": { title: "Python Drill — Task Scheduler", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/task-scheduler/", estimatedMinutes: 50, difficulty: "MEDIUM" },
  "2026-05-04": { title: "Python Drill — Find Median from Data Stream", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/find-median-from-data-stream/", estimatedMinutes: 60, difficulty: "HARD" },
  "2026-05-05": { title: "Python Drill — Course Schedule II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/course-schedule-ii/", estimatedMinutes: 50, difficulty: "MEDIUM" },
  "2026-05-06": { title: "Python Drill — Decode Ways", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/decode-ways/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-05-07": { title: "Python Drill — Minimum Window Substring", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/minimum-window-substring/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-05-08": { title: "Python Drill — LRU Cache", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/lru-cache/", estimatedMinutes: 60, difficulty: "MEDIUM" },
  "2026-05-09": { title: "Python Drill — Alien Dictionary", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/alien-dictionary/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-05-10": { title: "Python Drill — Trapping Rain Water", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/trapping-rain-water/", estimatedMinutes: 60, difficulty: "HARD" },
  "2026-05-11": { title: "Python Drill — Kth Smallest Element in a BST", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", estimatedMinutes: 40, difficulty: "MEDIUM" },
  "2026-05-12": { title: "Python Drill — Shortest Path in Binary Matrix", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/", estimatedMinutes: 50, difficulty: "MEDIUM" },
  "2026-05-13": { title: "Python Drill — Jump Game II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/jump-game-ii/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-05-14": { title: "Python Drill — Largest Rectangle in Histogram", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-05-15": { title: "Python Drill — Palindromic Substrings", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/palindromic-substrings/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-05-16": { title: "Python Drill — Word Search II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/word-search-ii/", estimatedMinutes: 75, difficulty: "HARD" },
  "2026-05-17": { title: "Python Review — redo 2 misses without looking; write idiomatic Python notes", domain: "LEETCODE", type: "REVIEW", estimatedMinutes: 60 },
  "2026-05-18": { title: "Python Drill — Reconstruct Itinerary", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/reconstruct-itinerary/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-05-19": { title: "Python Drill — Meeting Rooms II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/meeting-rooms-ii/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-05-20": { title: "Python Drill — Number of Islands II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/number-of-islands-ii/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-05-21": { title: "Python Drill — Coin Change II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/coin-change-ii/", estimatedMinutes: 50, difficulty: "MEDIUM" },
  "2026-05-22": { title: "Python Drill — Serialize and Deserialize Binary Tree", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", estimatedMinutes: 60, difficulty: "HARD" },
  "2026-05-23": { title: "Python Drill — Next Greater Element III", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/next-greater-element-iii/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-05-24": { title: "Python Drill — Sliding Window Maximum", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/sliding-window-maximum/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-05-25": { title: "Python Drill — Random Pick with Weight", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/random-pick-with-weight/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-05-26": { title: "Python Drill — Split Array Largest Sum", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/split-array-largest-sum/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-05-27": { title: "Python Drill — Maximal Square", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/maximal-square/", estimatedMinutes: 50, difficulty: "MEDIUM" },
  "2026-05-28": { title: "Python Drill — Minimum Cost to Connect Sticks", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/minimum-cost-to-connect-sticks/", estimatedMinutes: 40, difficulty: "MEDIUM" },
  "2026-05-29": { title: "Python Drill — Edit Distance", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/edit-distance/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-05-30": { title: "Python Drill — Design In-Memory File System", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/design-in-memory-file-system/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-05-31": { title: "Python Drill — Median of Two Sorted Arrays", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-06-01": { title: "Python Drill — Evaluate Division", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/evaluate-division/", estimatedMinutes: 50, difficulty: "MEDIUM" },
  "2026-06-05": { title: "Python Drill — Insert Delete GetRandom O(1)", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/insert-delete-getrandom-o1/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-06-12": { title: "Python Drill — Merge k Sorted Lists", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/merge-k-sorted-lists/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-06-16": { title: "Python Drill — Maximum Product Subarray", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/maximum-product-subarray/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-06-19": { title: "Python Drill — Longest Increasing Path in a Matrix", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-06-26": { title: "Python Drill — Design Search Autocomplete System", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/design-search-autocomplete-system/", estimatedMinutes: 75, difficulty: "HARD" },
  "2026-06-27": { title: "Python Drill — Kth Largest Element in an Array", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", estimatedMinutes: 45, difficulty: "MEDIUM" },
  "2026-06-28": { title: "Python Drill — N-Queens", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/n-queens/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-07-02": { title: "Python Drill — Cheapest Flights Within K Stops", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", estimatedMinutes: 55, difficulty: "MEDIUM" },
  "2026-07-03": { title: "Python Drill — Max Points on a Line", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/max-points-on-a-line/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-07-07": { title: "Python Drill — Maximum Profit in Job Scheduling", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-07-08": { title: "Python Drill — Minimum Number of Refueling Stops", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-07-10": { title: "Python Drill — Bus Routes", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/bus-routes/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-07-14": { title: "Python Drill — Swim in Rising Water", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/swim-in-rising-water/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-07-15": { title: "Python Drill — Remove Invalid Parentheses", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/remove-invalid-parentheses/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-07-17": { title: "Python Drill — Shortest Subarray with Sum at Least K", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-07-20": { title: "Python Drill — Count of Smaller Numbers After Self", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", estimatedMinutes: 75, difficulty: "HARD" },
  "2026-07-21": { title: "Python Drill — Basic Calculator", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/basic-calculator/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-07-23": { title: "Python Drill — Race Car", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/race-car/", estimatedMinutes: 75, difficulty: "HARD" },
  "2026-07-25": { title: "Python Drill — Minimum Window Subsequence", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/minimum-window-subsequence/", estimatedMinutes: 65, difficulty: "HARD" },
  "2026-07-26": { title: "Python Drill — Word Break II", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/word-break-ii/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-07-27": { title: "Python Drill — Expression Add Operators", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/expression-add-operators/", estimatedMinutes: 75, difficulty: "HARD" },
  "2026-07-28": { title: "Python Drill — Minimum Cost to Make at Least One Valid Path in a Grid", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-07-30": { title: "Python Drill — Number of Ways to Stay in the Same Place After Some Steps", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/number-of-ways-to-stay-in-the-same-place-after-some-steps/", estimatedMinutes: 60, difficulty: "HARD" },
  "2026-07-31": { title: "Python Drill — Regular Expression Matching", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/regular-expression-matching/", estimatedMinutes: 75, difficulty: "HARD" },
  "2026-08-01": { title: "Python Drill — Best Time to Buy and Sell Stock IV", domain: "LEETCODE", type: "PROBLEM", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/", estimatedMinutes: 70, difficulty: "HARD" },
  "2026-08-02": { title: "Python Review — timed mixed set: one graph, one DP, one design", domain: "LEETCODE", type: "REVIEW", estimatedMinutes: 75 },
}

const LEARNCPP_MAINTENANCE_TITLES = new Set([
  "learncpp ch 0",
  "learncpp ch 1 finish",
  "learncpp ch 4 finish",
  "learncpp ch 5 finish",
  "learncpp ch 6 finish",
  "learncpp ch 10 finish",
  "learncpp ch 14 light review",
])

const RECSYS_PROJECT_BY_DATE: Record<string, ScheduleItem[]> = {
  "2026-04-29": [{ title: "Project: set up RecSys notebooks repo", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-05-01": [{ title: "Project: matrix factorization skeleton", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-05-05": [{ title: "Project: matrix factorization forward pass", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-05-07": [{ title: "Project: train MF on toy user-item data", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 75 }],
  "2026-05-09": [{ title: "Project: MF loss curves and notes", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-05-12": [{ title: "Project: BPR loss implementation", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 75 }],
  "2026-05-14": [{ title: "Project: negative sampling experiment", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-05-16": [{ title: "Project: compare MF vs BPR notes", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-05-19": [{ title: "Project: offline eval metrics skeleton", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-05-21": [{ title: "Project: recall@K and precision@K", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-05-22": [{ title: "Project: NDCG and MAP", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-05-26": [{ title: "Project: two-tower dataset prep", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-05-28": [{ title: "Project: two-tower model skeleton", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 75 }],
  "2026-05-30": [{ title: "Project: train two-tower toy model", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 90 }],
  "2026-06-02": [{ title: "Project: two-tower retrieval eval", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-06-04": [{ title: "Project: batch negatives experiment", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-06-06": [{ title: "Project: retrieval notebook README", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-06-09": [{ title: "Project: simple ranking feature table", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-06-11": [{ title: "Project: train ranking baseline", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 75 }],
  "2026-06-16": [{ title: "Project: retrieval/ranking system diagram", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-06-17": [{ title: "Project: ranking eval metrics", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-06-20": [{ title: "Project: feature crossing and embeddings toy example", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-06-23": [{ title: "Project: sampling bias notebook", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-06-25": [{ title: "Project: batch negatives vs sampled negatives", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-06-29": [{ title: "Project: refactor RecSys notebooks", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-07-01": [{ title: "Project: ranking model improvements", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 75 }],
  "2026-07-04": [{ title: "Project: multitask toy sketch", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-07-09": [{ title: "Project: simple sequential recommender setup", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 75 }],
  "2026-07-11": [{ title: "Project: embeddings plus dense features toy model", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-07-16": [{ title: "Project: graph recommendation sketch", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-07-18": [{ title: "Project: calibration toy example", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-07-22": [{ title: "Project: end-to-end RecSys diagram", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-07-24": [{ title: "Project: counterfactual eval notes", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 60 }],
  "2026-07-29": [{ title: "Project: final RecSys portfolio notebook cleanup", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 75 }],
}

const SYNTHESIS_REVIEW_BY_DATE: Record<string, ScheduleItem[]> = {
  "2026-05-03": [{ title: "Publish/Synthesis: what backprop computes", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-05-10": [{ title: "Review: explain matrix factorization in 60 seconds", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 }],
  "2026-05-17": [{ title: "Publish/Synthesis: MF vs BPR comparison draft", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-05-24": [{ title: "Publish/Synthesis: how to evaluate recommenders", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-05-31": [{ title: "Review: explain retrieval vs ranking", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 }],
  "2026-06-07": [{ title: "Publish/Synthesis: two-tower learning note", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-06-14": [{ title: "Review: candidate generation and ranking split", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 }],
  "2026-06-21": [{ title: "Publish/Synthesis: retrieval/ranking explainer", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-06-28": [{ title: "Review: two-tower and Word Search synthesis", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 }],
  "2026-07-05": [{ title: "Publish/Synthesis: multitask learning summary", domain: "ML_RECSYS", type: "PROJECT", estimatedMinutes: 45 }],
  "2026-07-12": [{ title: "Review: explain DLRM in 60 seconds", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 30 }],
  "2026-07-19": [{ title: "Review: Netflix-style system design outline", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 45 }],
  "2026-07-26": [{ title: "Review: what RecSys at Netflix likely involves", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 45 }],
  "2026-08-02": [{ title: "Review: final retrospective and next roadmap planning", domain: "REVIEW", type: "REVIEW", estimatedMinutes: 45 }],
}

const baseScheduleByDate = new Map(baseSchedule.map((day) => [day.date, day]))

const scheduleDates = Array.from(
  new Set([
    ...baseSchedule.map((day) => day.date),
    ...Object.keys(RECSYS_PROJECT_BY_DATE),
    ...Object.keys(SYNTHESIS_REVIEW_BY_DATE),
  ])
).sort()

const schedule: DayPlan[] = scheduleDates.map((date) => {
  const baseDay = baseScheduleByDate.get(date)
  const items = (baseDay?.items ?? [])
    .map((item) =>
      item.domain === "LEETCODE" ? ADVANCED_LEETCODE_BY_DATE[date] ?? item : item
    )
    .flatMap(splitCombinedLearnCppItem)
    .map((item) => normalizeLearnCppMaintenance(date, item))
    .filter(keepLearnCppMaintenance)

  return {
    date,
    items: [
      ...items,
      ...(RECSYS_PROJECT_BY_DATE[date] ?? []),
      ...(SYNTHESIS_REVIEW_BY_DATE[date] ?? []),
    ],
  }
})

const splitLearnCppTitles = baseSchedule
  .flatMap((day) => day.items)
  .filter((item) => item.title.includes(" + learncpp "))
  .map((item) => item.title)

// Roadmap definitions — one per domain/resource
const ROADMAPS = [
  { title: "Karpathy Zero to Hero", domain: "ML_RECSYS" as Domain, description: "Neural Networks: Zero to Hero — build everything from scratch including GPT", targetRole: "ML Engineer" },
  { title: "Advanced Python LeetCode", domain: "LEETCODE" as Domain, description: "Shuffled medium-hard interview problems for rebuilding speed in Python", targetRole: "SWE / ML Engineer" },
  { title: "3Blue1Brown — Essence of Linear Algebra", domain: "MATH_STATS" as Domain, description: "16-episode intuition-first linear algebra series" },
  { title: "Stat 110 — Harvard Probability", domain: "MATH_STATS" as Domain, description: "Joe Blitzstein's 34-lecture probability course", targetRole: "Quant / ML" },
  { title: "RecSys MOOC (UMN)", domain: "ML_RECSYS" as Domain, description: "University of Minnesota Recommender Systems Specialization (5 courses)", targetRole: "Netflix RecSys ML" },
  { title: "RecSys Mini-Implementations", domain: "ML_RECSYS" as Domain, description: "Hands-on notebooks for matrix factorization, BPR, two-tower retrieval, ranking, and offline evaluation", targetRole: "Netflix RecSys ML" },
  { title: "RecSys Foundations — 22 Papers", domain: "ML_RECSYS" as Domain, description: "Industrial RecSys paper sequence from classical CF to frontier generative retrieval", targetRole: "Netflix RecSys ML" },
  { title: "Netflix Tech Blog Deep Dive", domain: "ML_RECSYS" as Domain, description: "Recent Netflix Tech Blog recsys posts", targetRole: "Netflix RecSys ML" },
  { title: "learncpp.com", domain: "CPP_SYSTEMS" as Domain, description: "Comprehensive C++17/20 tutorial — read linearly" },
  { title: "VMLS — Applied Linear Algebra", domain: "MATH_STATS" as Domain, description: "Boyd's Introduction to Applied Linear Algebra (free PDF)" },
  { title: "Weekly Review", domain: "REVIEW" as Domain, description: "Weekly retrospectives and spaced review sessions" },
]

async function main() {
  console.log("Seeding database…")

  // Upsert user
  const user = await db.user.upsert({
    where: { email: SEED_USER.email },
    create: SEED_USER,
    update: {},
  })
  console.log(`User: ${user.name} (${user.id})`)

  // Create roadmaps
  const roadmapMap: Record<string, string> = {} // title → id
  for (const rm of ROADMAPS) {
    const existing = await db.roadmap.findFirst({
      where:
        rm.domain === "LEETCODE"
          ? { userId: user.id, domain: "LEETCODE" }
          : { userId: user.id, title: rm.title },
    })
    const roadmap = existing
      ? await db.roadmap.update({
          where: { id: existing.id },
          data: { ...rm, status: "ACTIVE", priority: ROADMAPS.indexOf(rm) },
        })
      : await db.roadmap.create({
          data: { userId: user.id, ...rm, priority: ROADMAPS.indexOf(rm) },
        })
    roadmapMap[rm.title] = roadmap.id
  }

  const advancedLeetcodeTitles = schedule
    .flatMap((day) => day.items)
    .filter((item) => item.domain === "LEETCODE")
    .map((item) => item.title)

  await db.roadmapItem.deleteMany({
    where: {
      roadmapId: roadmapMap["Advanced Python LeetCode"],
      title: { notIn: advancedLeetcodeTitles },
    },
  })

  await db.roadmapItem.deleteMany({
    where: {
      title: { in: splitLearnCppTitles },
      sessions: { none: {} },
    },
  })

  const activeLearnCppTitles = schedule
    .flatMap((day) => day.items)
    .filter(isLearnCppItem)
    .map((item) => item.title)

  await db.roadmapItem.deleteMany({
    where: {
      roadmapId: roadmapMap["learncpp.com"],
      title: { notIn: activeLearnCppTitles },
      sessions: { none: {} },
    },
  })

  const activeRecSysProjectTitles = schedule
    .flatMap((day) => day.items)
    .filter((item) => item.title.startsWith("Project:") || item.title.startsWith("Publish/Synthesis:"))
    .map((item) => item.title)

  await db.roadmapItem.deleteMany({
    where: {
      roadmapId: roadmapMap["RecSys Mini-Implementations"],
      title: { notIn: activeRecSysProjectTitles },
      sessions: { none: {} },
    },
  })

  // Helper — map domain → roadmap
  function pickRoadmap(domain: Domain, title: string, type: string): string {
    if (domain === "LEETCODE") return roadmapMap["Advanced Python LeetCode"]
    if (domain === "REVIEW") return roadmapMap["Weekly Review"]
    if (domain === "CPP_SYSTEMS") return roadmapMap["learncpp.com"]
    if (title.startsWith("Project:") || title.startsWith("Publish/Synthesis:")) return roadmapMap["RecSys Mini-Implementations"]
    if (title.includes("3B1B") || title.includes("Linalg")) return roadmapMap["3Blue1Brown — Essence of Linear Algebra"]
    if (title.includes("Stat 110")) return roadmapMap["Stat 110 — Harvard Probability"]
    if (title.includes("VMLS")) return roadmapMap["VMLS — Applied Linear Algebra"]
    if (title.includes("MOOC")) return roadmapMap["RecSys MOOC (UMN)"]
    if (title.includes("Karpathy") || title.includes("micrograd") || title.includes("bigram") || title.includes("MLP") || title.includes("BatchNorm") || title.includes("backprop") || title.includes("GPT")) return roadmapMap["Karpathy Zero to Hero"]
    if (type === "PAPER" || title.startsWith("Paper #")) return roadmapMap["RecSys Foundations — 22 Papers"]
    if (title.includes("Netflix Tech Blog")) return roadmapMap["Netflix Tech Blog Deep Dive"]
    return roadmapMap["RecSys MOOC (UMN)"]
  }

  // Seed schedule items
  let totalCreated = 0
  for (const day of schedule) {
    const scheduledDate = new Date(day.date + "T09:00:00.000Z")
    for (let i = 0; i < day.items.length; i++) {
      const item = day.items[i]
      const roadmapId = pickRoadmap(item.domain, item.title, item.type)
      const existing = await db.roadmapItem.findFirst({
        where: { roadmapId, title: item.title },
      })
      const data = {
        roadmapId,
        title: item.title,
        type: item.type,
        url: item.url,
        estimatedMinutes: item.estimatedMinutes,
        difficulty: item.difficulty,
        scheduledDate,
        sequenceOrder: i,
      }
      if (existing) {
        await db.roadmapItem.update({
          where: { id: existing.id },
          data,
        })
      } else {
        await db.roadmapItem.create({ data })
        totalCreated++
      }
    }
  }

  console.log(`Created ${totalCreated} schedule items across ${schedule.length} days`)
  console.log("Done! Seed complete.")
}

function splitCombinedLearnCppItem(item: ScheduleItem): ScheduleItem[] {
  const marker = " + learncpp "
  if (!item.title.includes(marker)) return [item]

  const [primaryTitle, learnCppSuffix] = item.title.split(marker)
  const cppMinutes = Math.min(35, Math.max(20, Math.round(item.estimatedMinutes * 0.4)))
  const primaryMinutes = Math.max(20, item.estimatedMinutes - cppMinutes)

  return [
    {
      ...item,
      title: primaryTitle,
      estimatedMinutes: primaryMinutes,
    },
    {
      title: `learncpp ${learnCppSuffix}`,
      domain: "CPP_SYSTEMS",
      type: "READING",
      url: "https://www.learncpp.com/",
      estimatedMinutes: cppMinutes,
    },
  ]
}

function normalizeLearnCppMaintenance(date: string, item: ScheduleItem): ScheduleItem {
  if (date === "2026-07-21" && isLearnCppItem(item) && item.title.includes("ch 14")) {
    return {
      ...item,
      title: "learncpp ch 14 light review",
      estimatedMinutes: 30,
    }
  }

  return item
}

function keepLearnCppMaintenance(item: ScheduleItem): boolean {
  return !isLearnCppItem(item) || LEARNCPP_MAINTENANCE_TITLES.has(item.title)
}

function isLearnCppItem(item: ScheduleItem): boolean {
  return item.domain === "CPP_SYSTEMS" && item.title.startsWith("learncpp ")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
