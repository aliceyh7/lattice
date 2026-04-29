"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { mergeAttributes, Node } from "@tiptap/core"
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
import { ResourcePreview } from "@/components/resource-preview"
import type { Domain } from "@prisma/client"
import {
  CheckCircle2,
  Brain,
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { completeSession } from "./actions"

type SessionWithRelations = {
  id: string
  startedAt: Date
  status: string
  roadmapItem: {
    id: string
    title: string
    description: string | null
    type: string
    url: string | null
    estimatedMinutes: number
    roadmap: { title: string; domain: Domain }
  } | null
  notes: { id: string; bodyMarkdown: string; title: string | null }[]
}

type ContinuationNote = {
  id: string
  title: string | null
  bodyMarkdown: string
  updatedAt: Date
  session: {
    roadmapItem: { title: string } | null
  } | null
} | null

const InlineImage = Node.create({
  name: "image",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: "img[src]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        class: "my-3 max-h-[520px] max-w-full rounded-md border object-contain",
      }),
    ]
  },
})

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

export function SessionEditor({
  session,
  continuationNote,
}: {
  session: SessionWithRelations
  continuationNote: ContinuationNote
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [keyTakeaways, setKeyTakeaways] = useState("")
  const [confusions, setConfusions] = useState("")
  const [publishable, setPublishable] = useState(true)
  const timer = useTimer(session.startedAt)
  const isDone = session.status === "COMPLETED"

  const item = session.roadmapItem
  const meta = item ? DOMAIN_META[item.roadmap.domain] : null
  const needsBrief =
    item && !item.description && ["PROJECT", "PAPER", "REVIEW"].includes(item.type)

  const existingNote = session.notes[0]
  const initialContent = existingNote?.bodyMarkdown || continuationNote?.bodyMarkdown || ""

  const editor = useEditor({
    extensions: [
      StarterKit,
      InlineImage,
      Placeholder.configure({
        placeholder:
          "Start writing your notes… What's the core idea? What was surprising?",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] prose prose-sm max-w-none focus:outline-none px-1",
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          file.type.startsWith("image/")
        )

        if (!files.length) return false

        event.preventDefault()
        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })
        const insertAt = coordinates?.pos

        files.forEach((file) => {
          const reader = new FileReader()
          reader.onload = () => {
            const src = String(reader.result)
            const imageNode = {
              type: "image",
              attrs: { src, alt: file.name, title: file.name },
            }

            if (insertAt == null) {
              editor?.chain().focus().insertContent(imageNode).run()
            } else {
              editor?.chain().focus().insertContentAt(insertAt, imageNode).run()
            }
          }
          reader.readAsDataURL(file)
        })

        return true
      },
    },
    onUpdate({ editor }) {
      // auto-save debounce handled by complete action
    },
  })

  function handleComplete(struggled: boolean) {
    startTransition(async () => {
      const markdown = editor?.getHTML() || ""
      await completeSession({
        sessionId: session.id,
        noteMarkdown: markdown,
        keyTakeaways,
        confusions,
        struggled,
        publishable,
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
          {item?.description && (
            <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          )}
          {needsBrief && (
            <div className="mt-3 flex max-w-3xl gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                This item needs a concrete brief before starting: define the
                artifact, the steps, and the done condition.
              </span>
            </div>
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

      {item && (
        <ResourcePreview
          title={item.title}
          url={item.url}
          type={item.type}
          estimatedMinutes={item.estimatedMinutes}
        />
      )}

      <Separator />

      {/* Notes editor */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Notes</h2>
          {continuationNote && !existingNote && (
            <span className="text-xs text-muted-foreground">
              Continuing from {continuationNote.session?.roadmapItem?.title ?? continuationNote.title ?? "latest roadmap note"}
            </span>
          )}
        </div>
        <div className="rounded-lg border bg-card p-4 transition-colors focus-within:border-foreground/40">
          <EditorContent editor={editor} />
          <div className="mt-3 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
            Drop images into the note editor to embed them.
          </div>
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
        <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
          <input
            type="checkbox"
            className="rounded"
            checked={publishable}
            onChange={(e) => setPublishable(e.target.checked)}
          />
          Add this note to the publish queue
        </label>
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
