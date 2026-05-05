import {
  PrismaClient,
  Domain,
  ItemStatus,
  ItemType,
  Difficulty,
} from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const SEED_USER = {
  email: "alice.yh7@gmail.com",
  name: "Alice",
}

type ScheduleItem = {
  title: string
  domain: Domain
  type: ItemType
  start?: string
  end?: string
  url?: string
  description?: string
  difficulty?: Difficulty
  status?: ItemStatus
  estimatedMinutes?: number
}

type DayPlan = {
  date: string
  items: ScheduleItem[]
}

const DEEP_ML_URL = "https://www.deep-ml.com/playlist/qvTWj08Ak0vsl7ZZp6Xz"
const DEEP_MIND_INTERVIEW_PREP_URL =
  "https://www.deep-ml.com/collections/DeepMind%20Interview%20Prep"

const readingQueue = [
  "Netflix architecture/recsys blog",
  "RecSys foundations",
  "Recommendations ranking paper",
  "Workshop paper",
  "Netflix experimentation blog",
  "Candidate generation paper",
  "Retrieval/ranking paper",
  "Netflix engineering or experimentation post",
  "RecSys paper on ranking or retrieval",
  "Workshop paper on recommender systems",
  "Related recommendations ML paper",
  "Netflix personalization or experimentation post",
  "RecSys paper on evaluation",
  "Workshop paper or invited talk paper",
  "Netflix ML systems or personalization blog",
  "RecSys paper on learning-to-rank",
  "Workshop paper on recommendation modeling",
  "RecSys paper with temporal dynamics",
  "Workshop paper on temporal recommendation",
]

const quantQueue = [
  "Probability basics",
  "Conditional probability and Bayes",
  "Random variables",
  "Expectation and variance",
  "Common distributions",
  "Concentration, LLN, and CLT",
  "Weekly mixed drill",
  "Point estimation and sampling error",
  "Confidence intervals",
  "Hypothesis testing",
  "P-values, power, and sample size",
  "A/B testing design",
  "Multiple testing and false discovery",
  "Linear regression assumptions",
  "Least squares and normal equations",
  "Logistic regression and odds",
  "Autocorrelation",
  "Stationarity",
  "Mixed probability/statistics repair drill",
]

function minutes(time: string | undefined) {
  if (!time) return null
  const [hours, mins] = time.split(":").map(Number)
  return hours * 60 + mins
}

function duration(start: string | undefined, end: string | undefined) {
  const startMinutes = minutes(start)
  const endMinutes = minutes(end)
  if (startMinutes === null || endMinutes === null) {
    return 45
  }
  if (endMinutes === startMinutes) return 0
  if (endMinutes < startMinutes) return 45
  return endMinutes - startMinutes
}

function item(
  title: string,
  domain: Domain,
  type: ItemType,
  start: string,
  end: string,
  description?: string,
  url?: string,
  difficulty?: Difficulty,
  status?: ItemStatus,
  estimatedMinutes?: number
): ScheduleItem {
  return {
    title,
    domain,
    type,
    start,
    end,
    description,
    url,
    difficulty,
    status,
    estimatedMinutes,
  }
}

function calendarBlock(
  title: string,
  start: string,
  end: string,
  description: string
): ScheduleItem {
  return item(
    title,
    "OTHER",
    "PROJECT",
    start,
    end,
    description,
    undefined,
    undefined,
    undefined,
    0
  )
}

function deepMl(
  range: string,
  start: string,
  end: string,
  note?: string,
  status?: ItemStatus
) {
  return item(
    `Deep-ML ${range}`,
    "LEETCODE",
    "PROBLEM",
    start,
    end,
    [
      "Work through the listed Deep-ML playlist positions in order.",
      "Cap each problem at 30 minutes: first pass without solutions; read the learn section after 20 minutes stuck; inspect solution after 30 minutes, then reimplement from memory.",
      note ?? "Track each problem as Solved, Learn-assisted, Solution-assisted, or Redo.",
    ].join(" "),
    DEEP_ML_URL,
    "MEDIUM",
    status
  )
}

function supportBlock(index: number, start: string, end: string): ScheduleItem {
  const rotation = index % 3
  if (rotation === 0) {
    return item(
      quantQueue[index % quantQueue.length],
      "MATH_STATS",
      "REVIEW",
      start,
      end,
      "One focused drill set only; log misses and formulas that need review."
    )
  }
  if (rotation === 1) {
    return item(
      readingQueue[index % readingQueue.length],
      "ML_RECSYS",
      "READING",
      start,
      end,
      "One bounded annotated read: three bullets and one interview takeaway."
    )
  }
  return item(
    "DeepMind Interview Prep collection",
    "LEETCODE",
    "PROBLEM",
    start,
    end,
    "Use this as the support block, not extra workload. Pick one relevant collection problem or prompt, work for the timebox, and capture any redo-worthy gaps.",
    DEEP_MIND_INTERVIEW_PREP_URL,
    "MEDIUM"
  )
}

