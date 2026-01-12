import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json({ error: "Missing required payment details" }, { status: 400 })
    }

    // Verify the payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET || ""
    
    if (!secret || secret === "your_razorpay_key_secret" || secret.trim() === "") {
      console.error("Razorpay key secret is missing or invalid")
      return NextResponse.json({ 
        error: "Payment verification failed: Razorpay Key Secret is not configured. Please check your environment variables (RAZORPAY_KEY_SECRET)." 
      }, { status: 500 })
    }

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generated_signature !== razorpay_signature) {
      console.error("Signature mismatch:", {
        generated: generated_signature,
        received: razorpay_signature,
      })
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update order status to confirmed
    const updateData: any = {
      status: "confirmed",
      payment_method: "razorpay",
    }
    
    // Only add updated_at if the column exists (handle gracefully)
    try {
      updateData.updated_at = new Date().toISOString()
    } catch (e) {
      // Ignore if column doesn't exist
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (orderError) {
      console.error("Order update error:", orderError)
      
      // Provide more helpful error messages
      if (orderError.code === "PGRST204") {
        return NextResponse.json(
          { 
            error: "Database schema issue. The 'updated_at' column may be missing. Please run the migration script.",
            details: orderError.message 
          },
          { status: 500 },
        )
      }
      
      if (orderError.code === "42501") {
        return NextResponse.json(
          { 
            error: "Permission denied. RLS policy may be blocking the update.",
            details: orderError.message 
          },
          { status: 403 },
        )
      }
      
      return NextResponse.json(
        { 
          error: "Failed to update order",
          details: orderError.message,
          code: orderError.code 
        },
        { status: 500 },
      )
    }

    if (!order) {
      console.error("Order not found after update")
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      payment_id: razorpay_payment_id,
    })
  } catch (error) {
    console.error("Razorpay verify payment error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify payment" },
      { status: 500 },
    )
  }
}

