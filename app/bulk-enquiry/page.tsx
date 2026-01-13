"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BulkEnquiryPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Bulk Inquiry / Wholesale Orders
          </CardTitle>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Electrotech Mart, we support bulk purchase requirements for:
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Target Audience */}
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div className="flex flex-col items-center p-6 bg-muted/50 rounded-xl">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Retail shops / resellers</h3>
            </div>
            <div className="flex flex-col items-center p-6 bg-muted/50 rounded-xl">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Electricians & contractors</h3>
            </div>
            <div className="flex flex-col items-center p-6 bg-muted/50 rounded-xl">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Builders & project requirements</h3>
            </div>
            <div className="flex flex-col items-center p-6 bg-muted/50 rounded-xl">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Industrial buyers</h3>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-secondary/20 p-8 rounded-2xl border">
            <h3 className="text-2xl font-bold mb-6 text-center">For bulk orders, pricing, and availability, contact us:</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Email */}
              <Link href="mailto:electrotechmartt@gmail.com" className="group">
                <Card className="h-full border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center pt-8 pb-6">
                    <Mail className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg mb-2">Email</h4>
                    <p className="text-muted-foreground mb-2">📩 electrotechmartt@gmail.com</p>
                  </CardContent>
                </Card>
              </Link>

              {/* WhatsApp / Call */}
              <Link href="tel:+917990024597" className="group">
                <Card className="h-full border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center pt-8 pb-6">
                    <Phone className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg mb-2">WhatsApp / Call</h4>
                    <p className="text-muted-foreground mb-2">📱 +91 79900 24597</p>
                  </CardContent>
                </Card>
              </Link>

              {/* WhatsApp Link */}
              <Link href="https://wa.me/message/MIKSWMDCNJYBP1" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center pt-8 pb-6">
                    <Phone className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg mb-2">WhatsApp Link</h4>
                    <p className="text-muted-foreground mb-2">💬 Direct Chat</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Address */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-muted px-6 py-4 rounded-full border">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">📍 2, Greenview Avenue, Sola, Ahmedabad – 380060</span>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-sm font-medium text-amber-900 mb-2 flex items-center justify-center gap-2">
              📌 <span>Mention the product name, quantity, and delivery location for faster response.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
