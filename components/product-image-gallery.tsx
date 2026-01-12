"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductImageGalleryProps {
  images: string[]
  productTitle: string
}

export function ProductImageGallery({ images, productTitle }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
        <Image
          src="/placeholder.svg?height=600&width=600"
          alt={productTitle}
          fill
          className="object-cover"
          priority
        />
      </div>
    )
  }

  const mainImage = images[selectedImageIndex] || images[0]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative rounded-lg overflow-hidden bg-muted border-2 border-border">
        <Image
          src={mainImage}
          alt={`${productTitle} - Image ${selectedImageIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square relative rounded-md overflow-hidden bg-muted border-2 transition-all ${
                index === selectedImageIndex
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Image
                src={image || "/placeholder.svg?height=150&width=150"}
                alt={`${productTitle} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

