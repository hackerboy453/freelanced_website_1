import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TrackOrderForm } from "@/components/track-order-form"
import { OrderTrackingResult } from "@/components/order-tracking-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils/tax"
import { Package, Calendar, MapPin, CreditCard, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Order, OrderItem } from "@/lib/types"

interface TrackOrderPageProps {
  searchParams: Promise<{ order?: string }>
}

async function getOrder(orderNumber: string, userId: string): Promise<(Order & { order_items: OrderItem[] }) | null> {
  const supabase = await createClient()
  
  // Ensure order number is provided and not empty
  if (!orderNumber || !orderNumber.trim()) {
    return null
  }
  
  // Strictly filter by both order_number AND user_id to prevent cross-user access
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber.trim())
    .eq("user_id", userId)
    .single()
  
  if (error) {
    console.error("Error fetching order:", error)
    return null
  }
  
  // Double-check that the order belongs to the user (security check)
  if (data && data.user_id !== userId) {
    console.error("Security: Order user_id mismatch")
    return null
  }
  
  return data
}

async function getUserOrders(userId: string): Promise<(Order & { order_items: OrderItem[] })[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching user orders:", error)
    return []
  }
  
  return (data as (Order & { order_items: OrderItem[] })[]) || []
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Only fetch order if order number is provided and not empty
  const orderNumber = params.order?.trim() || ""
  const order = orderNumber ? await getOrder(orderNumber, user.id) : null
  
  // Always fetch user's order history
  const userOrders = await getUserOrders(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        <TrackOrderForm initialOrderNumber={orderNumber} />

        {orderNumber && (
          <div className="mt-8">
            {order ? (
              <OrderTrackingResult order={order} />
            ) : (
              <div className="text-center py-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No order found with this order number.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please check the order number and try again. Make sure you&apos;re logged in with the account that placed the order.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order History */}
        {userOrders.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Your Order History</h2>
            <div className="space-y-4">
              {userOrders.map((orderItem) => (
                <OrderHistoryCard key={orderItem.id} order={orderItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Order History Card Component
function OrderHistoryCard({ order }: { order: Order & { order_items: OrderItem[] } }) {
  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    shipped: "outline",
    out_of_delivery: "outline",
    delivered: "default",
    cancelled: "destructive",
  }

  const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-mono">{order.order_number}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <Badge variant={statusColors[order.status] || "secondary"} className="capitalize">
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </h4>
          <div className="space-y-1 pl-6">
            {order.order_items?.slice(0, 3).map((item) => (
              <div key={item.id} className="text-sm">
                <span className="font-medium">{item.product_title}</span>
                <span className="text-muted-foreground ml-2">
                  × {item.quantity} - {formatPrice(item.product_price * item.quantity)}
                </span>
              </div>
            ))}
            {order.order_items && order.order_items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{order.order_items.length - 3} more product{order.order_items.length - 3 !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Shipping Address</span>
            </div>
            <p className="font-medium">
              {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Payment Method</span>
            </div>
            <p className="font-medium capitalize">
              {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
            </p>
          </div>
        </div>

        {/* Order Total */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold">{formatPrice(order.total)}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/track-order?order=${order.order_number}`}>
              View Details
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}