import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ 
        authenticated: false,
        error: userError?.message || "Not authenticated" 
      }, { status: 401 })
    }

    const isAdmin = user.user_metadata?.is_admin === true

    return NextResponse.json({
      authenticated: true,
      email: user.email,
      user_metadata: user.user_metadata,
      is_admin: isAdmin,
      raw_user_meta_data: user.user_metadata,
    })
  } catch (error) {
    console.error("Check admin status error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    )
  }
}

