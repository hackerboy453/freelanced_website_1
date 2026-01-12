"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils/tax"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import type { CartItem, Product } from "@/lib/types"

interface CartItemCardProps {
  item: CartItem & { product: Product }
  userId: string
}

export function CartItemCard({ item, userId }: CartItemCardProps) {
  const router = useRouter()

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return

    const supabase = createClient()

    if (newQuantity > item.product.stock) {
      toast.error(`Only ${item.product.stock} items available`)
      return
    }

    const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", item.id)

    if (error) {
      toast.error("Failed to update quantity")
      return
    }

    mutate(["cart-count", userId])
    router.refresh()
  }

  const removeItem = async () => {
    const supabase = createClient()

    const { error } = await supabase.from("cart_items").delete().eq("id", item.id)

    if (error) {
      toast.error("Failed to remove item")
      return
    }

    toast.success("Item removed from cart")
    mutate(["cart-count", userId])
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Link href={`/products/${item.product.id}`} className="shrink-0">
            <div className="h-24 w-24 relative rounded-md overflow-hidden bg-muted">
              <Image
                src={item.product.images[0] || "/placeholder.svg?height=96&width=96"}
                alt={item.product.title}
                fill
                className="object-cover"
              />
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.product.id}`}
              className="font-medium hover:text-primary transition-colors line-clamp-2"
            >
              {item.product.title}
            </Link>
            <p className="text-lg font-bold mt-1">{formatPrice(item.product.price)}</p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={removeItem}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
