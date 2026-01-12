import Image from "next/image"
import { CheckCircle, Users, Package, Truck, Award, Mail, Phone, MapPin, Clock, MessageCircle, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stats = [
  { icon: Users, value: "100K+", label: "Happy Customers" },
  { icon: Package, value: "50K+", label: "Products Sold" },
  { icon: Truck, value: "500+", label: "Cities Covered" },
  { icon: Award, value: "5+", label: "Years of Trust" },
]

const values = [
  {
    title: "Quality First",
    description: "We source only the best products from trusted manufacturers and brands.",
  },
  {
    title: "Customer Centric",
    description: "Your satisfaction is our priority. We're here to help 24/7.",
  },
  {
    title: "Fast Delivery",
    description: "Quick and reliable delivery across India with real-time tracking.",
  },
  {
    title: "Secure Shopping",
    description: "Shop with confidence with our secure payment options and data protection.",
  },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">About ShopKart</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          We&apos;re on a mission to make online shopping simple, affordable, and enjoyable for everyone in India.
        </p>
      </section>

      {/* Stats */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image src="/modern-ecommerce-team-meeting.jpg" alt="Our team" fill className="object-cover" />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            ShopKart was founded in 2020 with a simple idea: to create an online shopping experience that truly puts
            customers first. What started as a small venture has grown into one of India&apos;s most trusted e-commerce
            platforms.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, we serve millions of customers across 500+ cities in India, offering a wide range of products from
            electronics and fashion to home essentials and more. Our commitment to quality, affordability, and customer
            service remains at the heart of everything we do.
          </p>
          <ul className="space-y-2">
            {[
              "Quality products at best prices",
              "Fast & reliable delivery",
              "24/7 customer support",
              "Easy returns & refunds",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <Card key={value.title}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Get In Touch</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Methods */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a 
                    href="mailto:electrotechmartt@gmail.com" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    electrotechmartt@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Phone / WhatsApp</h3>
                  <a 
                    href="tel:+917990024597" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                  >
                    +91 79900 24597
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp Chat</h3>
                  <a 
                    href="https://wa.me/message/MIKSWMDCNJYBP1" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Chat with us directly
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address & Hours */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Our Address</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {/* VJ INTERNATIONAL (Electrotech Mart)<br /> */}
                    2, Greenview Avenue, Sola<br />
                    Ahmedabad – 380060<br />
                    Gujarat, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Monday to Saturday: 10:00 AM – 8:00 PM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sunday: Closed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Urgent support available on WhatsApp)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Orders Section */}
        <Card className="mt-8 max-w-4xl mx-auto bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <ShoppingCart className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Bulk Inquiry / Wholesale Orders</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We provide special wholesale pricing for bulk orders. To get a quick quotation, send us:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Product name / link</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Quantity required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Delivery location (City/Pincode)</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="default">
                    <a href="mailto:electrotechmartt@gmail.com">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Us
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="tel:+917990024597">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="https://wa.me/message/MIKSWMDCNJYBP1" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-muted rounded-lg p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Join millions of happy customers and experience the best online shopping in India.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/products">
              Browse Products
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}