"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, CheckCircle2 } from "lucide-react"

export default function SetAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [instructions, setInstructions] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<{
    email?: string
    is_admin?: boolean
    user_metadata?: any
  } | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check current admin status
    fetch("/api/admin/check-status")
      .then((res) => res.json())
      .then((data) => {
        setCurrentStatus(data)
        setCheckingStatus(false)
      })
      .catch(() => {
        setCheckingStatus(false)
      })
  }, [])

  const handleSetAdmin = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setInstructions(null)

    try {
      const response = await fetch("/api/admin/set-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.instructions) {
          setInstructions(data.instructions)
        } else {
          setError(data.error || "Failed to set admin status")
        }
        return
      }

      setSuccess(true)
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Set Admin Status</CardTitle>
          </div>
          <CardDescription>
            Click the button below to set your account as admin. You&apos;ll need to log in again after this.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkingStatus ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking current status...
            </div>
          ) : currentStatus ? (
            <Alert className={currentStatus.is_admin ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {currentStatus.is_admin ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-200">
                          You are already an admin!
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">Current Status:</span>
                        <span>Not an admin</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Email: {currentStatus.email}</p>
                    <p>User Metadata: {JSON.stringify(currentStatus.user_metadata, null, 2)}</p>
                  </div>
                  {currentStatus.is_admin && (
                    <Button asChild className="w-full mt-2">
                      <a href="/admin">Go to Admin Panel</a>
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {instructions && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Service role key not configured.</p>
                  <p>To set yourself as admin, run this SQL in your Supabase SQL Editor:</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {instructions.split("UPDATE auth.users")[1]?.trim() || instructions}
                  </pre>
                  <p className="text-sm text-muted-foreground">
                    Then refresh your session by logging out and logging back in.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Admin status set successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSetAdmin} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Admin Status...
              </>
            ) : (
              "Set Me as Admin"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

