"use client"

import { Domain } from "@prisma/client"
import { DOMAIN_META, DIFFICULTY_META } from "@/lib/domain"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ResourceBadge } from "@/components/resource-preview"
import { buttonVariants } from "@/components/ui/button"
import { noteToPlainText, redactEmbeddedImages } from "@/lib/note-content"
import Link from "next/link"
import {
  Clock,
  Play,
  SkipForward,
  CalendarClock,
  Check,
  RotateCcw,
  CheckCircle2,
  Circle,
  ExternalLink,
  Brain,
  ChevronLeft,
  ChevronRight,
  Flame,
  NotebookText,
  TextSearch,
  Undo2,
  X,
  AlertTriangle,
  GitMerge,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useMemo, useState, useTransition } from "react"
import {
  createCalendarItem,
  deleteCalendarItem,
  deleteDailyNote,
  mergeDailyNote,
  startSession,
  updateCalendarItem,
  updateDailyNote,
  updateItemStatus,
} from "./actions"

type ItemWithRelations = {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  estimatedMinutes: number
  scheduledStartMinutes: number | null
  scheduledEndMinutes: number | null
  difficulty: string | null
  status: string
  struggled: boolean
  roadmap: { title: string; domain: Domain }
  sessions: { id: string }[]
  quizCards: { id: string }[]
}

type Props = {
  grouped: Partial<Record<Domain, ItemWithRelations[]>>
  totalMinutes: number
  dueReviews: number
  stats: { completedToday: number; totalToday: number }
  notes: Array<{
    id: string
    title: string
    bodyMarkdown: string
    roadmapTitle: string | null
    itemTitle: string | null
    domain: Domain | null
  }>
  activity: {
    currentStreak: number
    days: Array<{
      date: string
      count: number
      href: string
      isSelected: boolean
      isToday: boolean
    }>
  }
  dateLabel: string
  previousDateHref: string
  nextDateHref: string
  todayHref: string
  isToday: boolean
  selectedDate: string
  hasExplicitDate: boolean
}

const DOMAIN_ORDER: Domain[] = [
  "ML_RECSYS",
  "LEETCODE",
  "MATH_STATS",
  "CPP_SYSTEMS",
  "DISTRIBUTED_TRAINING",
  "REVIEW",
  "OTHER",
]

const EDITABLE_DOMAINS: Array<{ value: Domain; label: string }> = DOMAIN_ORDER.map(
  (domain) => ({ value: domain, label: DOMAIN_META[domain].label })
)

const EDITABLE_TYPES = [
  "PROBLEM",
  "READING",
  "PAPER",
  "PROJECT",
  "REVIEW",
  "COURSE",
  "VIDEO",
] as const

