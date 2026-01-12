"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils/tax"
import { TrendingDown, Check } from "lucide-react"

interface PricingTier {
  minQuantity: number
  maxQuantity?: number
  discountPercent: number
  perItemPrice: number
}

interface PricingTiersProps {
  basePrice: number
  discount21_50?: number | null
  discount51Plus?: number | null
}

export function PricingTiers({ basePrice, discount21_50, discount51Plus }: PricingTiersProps) {
  // Don't show if base price is invalid
  if (!basePrice || basePrice <= 0) {
    return null
  }

  // Calculate pricing tiers based on base price
  const tier21_50 = typeof discount21_50 === "number" ? discount21_50 : 10
  const tier51Plus = typeof discount51Plus === "number" ? discount51Plus : 20
  const tiers: PricingTier[] = [
    {
      minQuantity: 1,
      maxQuantity: 20,
      discountPercent: 0,
      perItemPrice: basePrice,
    },
    {
      minQuantity: 21,
      maxQuantity: 50,
      discountPercent: tier21_50,
      perItemPrice: Math.round(basePrice * (1 - tier21_50 / 100) * 100) / 100, // rounded to 2 decimals
    },
    {
      minQuantity: 51,
      discountPercent: tier51Plus,
      perItemPrice: Math.round(basePrice * (1 - tier51Plus / 100) * 100) / 100, // rounded to 2 decimals
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingDown className="h-5 w-5 text-primary" />
          Bulk Pricing - Save More!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tiers.map((tier, index) => {
          const quantityText = tier.maxQuantity
            ? `${tier.minQuantity}-${tier.maxQuantity} units`
            : `${tier.minQuantity}+ units`
          
          const totalPrice = tier.perItemPrice * tier.minQuantity
          const savings = tier.discountPercent > 0 
            ? (basePrice * tier.minQuantity) - totalPrice
            : 0

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{quantityText}</span>
                  {tier.discountPercent > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {tier.discountPercent}% OFF
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{formatPrice(tier.perItemPrice)}</span>
                  <span className="mx-1">per item</span>
                  {tier.maxQuantity && (
                    <>
                      <span className="mx-1">•</span>
                      <span>Total: {formatPrice(totalPrice)}</span>
                    </>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Save {formatPrice(savings)} on {tier.minQuantity} units
                  </p>
                )}
              </div>
              {tier.discountPercent > 0 && (
                <div className="flex items-center text-green-600">
                  <Check className="h-5 w-5" />
                </div>
              )}
            </div>
          )
        })}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 Buy more to unlock better prices! Prices are per item.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