function studyDay(
  date: string,
  range: string,
  supportIndex: number,
  extras: ScheduleItem[] = []
): DayPlan {
  const hasCodestar = extras.some((extra) => extra.title === "Codestar team meeting")
  const deepStart = hasCodestar ? "08:00" : "10:00"
  const deepEnd = hasCodestar ? "09:30" : "11:30"
  const supportStart = hasCodestar ? "16:30" : "11:45"
  const supportEnd = hasCodestar ? "17:15" : "12:30"
  const reviewStart = hasCodestar ? "17:30" : "12:45"
  const reviewEnd = hasCodestar ? "17:45" : "13:00"

  return {
    date,
    items: [
      deepMl(range, deepStart, deepEnd, "Sustainable pace: three problems, 30 minutes each."),
      supportBlock(supportIndex, supportStart, supportEnd),
      ...extras,
      item("Daily review", "REVIEW", "REVIEW", reviewStart, reviewEnd, "Mark problem statuses, capture redo items, and note next-day carryovers."),
    ],
  }
}

function travelDay(date: string, includeCodestar = false): DayPlan {
  return {
    date,
    items: [
      item("Travel block", "OTHER", "REVIEW", "09:00", "09:00", "No scheduled curriculum work."),
      ...(includeCodestar
        ? [
            calendarBlock(
              "Codestar team meeting",
              "10:00",
              "16:00",
              "Side project meeting; keep this time occupied."
            ),
          ]
        : []),
    ],
  }
}

const TRAVEL_DATES = new Set([
  "2026-05-07",
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
])

const FIXED_BLOCKS: Record<string, ScheduleItem[]> = {
  "2026-05-17": [
    calendarBlock("Codestar team meeting", "10:00", "16:00", "Side project meeting; do not schedule over this."),
  ],
  "2026-05-24": [
    calendarBlock("Codestar team meeting", "10:00", "16:00", "Side project meeting; do not schedule over this."),
  ],
  "2026-05-29": [
    item("Recruiter admin", "REVIEW", "REVIEW", "15:45", "16:15", "Reply to recruiter emails, confirm availability, and update interview next steps."),
  ],
  "2026-05-31": [
    calendarBlock("Codestar team meeting", "10:00", "16:00", "Side project meeting; do not schedule over this."),
  ],
  "2026-06-07": [
    calendarBlock("Codestar team meeting", "10:00", "16:00", "Side project meeting; do not schedule over this."),
  ],
  "2026-06-14": [
    calendarBlock("Codestar team meeting", "10:00", "16:00", "Side project meeting; do not schedule over this."),
  ],
}

function deepMlRange(start: number) {
  const end = Math.min(start + 2, 136)
  const format = (value: number) => String(value).padStart(3, "0")
  return start === end ? format(start) : `${format(start)}-${format(end)}`
}

function may4Plan(): DayPlan {
  return {
    date: "2026-05-04",
    items: [
      calendarBlock("Get ready and go to MPK26", "08:00", "08:30", "Morning setup and commute to MPK26."),
      calendarBlock("UPenn research advising meeting", "08:40", "09:00", "Research advising meeting."),
      item("Write email to UChicago interviewer", "REVIEW", "REVIEW", "09:00", "09:30", "Draft and send the interviewer email."),
      deepMl("012-016", "09:30", "10:30", "One-hour cap: solve five playlist problems and mark each status."),
      calendarBlock("Mercor task 1", "10:30", "12:00", "Complete one focused Mercor task."),
      calendarBlock("Travel to MPK 14, lunch, and manager 1:1", "12:00", "13:30", "Travel to MPK 14, eat lunch, and have 1:1 with manager."),
      calendarBlock("Fitness class", "14:00", "15:00", "Fitness class."),
      calendarBlock("Go home and shower", "15:00", "15:30", "Commute home and reset."),
      item(
        "Video notes: recommender systems talk",
        "ML_RECSYS",
        "VIDEO",
        "16:00",
        "17:15",
        "Take structured notes: core idea, modeling assumptions, metrics, and one interview takeaway.",
        "https://www.youtube.com/watch?v=UGZRFSqvNng&t=3s"
      ),
      calendarBlock("Personal website plan and small improvement", "17:15", "18:00", "Make a short plan, then ship one small visible improvement."),
      item(
        "Read paper: Matrix Factorization Techniques for Recommender Systems",
        "ML_RECSYS",
        "PAPER",
        "18:00",
        "19:30",
        "Foundational RecSys read. Write three bullets on matrix factorization, implicit feedback, and evaluation; capture one interview takeaway.",
        "https://datajobs.com/data-science-repo/Recommender-Systems-[Netflix].pdf"
      ),
      calendarBlock("Dinner", "19:30", "20:30", "Dinner."),
      calendarBlock("Mercor task 2", "20:30", "23:00", "Second focused Mercor block."),
      item("Browse Substacks", "ML_RECSYS", "READING", "23:00", "23:30", "Light reading habit block before bed; save anything worth deeper reading."),
    ],
  }
}

