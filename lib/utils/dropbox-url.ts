/**
 * Converts Dropbox share links to direct download URLs
 * Dropbox preview URLs (previews.dropbox.com) cannot be converted and will return the original URL
 * 
 * To get a working Dropbox image URL:
 * 1. In Dropbox, right-click the image file
 * 2. Select "Copy link" or "Share" -> "Copy link"
 * 3. You'll get a URL like: https://www.dropbox.com/s/xxxxx/filename.png?dl=0
 * 4. This function will automatically convert it to: https://dl.dropboxusercontent.com/s/xxxxx/filename.png?raw=1
 */

export function convertDropboxUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url
  }

  const trimmedUrl = url.trim()

  // Dropbox preview URL pattern: https://previews.dropbox.com/p/thumb/...
  // These CANNOT be converted - user needs to use share link instead
  if (trimmedUrl.includes('previews.dropbox.com')) {
    // Return original - will fail to load and show error message
    return trimmedUrl
  }

  // Dropbox share link pattern: https://www.dropbox.com/s/... or https://dropbox.com/s/...
  // Convert to direct download: https://dl.dropboxusercontent.com/s/...
  if (trimmedUrl.includes('dropbox.com/s/')) {
    // Extract the path after /s/ (everything up to ? or end of string)
    const shareMatch = trimmedUrl.match(/dropbox\.com\/s\/([^?\s]+)/)
    if (shareMatch && shareMatch[1]) {
      // Convert to direct download URL
      return `https://dl.dropboxusercontent.com/s/${shareMatch[1]}?raw=1`
    }
  }

  // Dropbox share link with /sh/ (folder share format)
  if (trimmedUrl.includes('dropbox.com/sh/')) {
    const shareMatch = trimmedUrl.match(/dropbox\.com\/sh\/([^?\s]+)/)
    if (shareMatch && shareMatch[1]) {
      return `https://dl.dropboxusercontent.com/sh/${shareMatch[1]}?raw=1`
    }
  }

  // Already a direct download URL or other URL
  return trimmedUrl
}

/**
 * Checks if a URL is a Dropbox preview URL that needs conversion
 */
export function isDropboxPreviewUrl(url: string): boolean {
  return url.includes('previews.dropbox.com')
}

