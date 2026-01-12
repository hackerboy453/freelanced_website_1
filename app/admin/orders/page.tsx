import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/tax"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { OrderStatusSelect } from "@/components/admin/order-status-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Package } from "lucide-react"
import type { Order, OrderItem } from "@/lib/types"
import { RefreshOrdersButton } from "@/components/admin/refresh-orders-button"
import { OrderFilters } from "@/components/admin/order-filters"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderWithItems extends Order {
  order_items: OrderItem[]
  profile?: {
    full_name: string | null
    phone: string | null
  }
}

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string
    dateFilter?: string
    date?: string
    month?: string
    year?: string
  }>
}

async function getOrders(filters: {
  status?: string
  dateFilter?: string
  date?: string
  month?: string
  year?: string
}): Promise<OrderWithItems[]> {
  const supabase = await createClient()
  
  // Get current user to verify admin status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Verify admin status
  const isAdmin = user.user_metadata?.is_admin === true || user.user_metadata?.is_admin === "true"
  
  if (!isAdmin) {
    console.error("Non-admin user attempted to access admin orders")
    return []
  }

  // Build query with filters
  let query = supabase
    .from("orders")
    .select("*, order_items:order_items(*)")

  // Apply status filter
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  // Apply date filters
  if (filters.dateFilter === "today") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    query = query.gte("created_at", today.toISOString()).lt("created_at", tomorrow.toISOString())
  } else if (filters.dateFilter === "date" && filters.date) {
    const selectedDate = new Date(filters.date)
    selectedDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    query = query.gte("created_at", selectedDate.toISOString()).lt("created_at", nextDay.toISOString())
  } else if (filters.dateFilter === "month" && filters.month) {
    const [year, month] = filters.month.split("-")
    const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 1)
    query = query.gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString())
  } else if (filters.dateFilter === "year" && filters.year) {
    const year = Number.parseInt(filters.year)
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)
    query = query.gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString())
  }

  const { data: orders, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    // If RLS policy error, provide helpful message
    if (error.code === "42501") {
      console.error("RLS policy error - Admin may not have permission to view orders")
    }
    return []
  }

  // Fetch profiles separately for each unique user_id
  if (orders && orders.length > 0) {
    const userIds = [...new Set(orders.map((o) => o.user_id))]
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", userIds)

    // Map profiles to orders
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])
    const ordersWithProfiles = orders.map((order) => ({
      ...order,
      profile: profileMap.get(order.user_id) || null,
    }))

    return ordersWithProfiles as OrderWithItems[]
  }

  return []
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

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams
  const orders = await getOrders(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and update their status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total: {orders.length} order{orders.length !== 1 ? "s" : ""}
          </div>
          <RefreshOrdersButton />
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>}>
        <OrderFilters />
      </Suspense>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Orders will appear here once customers place them.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
                const customerName =
                  (order as any).shipping_full_name || order.profile?.full_name || "N/A"
                const customerPhone = (order as any).shipping_phone || order.profile?.phone || "N/A"

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{customerName}</p>
                        <p className="text-muted-foreground">{customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.order_items?.length || 0} product{order.order_items?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[200px]">
                        <p className="line-clamp-1">
                          {(order as any).shipping_full_name || customerName}
                        </p>
                        <p className="text-muted-foreground line-clamp-1">{order.shipping_address}</p>
                        <p className="text-muted-foreground text-xs">
                          {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{formatPrice(order.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          Subtotal: {formatPrice(order.subtotal)}
                        </p>
                        <p className="text-xs text-muted-foreground">Tax: {formatPrice(order.tax)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status] || "secondary"} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
