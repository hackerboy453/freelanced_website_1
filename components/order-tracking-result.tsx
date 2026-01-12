import { Check, Package, Truck, MapPin, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils/tax"
import type { Order, OrderItem } from "@/lib/types"
import { PrintReceipt } from "@/components/print-receipt"

interface OrderTrackingResultProps {
  order: Order & { order_items: OrderItem[] }
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_of_delivery", label: "Out of Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
]

const statusIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  out_of_delivery: 3,
  delivered: 4,
  cancelled: -1,
  failed: -1,
}

export function OrderTrackingResult({ order }: OrderTrackingResultProps) {
  const currentStatusIndex = statusIndex[order.status] ?? 0
  const isCancelled = order.status === "cancelled"
  const isFailed = order.status === "failed"

  const shippingName = (order as any).shipping_full_name || "N/A"
  const shippingPhone = (order as any).shipping_phone || "N/A"

  return (
    <div className="space-y-6">
      {/* Print Receipt */}
      <PrintReceipt 
        order={order}
        customerName={shippingName}
        customerPhone={shippingPhone}
      />

      {/* Order Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-lg">{order.order_number}</CardTitle>
            <Badge
              variant={isCancelled || isFailed ? "destructive" : currentStatusIndex === 4 ? "default" : "secondary"}
              className="capitalize"
            >
              {order.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Order Date</span>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Method</span>
              <p className="font-medium">{order.payment_method.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Delivery Address</span>
              <p className="font-medium">
                {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount</span>
              <p className="font-medium text-lg">{formatPrice(order.total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      {!isCancelled && !isFailed && (
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
              <div
                className="absolute left-6 top-0 w-0.5 bg-primary transition-all"
                style={{
                  height: `${Math.min(100, ((currentStatusIndex + 1) / statusSteps.length) * 100)}%`,
                }}
              />

              {/* Steps */}
              <div className="space-y-8">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex
                  const Icon = step.icon

                  return (
                    <div key={step.key} className="relative flex items-center gap-4">
                      <div
                        className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground">
                            {order.status === "pending" && "Your order is being processed"}
                            {order.status === "confirmed" && "Order confirmed and being prepared"}
                            {order.status === "shipped" && "On the way to your location"}
                            {order.status === "delivered" && "Successfully delivered"}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-medium">This order has been cancelled</p>
              <p className="text-sm text-muted-foreground mt-1">
                If you have any questions, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isFailed && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-medium">Payment Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                The payment for this order could not be processed. Please try placing the order again or contact our support team for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.product_title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">{formatPrice(item.product_price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