function may5Plan(): DayPlan {
  return {
    date: "2026-05-05",
    items: [
      deepMl("017-022", "08:30", "11:30", "Six-problem sprint: keep each problem to a 30-minute cap and mark Solved, Learn-assisted, Solution-assisted, or Redo."),
      calendarBlock("Meta meetings", "11:35", "16:00", "Meeting block; do not schedule curriculum work here."),
      item(
        "RecSys learning block",
        "ML_RECSYS",
        "READING",
        "16:00",
        "17:00",
        "One focused hour on recommender systems foundations. Capture core idea, modeling assumption, metric, and one interview-ready takeaway."
      ),
      item(
        "YouTube + Substack learning",
        "ML_RECSYS",
        "READING",
        "17:00",
        "18:00",
        "Watch one relevant ML/RecSys YouTube segment and read one Substack post. Save links and write three bullets worth revisiting."
      ),
      item(
        "UChicago video interview prep",
        "REVIEW",
        "PROJECT",
        "18:00",
        "20:00",
        "Two-hour video interview block: outline talking points, write concise story bullets, rehearse aloud, and note the final filming checklist."
      ),
      calendarBlock("Mercor task", "20:00", "23:59", "Four-hour focused Mercor work block."),
    ],
  }
}

function buildSustainableSchedule(): DayPlan[] {
  const days: DayPlan[] = [may4Plan(), may5Plan()]

  let problem = 23
  let supportIndex = 1
  let cursor = new Date("2026-05-06T12:00:00.000Z")

  while (problem <= 136) {
    const date = cursor.toISOString().slice(0, 10)
    const fixedBlocks = FIXED_BLOCKS[date] ?? []

    if (TRAVEL_DATES.has(date)) {
      days.push(travelDay(date, date === "2026-05-10"))
    } else {
      days.push(studyDay(date, deepMlRange(problem), supportIndex, fixedBlocks))
      problem += 3
      supportIndex += 1
    }

    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  }

  const finalDay = days[days.length - 1]
  if (finalDay) {
    finalDay.items.push(
      item(
        "Final review",
        "REVIEW",
        "REVIEW",
        "13:15",
        "14:00",
        "Build redo list, top formulas, and next 1-week maintenance plan."
      )
    )
  }

  return days
}

const schedule: DayPlan[] = buildSustainableSchedule()

const ROADMAPS = [
  { title: "Deep-ML Practice", domain: "LEETCODE" as Domain, description: "136-problem Deep-ML playlist completion sprint at a sustainable pace", priority: 0 },
  { title: "ML / RecSys Reading", domain: "ML_RECSYS" as Domain, description: "Netflix blog posts, RecSys papers, workshop papers, and recommendations ML reading", priority: 1 },
  { title: "Quant Stats / Probability", domain: "MATH_STATS" as Domain, description: "Probability, statistics, experiments, regression, and quant research interview drills", priority: 2 },
  { title: "Review / Admin", domain: "REVIEW" as Domain, description: "Recruiter email, interview scheduling, daily review, and retrospectives", priority: 3 },
  { title: "Calendar Blocks", domain: "OTHER" as Domain, description: "Travel, Codestar meetings, video tasks, and other time-specific commitments", priority: 4 },
]

function pickRoadmapTitle(domain: Domain) {
  if (domain === "LEETCODE") return "Deep-ML Practice"
  if (domain === "ML_RECSYS") return "ML / RecSys Reading"
  if (domain === "MATH_STATS") return "Quant Stats / Probability"
  if (domain === "REVIEW") return "Review / Admin"
  return "Calendar Blocks"
}

