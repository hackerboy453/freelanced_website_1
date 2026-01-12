import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate Razorpay credentials
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || keyId === "your_razorpay_key_id" || keyId.trim() === "") {
      console.error("Razorpay Key ID is missing or invalid")
      return NextResponse.json(
        { error: "Razorpay Key ID is not configured. Please check your environment variables (RAZORPAY_KEY_ID or NEXT_PUBLIC_RAZORPAY_KEY_ID)." },
        { status: 500 },
      )
    }

    if (!keySecret || keySecret === "your_razorpay_key_secret" || keySecret.trim() === "") {
      console.error("Razorpay Key Secret is missing or invalid")
      return NextResponse.json(
        { error: "Razorpay Key Secret is not configured. Please check your environment variables (RAZORPAY_KEY_SECRET)." },
        { status: 500 },
      )
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const body = await request.json()
    const { amount, currency = "INR", orderId, receipt } = body

    if (!amount || !orderId) {
      return NextResponse.json({ error: "Amount and orderId are required" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt || `receipt_${orderId}`,
      notes: {
        order_id: orderId,
        user_id: user.id,
      },
    }

    const razorpayOrder = await razorpay.orders.create(options)

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    })
  } catch (error: any) {
    console.error("Razorpay create order error:", error)
    
    // Handle authentication errors
    if (error.message?.includes("Unauthorized") || error.status === 401) {
      return NextResponse.json(
        { error: "Authentication failed. Please log in again." },
        { status: 401 },
      )
    }
    
    // Handle specific Razorpay errors
    if (error.error) {
      const errorMessage = error.error.description || error.error.message || "Razorpay error occurred"
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 },
      )
    }

    // Handle Razorpay API errors
    if (error.statusCode) {
      return NextResponse.json(
        { error: error.message || `Razorpay API error: ${error.statusCode}` },
        { status: error.statusCode >= 400 && error.statusCode < 500 ? 400 : 500 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Razorpay order" },
      { status: 500 },
    )
  }
}

