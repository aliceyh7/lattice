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
}

type DayPlan = {
  date: string
  items: ScheduleItem[]
}

const DEEP_ML_URL = "https://www.deep-ml.com/playlist/qvTWj08Ak0vsl7ZZp6Xz"

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
  difficulty?: Difficulty,
  status?: ItemStatus
): ScheduleItem {
  return { title, domain, type, start, end, description, url, difficulty, status }
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
      "First pass without solutions; read the learn section after 20 minutes stuck; inspect solution after 35 minutes, then reimplement from memory.",
      note ?? "Track each problem as Solved, Learn-assisted, Solution-assisted, or Redo.",
    ].join(" "),
    DEEP_ML_URL,
    "MEDIUM",
    status
  )
}

function normalDay(
  date: string,
  range: string,
  reading: string,
  quant: string,
  extras: ScheduleItem[] = []
): DayPlan {
  return {
    date,
    items: [
      deepMl(range, "10:00", "13:00", "Reduced pace: aim for clean solutions, not volume."),
      item(reading, "ML_RECSYS", "READING", "14:00", "14:45", "One short annotated read: three bullets and one interview takeaway."),
      item(quant, "MATH_STATS", "REVIEW", "15:00", "15:45", "Short focused quant drill; log only the misses."),
      ...extras,
      item("Daily review", "REVIEW", "REVIEW", "16:00", "16:15", "Capture misses and next-day carryovers."),
    ],
  }
}

function lightDay(
  date: string,
  range: string,
  reading: string,
  quant: string,
  extras: ScheduleItem[] = []
): DayPlan {
  return {
    date,
    items: [
      deepMl(range, "10:00", "11:45", "Light day: complete this smaller problem set only."),
      item(reading, "ML_RECSYS", "READING", "13:00", "13:30", "Short skim or blog read; notes can be minimal."),
      item(quant, "MATH_STATS", "REVIEW", "13:45", "14:15", "Short drill block."),
      ...extras,
      item("Daily review", "REVIEW", "REVIEW", "14:30", "14:45", "Log carryovers."),
    ],
  }
}

function travelDay(date: string, includeCodestar = false): DayPlan {
  return {
    date,
    items: [
      item("Travel block", "OTHER", "REVIEW", "09:00", "17:00", "No scheduled curriculum work."),
      ...(includeCodestar
        ? [
            item(
              "Codestar team meeting",
              "OTHER",
              "PROJECT",
              "10:00",
              "16:00",
              "Side project meeting; keep this time occupied."
            ),
          ]
        : []),
    ],
  }
}

