"use client"

import { useState } from "react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { PricingTiers } from "@/components/pricing-tiers"
import type { Product } from "@/lib/types"

interface ProductQuantityManagerProps {
  product: Product
}

export function ProductQuantityManager({ product }: ProductQuantityManagerProps) {
  const [quantity, setQuantity] = useState(1)

  const handleTierClick = (tierQuantity: number) => {
    // Set quantity to the minimum quantity for that tier
    if (tierQuantity <= product.stock) {
      setQuantity(tierQuantity)
    } else {
      setQuantity(product.stock)
    }
  }

  return (
    <>
      <AddToCartButton product={product} quantity={quantity} onQuantityChange={setQuantity} />
      <PricingTiers
        basePrice={product.price}
        discount21_50={product.discount_21_50 ?? undefined}
        discount51Plus={product.discount_51_plus ?? undefined}
        onTierClick={handleTierClick}
        currentQuantity={quantity}
        maxStock={product.stock}
      />
    </>
  )
}

