export function noteToPlainText(content: string) {
  return content
    .replace(/<img\b[^>]*alt="([^"]*)"[^>]*>/gi, "Image: $1")
    .replace(/<img\b[^>]*>/gi, "Image")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim()
}

export function redactEmbeddedImages(content: string) {
  return content.replace(/src="data:image\/[^"]+"/gi, 'src="[embedded image]"')
}
