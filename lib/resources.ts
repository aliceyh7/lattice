export type ResourceKind = "youtube" | "external"

export type ResourceInfo = {
  kind: ResourceKind
  embedUrl: string | null
  host: string
}

export function getResourceInfo(url: string | null): ResourceInfo | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")
    const youtubeEmbedUrl = getYoutubeEmbedUrl(parsed)

    return {
      kind: youtubeEmbedUrl ? "youtube" : "external",
      embedUrl: youtubeEmbedUrl,
      host,
    }
  } catch {
    return null
  }
}

function getYoutubeEmbedUrl(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "")
  const isYoutube = host === "youtube.com" || host === "m.youtube.com"
  const isShortYoutube = host === "youtu.be"

  if (!isYoutube && !isShortYoutube) return null

  const videoId = isShortYoutube
    ? url.pathname.slice(1).split("/")[0]
    : getYoutubeVideoId(url)
  const playlistId = url.searchParams.get("list")

  if (videoId) {
    const embed = new URL(`https://www.youtube.com/embed/${videoId}`)
    if (playlistId) embed.searchParams.set("list", playlistId)
    return embed.toString()
  }

  if (playlistId) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistId}`
  }

  return null
}

function getYoutubeVideoId(url: URL): string | null {
  if (url.pathname === "/watch") return url.searchParams.get("v")

  const parts = url.pathname.split("/").filter(Boolean)
  if ((parts[0] === "embed" || parts[0] === "shorts") && parts[1]) {
    return parts[1]
  }

  return null
}
