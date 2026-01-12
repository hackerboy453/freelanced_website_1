import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateOrderNumber } from "@/lib/utils/tax"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      cartItems,
      subtotal,
      tax,
      shipping = 0,
      total,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      shippingFullName,
      shippingPhone,
      paymentMethod,
    } = body

    // Validate required fields
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    if (!shippingAddress || !shippingCity || !shippingState || !shippingPincode || !shippingFullName || !shippingPhone) {
      return NextResponse.json({ error: "Missing shipping information" }, { status: 400 })
    }

    // Validate pincode
    if (!/^\d{6}$/.test(shippingPincode)) {
      return NextResponse.json({ error: "Invalid pincode. Must be 6 digits" }, { status: 400 })
    }

    // Validate phone
    if (!/^\d{10}$/.test(shippingPhone)) {
      return NextResponse.json({ error: "Invalid phone number. Must be 10 digits" }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    // Calculate final total including shipping
    const finalTotal = total || (subtotal + tax + shipping)
    
    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: paymentMethod === "cod" ? "pending" : "pending",
        subtotal,
        tax,
        total: finalTotal,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_pincode: shippingPincode,
        shipping_full_name: shippingFullName,
        shipping_phone: shippingPhone,
        payment_method: paymentMethod,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      
      // Provide more helpful error messages
      if (orderError.code === "PGRST204") {
        return NextResponse.json(
          { 
            error: "Database schema is missing required columns. Please run the migration script: scripts/014_fix_orders_complete_schema.sql",
            details: orderError.message 
          },
          { status: 500 },
        )
      }
      
      if (orderError.code === "42501") {
        return NextResponse.json(
          { 
            error: "Permission denied. Please check Row Level Security policies.",
            details: orderError.message 
          },
          { status: 403 },
        )
      }
      
      return NextResponse.json(
        { error: orderError.message || "Failed to create order", details: orderError },
        { status: 500 },
      )
    }

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      product_price: item.product_price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
      // Try to delete the order if items creation fails
      await supabase.from("orders").delete().eq("id", order.id)
      
      // Provide more helpful error messages
      if (itemsError.code === "PGRST204") {
        return NextResponse.json(
          { 
            error: "Database schema is missing required columns. Please run the migration script: scripts/014_fix_orders_complete_schema.sql",
            details: itemsError.message 
          },
          { status: 500 },
        )
      }
      
      if (itemsError.code === "42501") {
        return NextResponse.json(
          { 
            error: "Permission denied. Please check Row Level Security policies.",
            details: itemsError.message 
          },
          { status: 403 },
        )
      }
      
      return NextResponse.json(
        { error: itemsError.message || "Failed to create order items", details: itemsError },
        { status: 500 },
      )
    }

    // Update profile with address info
    await supabase
      .from("profiles")
      .update({
        full_name: shippingFullName,
        phone: shippingPhone,
        address: shippingAddress,
        city: shippingCity,
        state: shippingState,
        pincode: shippingPincode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
      },
    })
  } catch (error) {
    console.error("Unexpected error creating order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 },
    )
  }
}

