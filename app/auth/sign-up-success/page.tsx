import Link from "next/link"
import { Mail, Store, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Store className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">ShopKart</span>
          </Link>
        </div>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Thank you for signing up! We&apos;ve sent a confirmation email to your inbox. Please click the link in the
              email to verify your account and start shopping.
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium mb-1">Didn&apos;t receive the email?</p>
              <p className="text-muted-foreground">Check your spam folder or try signing up again.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth/login">
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
