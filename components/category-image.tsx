"use client"

import { useState, useEffect } from "react"
import { convertDropboxUrl, isDropboxPreviewUrl } from "@/lib/utils/dropbox-url"

interface CategoryImageProps {
  src: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  fallback?: string
}

export function CategoryImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  fallback = "/placeholder.svg",
}: CategoryImageProps) {
  // Convert Dropbox URLs if needed
  const processedSrc = src && src.trim() !== "" ? convertDropboxUrl(src.trim()) : null
  
  // Initialize with the actual src if it exists and is not empty
  const initialSrc = processedSrc || fallback
  const [imgSrc, setImgSrc] = useState(initialSrc)
  const [hasError, setHasError] = useState(false)

  // Update imgSrc when src prop changes
  useEffect(() => {
    if (processedSrc) {
      setImgSrc(processedSrc)
      setHasError(false)
    } else {
      setImgSrc(fallback)
    }
  }, [processedSrc, fallback])

  const handleError = () => {
    // Silently handle errors - just fall back to placeholder
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
    }
  }

  const imageUrl = hasError ? fallback : imgSrc

  // Use regular img tag for better error handling with external URLs
  if (fill) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={handleError}
      />
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
}

