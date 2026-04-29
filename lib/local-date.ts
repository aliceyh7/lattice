const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/

export function getDateStringInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) return date.toISOString().slice(0, 10)
  return `${year}-${month}-${day}`
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date)

  const offsetName = parts.find((part) => part.type === "timeZoneName")?.value
  const match = offsetName?.match(/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/)
  if (!match?.[1]) return 0

  const sign = match[1] === "-" ? -1 : 1
  const hours = Number(match[2])
  const minutes = Number(match[3] ?? 0)
  return sign * ((hours * 60 + minutes) * 60 * 1000)
}

export function getUtcStartOfLocalDate(dateString: string, timeZone: string) {
  const [year, month, day] = dateString.split("-").map(Number)
  const utcMidnightGuess = new Date(Date.UTC(year, month - 1, day))
  const offsetMs = getTimeZoneOffsetMs(utcMidnightGuess, timeZone)
  return new Date(utcMidnightGuess.getTime() - offsetMs)
}

export function addDaysToDateString(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days, 12))
  return date.toISOString().slice(0, 10)
}

export function formatDateLabel(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateString}T12:00:00.000Z`))
}

export function parseDateParam(
  dateParam: string | string[] | undefined,
  fallbackDateString: string
) {
  const value = Array.isArray(dateParam) ? dateParam[0] : dateParam
  return value && DATE_PARAM_RE.test(value) ? value : fallbackDateString
}

export function getLocalDateRange(dateString: string, timeZone: string) {
  return {
    start: getUtcStartOfLocalDate(dateString, timeZone),
    end: getUtcStartOfLocalDate(addDaysToDateString(dateString, 1), timeZone),
  }
}

export function isSameLocalDate(
  left: Date,
  right: Date,
  timeZone: string
) {
  return (
    getDateStringInTimeZone(left, timeZone) ===
    getDateStringInTimeZone(right, timeZone)
  )
}