const schedule: DayPlan[] = [
  {
    date: "2026-04-30",
    items: [
      deepMl(
        "005",
        "10:00",
        "11:00",
        "Completed on April 30. The rest of the original April 30 workload was moved downstream.",
        "COMPLETED"
      ),
    ],
  },
  normalDay("2026-05-01", "006-010", readingQueue[0], quantQueue[0]),
  lightDay("2026-05-02", "011-013", readingQueue[1], quantQueue[1]),
  {
    date: "2026-05-03",
    items: [
      deepMl("014-016", "08:00", "09:30", "Light Sunday block before Codestar."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      item(readingQueue[2], "ML_RECSYS", "READING", "16:30", "17:00", "Short annotated read."),
      item(quantQueue[2], "MATH_STATS", "REVIEW", "17:15", "17:45", "Short drill block."),
      item("Daily review", "REVIEW", "REVIEW", "18:00", "18:15", "Log carryovers."),
    ],
  },
  normalDay("2026-05-04", "017-021", readingQueue[3], quantQueue[3], [
    item("Film UChicago 1-minute video", "OTHER", "PROJECT", "13:30", "14:30", "Record the final take and save it."),
    item("Recruiter admin", "REVIEW", "REVIEW", "15:45", "16:15", "Reply to recruiter emails, confirm availability, and update interview next steps."),
  ]),
  normalDay("2026-05-05", "022-026", readingQueue[4], quantQueue[4]),
  normalDay("2026-05-06", "027-031", readingQueue[5], quantQueue[5]),
  travelDay("2026-05-07"),
  travelDay("2026-05-08"),
  travelDay("2026-05-09"),
  travelDay("2026-05-10", true),
  travelDay("2026-05-11"),
  normalDay("2026-05-12", "032-036", readingQueue[6], quantQueue[6]),
  lightDay("2026-05-13", "037-039", readingQueue[7], quantQueue[7]),
  lightDay("2026-05-14", "040-042", readingQueue[8], quantQueue[8]),
  lightDay("2026-05-15", "043-045", readingQueue[9], quantQueue[9]),
  lightDay("2026-05-16", "046-048", readingQueue[10], quantQueue[10]),
  {
    date: "2026-05-17",
    items: [
      deepMl("049-051", "08:00", "09:30", "Light Sunday block before Codestar."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      item(readingQueue[11], "ML_RECSYS", "READING", "16:30", "17:00", "Short annotated read."),
      item(quantQueue[11], "MATH_STATS", "REVIEW", "17:15", "17:45", "Short drill block."),
      item("Daily review", "REVIEW", "REVIEW", "18:00", "18:15", "Log carryovers."),
    ],
  },
  lightDay("2026-05-18", "052-054", readingQueue[12], quantQueue[12]),
  lightDay("2026-05-19", "055-057", readingQueue[13], quantQueue[13]),
  lightDay("2026-05-20", "058-060", readingQueue[14], quantQueue[14]),
  lightDay("2026-05-21", "061-063", readingQueue[15], quantQueue[15]),
  lightDay("2026-05-22", "064-066", readingQueue[16], quantQueue[16]),
  lightDay("2026-05-23", "067-069", readingQueue[17], quantQueue[17]),
  {
    date: "2026-05-24",
    items: [
      deepMl("070-072", "08:00", "09:30", "Light Sunday block before Codestar."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      item(readingQueue[18], "ML_RECSYS", "READING", "16:30", "17:00", "Short annotated read."),
      item(quantQueue[18], "MATH_STATS", "REVIEW", "17:15", "17:45", "Short drill block."),
      item("Daily review", "REVIEW", "REVIEW", "18:00", "18:15", "Log carryovers."),
    ],
  },
  normalDay("2026-05-25", "073-077", readingQueue[0], quantQueue[0]),
  normalDay("2026-05-26", "078-082", readingQueue[1], quantQueue[1]),
  normalDay("2026-05-27", "083-087", readingQueue[2], quantQueue[2]),
  normalDay("2026-05-28", "088-092", readingQueue[3], quantQueue[3]),
  normalDay("2026-05-29", "093-097", readingQueue[4], quantQueue[4], [
    item("Recruiter admin", "REVIEW", "REVIEW", "15:45", "16:15", "Reply to recruiter emails, confirm availability, and update interview next steps."),
  ]),
  normalDay("2026-05-30", "098-102", readingQueue[5], quantQueue[5]),
  {
    date: "2026-05-31",
    items: [
      deepMl("103-105", "08:00", "09:30", "Light Sunday block before Codestar."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      item(readingQueue[6], "ML_RECSYS", "READING", "16:30", "17:00", "Short annotated read."),
      item(quantQueue[6], "MATH_STATS", "REVIEW", "17:15", "17:45", "Short drill block."),
      item("Daily review", "REVIEW", "REVIEW", "18:00", "18:15", "Log carryovers."),
    ],
  },
  normalDay("2026-06-01", "106-110", readingQueue[7], quantQueue[7]),
  normalDay("2026-06-02", "111-115", readingQueue[8], quantQueue[8]),
  normalDay("2026-06-03", "116-120", readingQueue[9], quantQueue[9]),
  normalDay("2026-06-04", "121-125", readingQueue[10], quantQueue[10]),
  normalDay("2026-06-05", "126-130", readingQueue[11], quantQueue[11], [
    item("Recruiter admin", "REVIEW", "REVIEW", "15:45", "16:15", "Reply to recruiter emails, confirm availability, and update interview next steps."),
  ]),
  normalDay("2026-06-06", "131-135", readingQueue[12], quantQueue[12]),
  {
    date: "2026-06-07",
    items: [
      deepMl("136", "08:30", "09:00", "Finish the 136-problem playlist."),
      item("Codestar team meeting", "OTHER", "PROJECT", "10:00", "16:00", "Side project meeting; do not schedule over this."),
      item("Final review", "REVIEW", "REVIEW", "16:30", "17:30", "Build redo list, top formulas, and next 1-week maintenance plan."),
    ],
  },
]

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
  const scheduledDates = schedule.map((day) => new Date(`${day.date}T09:00:00.000Z`))

  const existingSeededItems = await db.roadmapItem.findMany({
    where: {
      roadmapId: { in: activeRoadmapIds },
      scheduledDate: { in: scheduledDates },
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
        estimatedMinutes: duration(scheduleItem.start, scheduleItem.end),
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
