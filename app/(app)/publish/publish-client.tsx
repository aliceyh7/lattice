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
  const [selectedNoteId, setSelectedNoteId] = useState(notes[0]?.id || "")
  const [formatType, setFormatType] = useState<PublishFormat>("x-thread")
  const [draft, setDraft] = useState("")
  const [model, setModel] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId),
    [notes, selectedNoteId]
  )

  function generateDraft() {
    if (!selectedNoteId) return

    setError("")
    setDraft("")
    setModel("")
    startTransition(async () => {
      const response = await fetch("/api/publish-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: selectedNoteId, format: formatType }),
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
              <h2 className="text-base font-semibold">Notes</h2>
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
              {notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className="block w-full text-left"
                >
                  <Card
                    className={cn(
                      "transition-colors",
                      selectedNoteId === note.id && "ring-2 ring-ring"
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {note.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {note.bodyMarkdown.slice(0, 140)}
                          </p>
                        </div>
                        {note.publishable && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            Queue
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), "MMM d, yyyy")}
                        {note.roadmapTitle ? ` · ${note.roadmapTitle}` : ""}
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
                      {selectedNote
                        ? selectedNote.title
                        : "Select a note to generate a draft"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!selectedNoteId || isPending}
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
                  Edit freely, then copy into X or Medium.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
