import Link from "next/link"
import Image from "next/image"
import { Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, MessageCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  shop: [
    { href: "/products", label: "All Products" },
    // { href: "/products?category=electronics", label: "Electronics" },
    // { href: "/products?category=fashion", label: "Fashion" },
    // { href: "/products?category=home-kitchen", label: "Home & Kitchen" },
  ],
  support: [
    { href: "/track-order", label: "Track Order" },
    { href: "/contact", label: "Contact Us" },
    { href: "/bulk-enquiry", label: "Bulk Enquiry" },
    { href: "/about", label: "About Us" },
    { href: "/blogs", label: "Blog" },
  ],
  legal: [
    // { href: "/privacy", label: "Privacy Policy" },
    // { href: "/terms", label: "Terms of Service" },
    // { href: "/refund", label: "Refund Policy" },
    // { href: "/shipping", label: "Shipping Info" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-secondary border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/logo.avif"
                  alt="Electrotechmart"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold">Electrotechmart</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your one-stop destination for quality products at the best prices. Shop with confidence, delivered across
              India.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://wa.me/message/MIKSWMDCNJYBP1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors" 
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              {/* <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" /> */}
              {/* </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a> */}
              {/* <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a> */}
              {/* <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a> */}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {/* VJ INTERNATIONAL (Electrotech Mart)<br /> */}
                  2, Greenview Avenue, Sola<br />
                  Ahmedabad – 380060, Gujarat
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a 
                  href="tel:+917990024597" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +91 79900 24597
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a 
                  href="https://wa.me/message/MIKSWMDCNJYBP1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  WhatsApp Chat
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a 
                  href="mailto:electrotechmartt@gmail.com" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  electrotechmartt@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Business Hours:</span><br />
                Mon-Sat: 10 AM – 8 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>

          {/* Delivery Charges */}
          <div>
            <h3 className="font-semibold mb-4">Delivery Charges</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Order value ₹200-500: ₹100</li>
              <li>• Order value ₹500-1000: ₹200</li>
              <li>• Order value ₹1000-2000: ₹250</li>
              <li>• Order value ₹2000+: Free delivery</li>
              <li>• Cash on Delivery: +₹80 additional</li>
              <li className="pt-2 border-t border-border">
                <span className="font-semibold">Minimum order: ₹200</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Electrotechmart. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