function minutesToTimeInput(minutes: number | null) {
  if (minutes === null) return ""
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

function minutesToTimeLabel(minutes: number | null) {
  if (minutes === null) return null
  const hours24 = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 || 12
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`
}

function timeRangeLabel(item: ItemWithRelations) {
  const start = minutesToTimeLabel(item.scheduledStartMinutes)
  const end = minutesToTimeLabel(item.scheduledEndMinutes)
  if (start && end) return `${start} - ${end}`
  if (start) return start
  return null
}

function sortItemsChronologically(items: ItemWithRelations[]) {
  return [...items].sort((a, b) => {
    const aStart = a.scheduledStartMinutes ?? Number.POSITIVE_INFINITY
    const bStart = b.scheduledStartMinutes ?? Number.POSITIVE_INFINITY
    if (aStart !== bStart) return aStart - bStart

    const aEnd = a.scheduledEndMinutes ?? Number.POSITIVE_INFINITY
    const bEnd = b.scheduledEndMinutes ?? Number.POSITIVE_INFINITY
    if (aEnd !== bEnd) return aEnd - bEnd

    return a.title.localeCompare(b.title)
  })
}

function summarizeNote(markdown: string) {
  const lines = noteToPlainText(markdown)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, ""))

  const heading = lines[0] ?? "Untitled note"
  const bullets = lines
    .slice(1)
    .filter((line) => !/^#+\s/.test(line))
    .slice(0, 4)

  return { heading, bullets }
}

function TaskEditor({
  item,
  selectedDate,
  onCancel,
}: {
  item?: ItemWithRelations
  selectedDate: string
  onCancel: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isNew = !item

  function submit(formData: FormData) {
    startTransition(async () => {
      if (item) {
        await updateCalendarItem(item.id, formData)
        toast.success("Task updated")
      } else {
        await createCalendarItem(selectedDate, formData)
        toast.success("Task added")
      }
      onCancel()
      router.refresh()
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form action={submit} className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              name="title"
              required
              defaultValue={item?.title ?? ""}
              placeholder="Task title"
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <input
              name="startTime"
              type="time"
              defaultValue={minutesToTimeInput(item?.scheduledStartMinutes ?? null)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Start time"
            />
            <input
              name="endTime"
              type="time"
              defaultValue={minutesToTimeInput(item?.scheduledEndMinutes ?? null)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="End time"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
            <select
              name="domain"
              defaultValue={item?.roadmap.domain ?? "OTHER"}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {EDITABLE_DOMAINS.map((domain) => (
                <option key={domain.value} value={domain.value}>
                  {domain.label}
                </option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={item?.type ?? "PROJECT"}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {EDITABLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <input
            name="url"
            defaultValue={item?.url ?? ""}
            placeholder="Optional resource URL"
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Textarea
            name="description"
            defaultValue={item?.description ?? ""}
            placeholder="Notes, done condition, or instructions"
            className="min-h-24 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={onCancel}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              <Check className="h-3.5 w-3.5" />
              {isNew ? "Add task" : "Save task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function TaskCard({
  item,
  selectedDate,
}: {
  item: ItemWithRelations
  selectedDate: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const diffMeta = item.difficulty
    ? DIFFICULTY_META[item.difficulty as keyof typeof DIFFICULTY_META]
    : null
  const isDone = item.status === "COMPLETED"
  const isSkipped = item.status === "SKIPPED"
  const needsBrief =
    !item.description && ["PROJECT", "PAPER", "REVIEW"].includes(item.type)

  function handleAction(action: "TODO" | "SKIPPED" | "DEFERRED") {
    startTransition(async () => {
      await updateItemStatus(item.id, action)
      router.refresh()
      if (action === "TODO") toast("Reset to todo.")
      if (action === "SKIPPED") toast("Skipped — no guilt.")
      if (action === "DEFERRED") toast("Moved to tomorrow.")
    })
  }

  async function handleStart() {
    startTransition(async () => {
      const sessionId = await startSession(item.id)
      router.push(`/sessions/${sessionId}`)
    })
  }

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${item.title}"?`)
    if (!confirmed) return

    startTransition(async () => {
      await deleteCalendarItem(item.id)
      router.refresh()
      toast.success("Task deleted")
    })
  }

  if (isEditing) {
    return (
      <TaskEditor
        item={item}
        selectedDate={selectedDate}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  const timeLabel = timeRangeLabel(item)
  const meta = DOMAIN_META[item.roadmap.domain]

  return (
    <Card className={`transition-opacity ${isDone || isSkipped ? "opacity-50" : ""}`}>
      <CardContent className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <div className="mt-0.5 shrink-0">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                <Badge
                  className={`${meta.bg} ${meta.color} h-5 border-0 px-1.5 text-[10px] font-medium`}
                >
                  {meta.label}
                </Badge>
                <span
                  className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.title}
                </span>
              </div>
              {item.description && (
                <p className="mb-1.5 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              )}
              {needsBrief && (
                <div className="mb-1.5 flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    This item needs a concrete brief before starting: define the
                    artifact, the steps, and the done condition.
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {timeLabel && (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Clock className="h-3 w-3" />
                    {timeLabel}
                  </span>
                )}
                <ResourceBadge url={item.url} type={item.type} />
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.estimatedMinutes}m
                </span>
                {diffMeta && (
                  <span className={diffMeta.color}>{diffMeta.label}</span>
                )}
                {item.quizCards.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Brain className="h-3 w-3" />
                    {item.quizCards.length} due
                  </span>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-foreground/70 transition-colors hover:text-foreground"
                  >
                    Resource
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
          {isDone || isSkipped ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Edit task"
                disabled={isPending}
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Delete task"
                disabled={isPending}
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 gap-1 px-2 text-xs"
                title="Reset to todo"
                disabled={isPending}
                onClick={() => handleAction("TODO")}
              >
                <Undo2 className="h-3 w-3" />
                Reset
              </Button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Edit task"
                disabled={isPending}
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Delete task"
                disabled={isPending}
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Skip"
                disabled={isPending}
                onClick={() => handleAction("SKIPPED")}
              >
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Move to tomorrow"
                disabled={isPending}
                onClick={() => handleAction("DEFERRED")}
              >
                <CalendarClock className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                className="h-6 gap-1 px-2 text-xs"
                disabled={isPending}
                onClick={handleStart}
              >
                <Play className="h-3 w-3" />
                Start
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DailyNoteCard({
  note,
  notes,
}: {
  note: Props["notes"][number]
  notes: Props["notes"]
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [titleValue, setTitleValue] = useState(note.title)
  const [bodyValue, setBodyValue] = useState(noteToPlainText(note.bodyMarkdown))
  const mergeTargets = useMemo(
    () => notes.filter((candidate) => candidate.id !== note.id),
    [note.id, notes]
  )
  const [mergeTargetId, setMergeTargetId] = useState(mergeTargets[0]?.id ?? "")
  const [isPending, startTransition] = useTransition()
  const meta = note.domain ? DOMAIN_META[note.domain] : null
  const summary = summarizeNote(note.bodyMarkdown)
  const mergeTargetTitle =
    mergeTargets.find((target) => target.id === mergeTargetId)?.title ?? "Merge into..."

  useEffect(() => {
    if (isEditing) return
    setTitleValue(note.title)
    setBodyValue(noteToPlainText(note.bodyMarkdown))
  }, [isEditing, note.bodyMarkdown, note.title])

  useEffect(() => {
    if (mergeTargets.some((target) => target.id === mergeTargetId)) return
    setMergeTargetId(mergeTargets[0]?.id ?? "")
  }, [mergeTargetId, mergeTargets])

  function save() {
    startTransition(async () => {
      try {
        await updateDailyNote(note.id, titleValue, bodyValue)
        setIsEditing(false)
        router.refresh()
        toast.success("Note updated")
      } catch {
        toast.error("Could not update note")
      }
    })
  }

  function cancel() {
    setTitleValue(note.title)
    setBodyValue(noteToPlainText(note.bodyMarkdown))
    setIsEditing(false)
  }

  function deleteNote() {
    if (!window.confirm("Delete this daily note?")) return

    startTransition(async () => {
      try {
        await deleteDailyNote(note.id)
        router.refresh()
        toast.success("Note deleted")
      } catch {
        toast.error("Could not delete note")
      }
    })
  }

  function mergeNote() {
    if (!mergeTargetId) return
    const target = notes.find((candidate) => candidate.id === mergeTargetId)
    const targetTitle = target?.title ?? "the selected note"
    if (!window.confirm(`Merge this note into "${targetTitle}" and delete this card?`)) return

    startTransition(async () => {
      try {
        await mergeDailyNote(note.id, mergeTargetId)
        router.refresh()
        toast.success("Notes merged")
      } catch {
        toast.error("Could not merge notes")
      }
    })
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {meta && (
            <Badge className={`${meta.bg} ${meta.color} border-0 font-medium`}>
              {meta.label}
            </Badge>
          )}
          <p className="min-w-0 flex-1 truncate text-sm font-medium">
            {note.title}
          </p>
          <div className="flex gap-1.5">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  disabled={isPending}
                  onClick={cancel}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  disabled={isPending}
                  onClick={save}
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  disabled={isPending}
                  title="Delete note"
                  onClick={deleteNote}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Title</span>
              <input
                value={titleValue}
                onChange={(event) => setTitleValue(event.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Content</span>
              <Textarea
                value={bodyValue}
                onChange={(event) => setBodyValue(event.target.value)}
                className="min-h-56 resize-y font-mono text-xs leading-relaxed"
              />
            </label>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium">{summary.heading}</p>
              {summary.bullets.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {summary.bullets.map((bullet, index) => (
                    <li key={`${note.id}-${index}`} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <details className="group rounded-lg border bg-muted/30 px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                <TextSearch className="h-3.5 w-3.5" />
                Raw note
                <span className="ml-auto group-open:hidden">Show</span>
                <span className="ml-auto hidden group-open:inline">Hide</span>
              </summary>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted-foreground">
                {redactEmbeddedImages(note.bodyMarkdown.trim())}
              </pre>
            </details>
          </>
        )}

        {note.roadmapTitle && (
          <p className="text-xs text-muted-foreground">{note.roadmapTitle}</p>
        )}

        {mergeTargets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Select
              value={mergeTargetId}
              onValueChange={(value) => setMergeTargetId(value ?? "")}
            >
              <SelectTrigger size="sm" className="min-w-0 max-w-full flex-1">
                <span className="min-w-0 flex-1 truncate text-left">
                  {mergeTargetTitle}
                </span>
              </SelectTrigger>
              <SelectContent>
                {mergeTargets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              disabled={isPending || !mergeTargetId}
              onClick={mergeNote}
            >
              <GitMerge className="h-3.5 w-3.5" />
              Merge
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TodayClient({
  grouped,
  totalMinutes,
  dueReviews,
  stats,
  notes,
  activity,
  dateLabel,
  previousDateHref,
  nextDateHref,
  todayHref,
  isToday,
  selectedDate,
  hasExplicitDate,
}: Props) {
  const router = useRouter()
  const progress =
    stats.totalToday > 0
      ? Math.round((stats.completedToday / stats.totalToday) * 100)
      : 0

  const chronologicalItems = sortItemsChronologically(
    DOMAIN_ORDER.flatMap((domain) => grouped[domain] ?? [])
  )
  const [isAddingTask, setIsAddingTask] = useState(false)

  useEffect(() => {
    if (hasExplicitDate) return

    const now = new Date()
    const browserDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-")

    if (browserDate !== selectedDate) {
      router.replace(`/today?date=${browserDate}`)
    }
  }, [hasExplicitDate, router, selectedDate])

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-5 py-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
            <h1 className="text-2xl font-semibold mt-0.5">
              {isToday ? "Today" : "Learning plan"}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href={previousDateHref}
              className={buttonVariants({
                variant: "outline",
                size: "icon-sm",
              })}
              title="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={todayHref}
              className={buttonVariants({
                variant: isToday ? "secondary" : "outline",
                size: "sm",
              })}
            >
              Today
            </Link>
            <Link
              href={nextDateHref}
              className={buttonVariants({
                variant: "outline",
                size: "icon-sm",
              })}
              title="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Activity strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-3 py-1.5">
        <div className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-amber-500" />
          <span className="font-medium">
            {activity.currentStreak} day{activity.currentStreak !== 1 ? "s" : ""} streak
          </span>
          <span className="text-xs text-muted-foreground">last 14 days</span>
        </div>
        <div className="flex gap-1">
          {activity.days.slice(-14).map((day) => {
            const intensity =
              day.count === 0
                ? "bg-muted"
                : day.count === 1
                  ? "bg-emerald-200 dark:bg-emerald-900/50"
                  : day.count === 2
                    ? "bg-emerald-400 dark:bg-emerald-700"
                    : "bg-emerald-600 dark:bg-emerald-500"

            return (
              <Link
                key={day.date}
                href={day.href}
                title={`${day.date}: ${day.count} completed session${day.count !== 1 ? "s" : ""}`}
                className={`h-3.5 w-3.5 rounded-[3px] ring-offset-background transition-transform hover:scale-125 ${intensity} ${
                  day.isSelected
                    ? "ring-2 ring-foreground ring-offset-2"
                    : day.isToday
                      ? "ring-1 ring-foreground/40"
                      : ""
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center sm:gap-5">
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="text-base font-semibold">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>
        </div>
        <Separator orientation="vertical" className="hidden h-8 sm:block" />
        <div>
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="text-base font-semibold">
            {stats.completedToday}/{stats.totalToday}
          </p>
        </div>
        <div className="sm:col-start-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Day completion</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {dueReviews > 0 && (
          <>
            <Separator orientation="vertical" className="hidden h-8 sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">Reviews due</p>
              <p className="flex items-center gap-1 text-base font-semibold">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                {dueReviews}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Task groups */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant={isAddingTask ? "secondary" : "outline"}
          size="sm"
          onClick={() => setIsAddingTask((value) => !value)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </Button>
      </div>

      {isAddingTask && (
        <TaskEditor
          selectedDate={selectedDate}
          onCancel={() => setIsAddingTask(false)}
        />
      )}

      {chronologicalItems.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No tasks scheduled for today.</p>
          <p className="text-sm mt-1">Check your roadmaps or import a schedule.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {chronologicalItems.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              selectedDate={selectedDate}
            />
          ))}
        </div>
      )}

      {/* Notes summary */}
      <div className="space-y-3 border-t pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <NotebookText className="h-4 w-4" />
              Daily notes
            </h2>
            <p className="text-xs text-muted-foreground">
              {notes.length} note{notes.length !== 1 ? "s" : ""} from this day
            </p>
          </div>
          {notes.length > 0 && (
            <Link
              href="/publish"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Publish
            </Link>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Notes from completed sessions will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <DailyNoteCard key={note.id} note={note} notes={notes} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
