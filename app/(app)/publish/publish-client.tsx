"use client"

import { useMemo, useState, useTransition } from "react"
import { format } from "date-fns"
import { Copy, ExternalLink, FileText, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type PublishFormat = "x-thread" | "medium"

type PublishNote = {
  id: string
  title: string
  bodyMarkdown: string
  publishable: boolean
  createdAt: string
  dayKey: string
  sessionStartedAt: string | null
  roadmapTitle: string | null
  itemTitle: string | null
}

type Channel = {
  name: string
  handle: string
  url: string
  description: string
  icon: string
}

export function PublishClient({
  notes,
  channels,
}: {
  notes: PublishNote[]
  channels: Channel[]
}) {
  const dayGroups = useMemo(() => {
    const groups = new Map<string, PublishNote[]>()
    for (const note of notes) {
      const existing = groups.get(note.dayKey) ?? []
      existing.push(note)
      groups.set(note.dayKey, existing)
    }

    return Array.from(groups.entries()).map(([dayKey, dayNotes]) => ({
      dayKey,
      notes: dayNotes.sort(
        (a, b) =>
          new Date(a.sessionStartedAt ?? a.createdAt).getTime() -
          new Date(b.sessionStartedAt ?? b.createdAt).getTime()
      ),
    }))
  }, [notes])

  const [selectedDay, setSelectedDay] = useState(dayGroups[0]?.dayKey || "")
  const [formatType, setFormatType] = useState<PublishFormat>("x-thread")
  const [draft, setDraft] = useState("")
  const [model, setModel] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const selectedGroup = useMemo(
    () => dayGroups.find((group) => group.dayKey === selectedDay),
    [dayGroups, selectedDay]
  )

  function generateDraft() {
    if (!selectedDay) return

    setError("")
    setDraft("")
    setModel("")
    startTransition(async () => {
      const response = await fetch("/api/publish-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDay, format: formatType }),
      })
      const data = (await response.json()) as {
        draft?: string
        model?: string
        error?: string
      }

      if (!response.ok || !data.draft) {
        setError(data.error || "Unable to generate draft")
        return
      }

      setDraft(data.draft)
      setModel(data.model || "")
    })
  }

  async function copyDraft() {
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    toast.success("Draft copied")
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map((ch) => (
          <a
            key={ch.name}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="h-full transition-colors group-hover:border-foreground/30">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  {ch.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold">{ch.name}</p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{ch.handle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ch.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
          <FileText className="h-6 w-6 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No notes yet. Complete a session first.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Daily notes</h2>
              <div className="inline-flex rounded-lg bg-muted p-1">
                {(["x-thread", "medium"] as const).map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setFormatType(format)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      formatType === format
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {format === "x-thread" ? "X thread" : "Medium"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {dayGroups.map((group) => (
                <button
                  key={group.dayKey}
                  type="button"
                  onClick={() => setSelectedDay(group.dayKey)}
                  className="block w-full text-left"
                >
                  <Card
                    className={cn(
                      "transition-colors",
                      selectedDay === group.dayKey && "ring-2 ring-ring"
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {format(new Date(`${group.dayKey}T12:00:00.000Z`), "MMM d, yyyy")}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {group.notes.length} note{group.notes.length !== 1 ? "s" : ""} for one{" "}
                            {formatType === "x-thread" ? "reply chain" : "Medium post"}
                          </p>
                          <div className="mt-2 space-y-1">
                            {group.notes.slice(0, 4).map((note) => (
                              <p
                                key={note.id}
                                className="truncate text-xs text-muted-foreground"
                              >
                                {note.title}
                              </p>
                            ))}
                            {group.notes.length > 4 && (
                              <p className="text-xs text-muted-foreground">
                                +{group.notes.length - 4} more
                              </p>
                            )}
                          </div>
                        </div>
                        {group.notes.some((note) => note.publishable) && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            Queue
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {Array.from(
                          new Set(
                            group.notes
                              .map((note) => note.roadmapTitle)
                              .filter(Boolean)
                          )
                        ).join(" · ")}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">Draft</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedGroup
                        ? `${format(new Date(`${selectedGroup.dayKey}T12:00:00.000Z`), "MMM d, yyyy")} · ${
                            selectedGroup.notes.length
                          } note${selectedGroup.notes.length !== 1 ? "s" : ""}`
                        : "Select a day to generate a draft"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!selectedDay || isPending}
                      onClick={generateDraft}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Generate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!draft}
                      onClick={copyDraft}
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                  </div>
                )}

                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Generated draft will appear here."
                  className="min-h-[420px] resize-y font-mono text-xs leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  {model ? `Generated with ${model}. ` : ""}
                  {formatType === "x-thread"
                    ? "Post each numbered item as a reply to the previous one."
                    : "Edit freely, then publish as one Medium post."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
