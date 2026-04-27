import { ExternalLink, PlaySquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getResourceInfo } from "@/lib/resources"
import { cn } from "@/lib/utils"

type ResourcePreviewProps = {
  title: string
  url: string | null
  type?: string
  estimatedMinutes?: number
}

export function ResourcePreview({
  title,
  url,
  type,
  estimatedMinutes,
}: ResourcePreviewProps) {
  const info = getResourceInfo(url)
  if (!url || !info) return null

  const typeLabel = type ? formatType(type) : "Resource"

  if (info.kind === "youtube" && info.embedUrl) {
    return (
      <Card className="gap-0 py-0">
        <div className="aspect-video bg-muted">
          <iframe
            src={info.embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="gap-1">
                <PlaySquare className="h-3 w-3" />
                Video
              </Badge>
              {estimatedMinutes ? (
                <span className="text-xs text-muted-foreground">
                  {estimatedMinutes} min
                </span>
              ) : null}
            </div>
            <p className="truncate text-sm font-medium">{title}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{typeLabel}</Badge>
            <span className="text-xs text-muted-foreground">{info.host}</span>
            {estimatedMinutes ? (
              <span className="text-xs text-muted-foreground">
                {estimatedMinutes} min
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm font-medium">{title}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          <ExternalLink className="h-4 w-4" />
          Open resource
        </a>
      </CardContent>
    </Card>
  )
}

export function ResourceBadge({ url, type }: { url: string | null; type: string }) {
  const info = getResourceInfo(url)
  const label = info?.kind === "youtube" ? "Video" : formatType(type)

  return (
    <Badge variant="secondary" className="text-xs">
      {label}
    </Badge>
  )
}

function formatType(type: string) {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
