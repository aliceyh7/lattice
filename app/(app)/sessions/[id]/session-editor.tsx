"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { DOMAIN_META } from "@/lib/domain"
import type { Domain } from "@prisma/client"
import {
  Clock,
  ExternalLink,
  CheckCircle2,
  Brain,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { completeSession, saveNote } from "./actions"

type SessionWithRelations = {
  id: string
  startedAt: Date
  status: string
  roadmapItem: {
    id: string
    title: string
    url: string | null
    estimatedMinutes: number
    roadmap: { title: string; domain: Domain }
  } | null
  notes: { id: string; bodyMarkdown: string; title: string | null }[]
}

function useTimer(startedAt: Date) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const base = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    )
    setElapsed(base)
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export function SessionEditor({ session }: { session: SessionWithRelations }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [keyTakeaways, setKeyTakeaways] = useState("")
  const [confusions, setConfusions] = useState("")
  const timer = useTimer(session.startedAt)
  const isDone = session.status === "COMPLETED"

  const item = session.roadmapItem
  const meta = item ? DOMAIN_META[item.roadmap.domain] : null

  const existingNote = session.notes[0]

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "Start writing your notes… What's the core idea? What was surprising?",
      }),
    ],
    content: existingNote?.bodyMarkdown || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] prose prose-sm max-w-none focus:outline-none px-1",
      },
    },
    onUpdate({ editor }) {
      // auto-save debounce handled by complete action
    },
  })

  function handleComplete(struggled: boolean) {
    startTransition(async () => {
      const markdown = editor?.getText() || ""
      await completeSession({
        sessionId: session.id,
        noteMarkdown: markdown,
        keyTakeaways,
        confusions,
        struggled,
      })
      toast.success(
        struggled
          ? "Session complete — marked for extra review."
          : "Session complete!"
      )
      router.push("/today")
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Back */}
      <Link
        href="/today"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Today
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {meta && (
            <Badge
              className={`${meta.bg} ${meta.color} border-0 mb-2`}
            >
              {meta.label}
            </Badge>
          )}
          <h1 className="text-xl font-semibold">
            {item?.title || "Study Session"}
          </h1>
          {item?.roadmap.title && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {item.roadmap.title}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-mono font-medium tabular-nums">
            {timer}
          </div>
          <p className="text-xs text-muted-foreground">
            est. {item?.estimatedMinutes}m
          </p>
        </div>
      </div>

      {item?.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Open resource
        </a>
      )}

      <Separator />

      {/* Notes editor */}
      <div>
        <h2 className="text-sm font-medium mb-2">Notes</h2>
        <div className="rounded-lg border bg-card p-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Key takeaways */}
      <div>
        <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Key takeaways
        </label>
        <Textarea
          placeholder="What's the core idea? Why does it matter? How does it connect?"
          value={keyTakeaways}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setKeyTakeaways(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Confusions */}
      <div>
        <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          Still confused about…
        </label>
        <Textarea
          placeholder="What's still unclear? What would you ask the author?"
          value={confusions}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConfusions(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <Separator />

      {/* Completion checklist */}
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <h3 className="text-sm font-medium mb-3">Before you complete…</h3>
        {[
          "I can state the core idea in one sentence.",
          "I know why it matters.",
          "I know one limitation or open question.",
          "I have at least one note written above.",
        ].map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded" />
            {item}
          </label>
        ))}
      </div>

      {/* Action buttons */}
      {!isDone && (
        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={isPending}
            onClick={() => handleComplete(false)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Complete session
          </Button>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => handleComplete(true)}
          >
            <Brain className="h-4 w-4 mr-1.5" />
            Struggled — review extra
          </Button>
        </div>
      )}
      {isDone && (
        <div className="text-center py-4 text-emerald-600 font-medium">
          <CheckCircle2 className="h-5 w-5 inline mr-1.5" />
          Session complete
        </div>
      )}
    </div>
  )
}
