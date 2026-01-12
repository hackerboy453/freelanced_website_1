// components/hero-slider.tsx - Client Component ONLY
"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const heroImages = ["/front1.png", "/front2.png", "/front3.png"]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const goPrev = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  const goNext = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length)

  return (
    <div className="relative">
      <div className="aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
        {heroImages.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image src={src} alt={`Hero slide ${index + 1}`} fill className="object-cover" priority={index === 0} />
          </div>
        ))}
        
        {/* Dots + Arrows same as before */}
      </div>
    </div>
  )
}
