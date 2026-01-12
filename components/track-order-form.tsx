"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TrackOrderFormProps {
  initialOrderNumber: string
}

export function TrackOrderForm({ initialOrderNumber }: TrackOrderFormProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderNumber.trim()) {
      router.push(`/track-order?order=${encodeURIComponent(orderNumber.trim())}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Your Order Number</CardTitle>
        <CardDescription>Find your order number in the confirmation email or your orders page</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g., ORD-XXXXXX-XXXX"
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Track
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
