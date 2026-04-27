import { Domain } from "@prisma/client"

export const DOMAIN_META: Record<
  Domain,
  { label: string; color: string; bg: string }
> = {
  ML_RECSYS: {
    label: "ML / RecSys",
    color: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  LEETCODE: {
    label: "LeetCode",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  MATH_STATS: {
    label: "Math / Stats",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  CPP_SYSTEMS: {
    label: "C++ / Systems",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  DISTRIBUTED_TRAINING: {
    label: "Distributed Training",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  REVIEW: {
    label: "Review",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  OTHER: {
    label: "Other",
    color: "text-gray-700 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-900/30",
  },
}

export const DIFFICULTY_META = {
  EASY: { label: "Easy", color: "text-emerald-600" },
  MEDIUM: { label: "Medium", color: "text-amber-600" },
  HARD: { label: "Hard", color: "text-red-600" },
} as const
