import { PrismaClient, Domain, ItemType, Difficulty } from "@prisma/client"
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
}

type DayPlan = {
  date: string
  items: ScheduleItem[]
}

const DEEP_ML_URL = "https://www.deep-ml.com/playlist/qvTWj08Ak0vsl7ZZp6Xz"

function minutes(time: string | undefined) {
  if (!time) return null
  const [hours, mins] = time.split(":").map(Number)
  return hours * 60 + mins
}

function duration(start: string | undefined, end: string | undefined) {
  const startMinutes = minutes(start)
  const endMinutes = minutes(end)
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return 45
  }
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
  difficulty?: Difficulty
): ScheduleItem {
  return { title, domain, type, start, end, description, url, difficulty }
}

function deepMl(range: string, start: string, end: string, note?: string) {
  return item(
    `Deep-ML ${range}`,
    "LEETCODE",
    "PROBLEM",
    start,
    end,
    [
      "Work through the listed Deep-ML playlist positions in order.",
      "First pass without solutions; read the learn section after 20 minutes stuck; inspect solution after 35 minutes, then reimplement from memory.",
      note ?? "Track each problem as Solved, Learn-assisted, Solution-assisted, or Redo.",
    ].join(" "),
    DEEP_ML_URL,
    "MEDIUM"
  )
}

function fullDay(date: string, range: string, reading: string, quant: string): DayPlan {
  return {
    date,
    items: [
      deepMl(range, "09:00", "15:30"),
      item(reading, "ML_RECSYS", "READING", "15:45", "17:15", "Read actively: write three bullets and one interview takeaway."),
      item(quant, "MATH_STATS", "REVIEW", "17:30", "19:00", "Do focused quant stats/probability drills and record misses."),
      item("Daily review", "REVIEW", "REVIEW", "19:00", "19:30", "Log Deep-ML misses, formulas, implementation patterns, and next-day carryovers."),
    ],
  }
}

function halfDay(date: string, range: string, reading: string, quant: string): DayPlan {
  return {
    date,
    items: [
      deepMl(range, "09:30", "12:00", "Half-load day: complete only this 5-problem set."),
      item(reading, "ML_RECSYS", "READING", "13:00", "13:45", "Short annotated read; three bullets are enough."),
      item(quant, "MATH_STATS", "REVIEW", "14:00", "14:45", "Short focused drill; record misses only."),
      item("Daily review", "REVIEW", "REVIEW", "15:15", "15:30", "Capture misses and next-day carryovers."),
    ],
  }
}

