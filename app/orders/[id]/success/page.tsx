import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils/tax"
import type { Order } from "@/lib/types"

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>
}

async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("orders").select("*").eq("id", orderId).single()
  return data
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const order = await getOrder(id)

  if (!order || order.user_id !== user.id) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We&apos;ll send you updates on your order status.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{order.payment_method.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Address</span>
              <span className="text-right max-w-48">
                {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href={`/track-order?order=${order.order_number}`}>
                <Package className="h-4 w-4 mr-2" />
                Track Your Order
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
