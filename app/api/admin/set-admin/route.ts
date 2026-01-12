import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Get the current user
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if service role key is available (for admin operations)
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseServiceRoleKey || !supabaseUrl) {
      // Fallback: Provide SQL instructions if service role key is not available
      return NextResponse.json(
        {
          error: "Service role key not configured",
          instructions: `To set yourself as admin, run this SQL in your Supabase SQL Editor:
          
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = '${user.email}';

Then refresh your session by logging out and logging back in.`,
        },
        { status: 500 },
      )
    }

    // Use Admin API to update user metadata
    const adminClient = createAdminClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        is_admin: true,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Sign out and redirect to login to refresh the session
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: "Admin status set successfully. Please log in again to refresh your session.",
    })
  } catch (error) {
    console.error("Set admin error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    )
  }
}