const SEEDED_TITLE_PATTERNS = [
  /^Deep-ML (?:\d{3}|\d{3}-\d{3})$/,
  /^DeepMind Interview Prep collection$/,
  /^Progress reset$/,
  /^Get ready and go to MPK26$/,
  /^UPenn research advising meeting$/,
  /^Write email to UChicago interviewer$/,
  /^Mercor task(?: \d)?$/,
  /^Meta meetings$/,
  /^ML system design interview plan$/,
  /^RecSys learning block$/,
  /^UChicago video interview prep$/,
  /^YouTube \+ Substack learning$/,
  /^Travel to MPK 14, lunch, and manager 1:1$/,
  /^Fitness class$/,
  /^Go home and shower$/,
  /^Video notes: recommender systems talk$/,
  /^Personal website plan and small improvement$/,
  /^Read paper: Matrix Factorization Techniques for Recommender Systems$/,
  /^Dinner$/,
  /^Browse Substacks$/,
  /^Netflix /,
  /^RecSys /,
  /^Recommendations /,
  /^Workshop /,
  /^Related recommendations /,
  /^Candidate generation /,
  /^Retrieval\/ranking /,
  /^Final synthesis read$/,
  /^Probability /,
  /^Conditional probability /,
  /^Random variables$/,
  /^Expectation /,
  /^Common distributions$/,
  /^Concentration, /,
  /^Weekly mixed /,
  /^Point estimation /,
  /^Confidence intervals$/,
  /^Hypothesis testing$/,
  /^P-values, /,
  /^A\/B testing /,
  /^Multiple testing /,
  /^Linear regression /,
  /^Least squares /,
  /^Logistic regression /,
  /^Autocorrelation$/,
  /^Stationarity$/,
  /^Mixed probability\/statistics /,
  /^Daily review$/,
  /^Review\/admin$/,
  /^Final review$/,
  /^Recruiter admin$/,
  /^Urgent recruiter check$/,
  /^Travel block$/,
  /^Codestar team meeting$/,
  /^Film UChicago /,
]

async function main() {
  console.log("Seeding Lattice Deep-ML calendar…")

  const user = await db.user.upsert({
    where: { email: SEED_USER.email },
    create: SEED_USER,
    update: {},
  })

  await db.roadmap.updateMany({
    where: { userId: user.id },
    data: { status: "ARCHIVED" },
  })

  const roadmapMap: Record<string, string> = {}
  for (const roadmapDef of ROADMAPS) {
    const existing = await db.roadmap.findFirst({
      where: { userId: user.id, title: roadmapDef.title },
    })
    const roadmap = existing
      ? await db.roadmap.update({
          where: { id: existing.id },
          data: { ...roadmapDef, status: "ACTIVE" },
        })
      : await db.roadmap.create({
          data: { userId: user.id, ...roadmapDef, status: "ACTIVE" },
        })
    roadmapMap[roadmapDef.title] = roadmap.id
  }

  const activeRoadmapIds = Object.values(roadmapMap)
  const lastScheduleDate = schedule[schedule.length - 1]?.date
  const cleanupStart = new Date("2026-04-30T00:00:00.000Z")
  const cleanupEnd = new Date(
    new Date(`${lastScheduleDate}T00:00:00.000Z`).getTime() + 2 * 24 * 60 * 60 * 1000
  )

  const existingSeededItems = await db.roadmapItem.findMany({
    where: {
      roadmapId: { in: activeRoadmapIds },
      scheduledDate: {
        gte: cleanupStart,
        lt: cleanupEnd,
      },
      sessions: { none: {} },
    },
    select: { id: true, title: true },
  })

  const seededItemIds = existingSeededItems
    .filter((existing) =>
      SEEDED_TITLE_PATTERNS.some((pattern) => pattern.test(existing.title))
    )
    .map((existing) => existing.id)

  if (seededItemIds.length > 0) {
    await db.roadmapItem.deleteMany({
      where: { id: { in: seededItemIds } },
    })
  }

  let created = 0
  for (const day of schedule) {
    const scheduledDate = new Date(`${day.date}T09:00:00.000Z`)
    for (let index = 0; index < day.items.length; index++) {
      const scheduleItem = day.items[index]
      const roadmapId = roadmapMap[pickRoadmapTitle(scheduleItem.domain)]
      const start = minutes(scheduleItem.start)
      const end = minutes(scheduleItem.end)
      const existing = await db.roadmapItem.findFirst({
        where: {
          roadmapId,
          title: scheduleItem.title,
          scheduledDate,
        },
      })
      const data = {
        roadmapId,
        title: scheduleItem.title,
        description: scheduleItem.description,
        type: scheduleItem.type,
        url: scheduleItem.url,
        estimatedMinutes:
          scheduleItem.estimatedMinutes ?? duration(scheduleItem.start, scheduleItem.end),
        scheduledStartMinutes: start,
        scheduledEndMinutes: end,
        difficulty: scheduleItem.difficulty,
        status: scheduleItem.status ?? "TODO",
        scheduledDate,
        sequenceOrder: start ?? index,
      }
      if (existing) {
        await db.roadmapItem.update({ where: { id: existing.id }, data })
      } else {
        await db.roadmapItem.create({ data })
        created++
      }
    }
  }

  console.log(`Created ${created} new calendar items across ${schedule.length} days.`)
  console.log("Done.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
