import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/tax"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderStatusSelect } from "@/components/admin/order-status-select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, MapPin, Phone, User, Calendar, CreditCard, Mail, Hash } from "lucide-react"
import Link from "next/link"
import type { Order, OrderItem } from "@/lib/types"
import { PrintReceipt } from "@/components/print-receipt"

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>
}

async function getOrder(orderId: string): Promise<(Order & { order_items: OrderItem[] }) | null> {
  const supabase = await createClient()
  
  // Fetch order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single()

  if (orderError || !order) {
    console.error("Error fetching order:", orderError)
    return null
  }

  // Fetch order items separately
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })

  if (itemsError) {
    console.error("Error fetching order items:", itemsError)
  }

  // Fetch profile separately
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", order.user_id)
    .single()

  // Fetch user email using service role client
  let userEmail: string | null = null
  try {
    const { createClient: createAdminClient } = await import("@supabase/supabase-js")
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (supabaseServiceRoleKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data: authUser } = await adminClient.auth.admin.getUserById(order.user_id)
      userEmail = authUser?.user?.email || null
    }
  } catch (e) {
    console.error("Could not fetch user email:", e)
  }

  return {
    ...order,
    order_items: orderItems || [],
    profile: profile || null,
    user_email: userEmail,
  } as (Order & { order_items: OrderItem[]; user_email?: string | null }) | null
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  shipped: "outline",
  out_of_delivery: "outline",
  delivered: "default",
  cancelled: "destructive",
  failed: "destructive",
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const isAdmin = user.user_metadata?.is_admin === true || user.user_metadata?.is_admin === "true"

  if (!isAdmin) {
    redirect("/")
  }

  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const customerName = (order as any).shipping_full_name || (order as any).profile?.full_name || "N/A"
  const customerPhone = (order as any).shipping_phone || (order as any).profile?.phone || "N/A"
  const customerEmail = (order as any).user_email || "N/A"
  const customerUserId = order.user_id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground mt-1">Order #{order.order_number}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusColors[order.status] || "secondary"} className="capitalize text-sm px-3 py-1">
            {order.status}
          </Badge>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      {/* Print Receipt */}
      <div className="mb-6">
        <PrintReceipt 
          order={order} 
          customerName={customerName}
          customerPhone={customerPhone}
          customerEmail={customerEmail}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-base">{item.product_title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: <span className="font-medium">{item.quantity}</span> × {formatPrice(item.product_price)} per item
                        </p>
                        {item.product_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Product ID: {item.product_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatPrice(item.product_price * item.quantity)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.product_price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No order items found</p>
                </div>
              )}

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
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium font-mono text-xs flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {customerUserId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {customerEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {customerPhone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{customerName}</p>
              <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
              </p>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(order.updated_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </p>
                <Badge 
                  variant={order.payment_method === "cod" ? "secondary" : "default"} 
                  className="mt-1 capitalize"
                >
                  {order.payment_method === "cod" ? "Cash on Delivery (COD)" : `Online Payment (${order.payment_method.toUpperCase()})`}
                </Badge>
                {order.payment_method === "cod" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment will be collected at delivery
                  </p>
                )}
                {order.payment_method !== "cod" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment completed online
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