function travelDay(date: string, includeCodestar = false): DayPlan {
  return {
    date,
    items: [
      item("Travel block", "OTHER", "REVIEW", "09:00", "17:00", "No scheduled curriculum work."),
      ...(includeCodestar
        ? [item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; keep this time occupied.")]
        : []),
    ],
  }
}

const schedule: DayPlan[] = [
  fullDay("2026-04-30", "005-014", "Netflix architecture/recsys blog", "Probability basics"),
  fullDay("2026-05-01", "015-024", "RecSys foundations", "Conditional probability and Bayes"),
  halfDay("2026-05-02", "025-029", "Recommendations ranking paper", "Random variables"),
  {
    date: "2026-05-03",
    items: [
      deepMl("030-034", "07:30", "09:30", "Early block before Codestar."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      deepMl("035-039", "16:30", "19:00", "Finish the Sunday Deep-ML set after Codestar."),
      item("Workshop paper", "ML_RECSYS", "PAPER", "19:00", "20:00", "Short active read with three bullets."),
      item("Expectation and variance", "MATH_STATS", "REVIEW", "20:00", "21:00", "Quant drill block."),
      item("Review/admin", "REVIEW", "REVIEW", "21:00", "21:30", "Log misses and prepare Monday."),
    ],
  },
  {
    date: "2026-05-04",
    items: [
      item("Recruiter admin", "REVIEW", "REVIEW", "08:30", "09:00", "Reply to new messages and schedule calls."),
      deepMl("040-049", "09:00", "14:45"),
      item("Film UChicago 1-minute video", "OTHER", "PROJECT", "15:00", "16:00", "Record the final take and save it."),
      item("Netflix experimentation blog", "ML_RECSYS", "READING", "16:15", "17:30", "Read actively and write one interview takeaway."),
      item("Common distributions", "MATH_STATS", "REVIEW", "17:45", "19:15", "Quant drill block."),
      item("Daily review", "REVIEW", "REVIEW", "19:15", "19:45", "List distribution assumptions and traps."),
    ],
  },
  fullDay("2026-05-05", "050-059", "Candidate generation paper", "Concentration, LLN, and CLT"),
  fullDay("2026-05-06", "060-069", "Retrieval/ranking paper", "Weekly mixed drill"),
  travelDay("2026-05-07"),
  travelDay("2026-05-08"),
  travelDay("2026-05-09"),
  travelDay("2026-05-10", true),
  travelDay("2026-05-11"),
  fullDay("2026-05-12", "070-079", "Netflix engineering or experimentation post", "Point estimation and sampling error"),
  halfDay("2026-05-13", "080-084", "RecSys paper on ranking or retrieval", "Confidence intervals"),
  halfDay("2026-05-14", "085-089", "Workshop paper on recommender systems", "Hypothesis testing"),
  halfDay("2026-05-15", "090-094", "Related recommendations ML paper", "P-values, power, and sample size"),
  halfDay("2026-05-16", "095-099", "Netflix personalization or experimentation post", "A/B testing design"),
  {
    date: "2026-05-17",
    items: [
      deepMl("100-101", "08:30", "09:30", "Early block before Codestar."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      deepMl("102-104", "16:30", "18:00", "Finish the half-load Deep-ML set."),
      item("RecSys paper on evaluation", "ML_RECSYS", "PAPER", "18:00", "18:45", "Short annotated read."),
      item("Multiple testing and false discovery", "MATH_STATS", "REVIEW", "18:45", "19:30", "Short quant drill."),
      item("Review/admin", "REVIEW", "REVIEW", "19:30", "20:00", "Urgent replies and mistake log."),
    ],
  },
  halfDay("2026-05-18", "105-109", "Workshop paper or invited talk paper", "Weekly mixed estimation/testing drill"),
  halfDay("2026-05-19", "110-114", "Netflix ML systems or personalization blog", "Linear regression assumptions"),
  halfDay("2026-05-20", "115-119", "RecSys paper on learning-to-rank", "Least squares and normal equations"),
  halfDay("2026-05-21", "120-124", "Workshop paper on recommendation modeling", "Logistic regression and odds"),
  halfDay("2026-05-22", "125-129", "RecSys paper with temporal dynamics", "Autocorrelation"),
  halfDay("2026-05-23", "130-134", "Workshop paper on temporal recommendation", "Stationarity"),
  {
    date: "2026-05-24",
    items: [
      deepMl("135-136", "08:30", "09:30", "Finish the 136-problem playlist."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      item("Final synthesis read", "ML_RECSYS", "READING", "16:30", "17:15", "Choose the highest-signal Netflix, RecSys, workshop, or recommendations ML read."),
      item("Mixed probability/statistics repair drill", "MATH_STATS", "REVIEW", "17:15", "18:00", "Patch the weakest quant topics from the sprint."),
      item("Recruiter admin", "REVIEW", "REVIEW", "18:00", "18:30", "Close open recruiter loops and set next prep schedule."),
      item("Final review", "REVIEW", "REVIEW", "18:30", "19:30", "Build redo list, top formulas, and next 1-week maintenance plan."),
    ],
  },
  {
    date: "2026-05-26",
    items: [
      item("Recruiter admin", "REVIEW", "REVIEW", "10:00", "10:30", "Reply to recruiter emails, confirm availability, and update interview next steps."),
    ],
  },
  {
    date: "2026-05-29",
    items: [
      item("Recruiter admin", "REVIEW", "REVIEW", "10:00", "10:30", "Reply to recruiter emails, confirm availability, and update interview next steps."),
    ],
  },
]

const ROADMAPS = [
  { title: "Deep-ML Practice", domain: "LEETCODE" as Domain, description: "136-problem Deep-ML playlist completion sprint", priority: 0 },
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
  const scheduledDates = schedule.map((day) => new Date(`${day.date}T09:00:00.000Z`))

  await db.roadmapItem.deleteMany({
    where: {
      roadmapId: { in: activeRoadmapIds },
      scheduledDate: { in: scheduledDates },
      sessions: { none: {} },
      title: { in: ["Recruiter admin", "Urgent recruiter check"] },
    },
  })

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
        estimatedMinutes: duration(scheduleItem.start, scheduleItem.end),
        scheduledStartMinutes: start,
        scheduledEndMinutes: end,
        difficulty: scheduleItem.difficulty,
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
