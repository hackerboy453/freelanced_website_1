"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { formatPrice } from "@/lib/utils/tax"
import type { Order, OrderItem } from "@/lib/types"

interface PrintReceiptProps {
  order: Order & { order_items: OrderItem[] }
  customerName?: string
  customerPhone?: string
  customerEmail?: string
}

export function PrintReceipt({ order, customerName, customerPhone, customerEmail }: PrintReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to print the receipt")
      return
    }

    const printContent = printRef.current.innerHTML
    const printStyles = `
      <style>
        @media print {
          @page {
            margin: 20mm;
            size: A4;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          background: #fff;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .receipt-header h1 {
          font-size: 24pt;
          margin: 0;
          font-weight: bold;
        }
        .receipt-header p {
          margin: 5px 0;
          font-size: 10pt;
        }
        .receipt-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .info-section p {
          margin: 5px 0;
          font-size: 11pt;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th {
          background-color: #f0f0f0;
          padding: 10px;
          text-align: left;
          border: 1px solid #ccc;
          font-weight: bold;
        }
        .items-table td {
          padding: 8px 10px;
          border: 1px solid #ccc;
        }
        .items-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .totals {
          margin-top: 20px;
          border-top: 2px solid #000;
          padding-top: 15px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 11pt;
        }
        .totals-row.total {
          font-size: 14pt;
          font-weight: bold;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          font-size: 10pt;
          color: #666;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 10pt;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-confirmed { background-color: #dbeafe; color: #1e40af; }
        .status-shipped { background-color: #e0e7ff; color: #3730a3; }
        .status-delivered { background-color: #d1fae5; color: #065f46; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .status-failed { background-color: #fee2e2; color: #991b1b; }
      </style>
    `

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.order_number}</title>
          ${printStyles}
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const shippingName = (order as any).shipping_full_name || customerName || "N/A"
  const shippingPhone = (order as any).shipping_phone || customerPhone || "N/A"
  const statusClass = `status-${order.status}`

  return (
    <div>
      <Button onClick={handlePrint} variant="outline" className="no-print mb-4">
        <Printer className="h-4 w-4 mr-2" />
        Print Receipt
      </Button>
      
      <div ref={printRef} className="bg-white text-black p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="receipt-header">
          <h1>E-Commerce Store</h1>
          <p>Order Receipt</p>
          <p>Order Number: <strong>{order.order_number}</strong></p>
          <p>
            Date: {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <span className={`status-badge ${statusClass}`}>
            {order.status.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Order and Customer Info */}
        <div className="receipt-info">
          <div className="info-section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> {shippingName}</p>
            {customerEmail && <p><strong>Email:</strong> {customerEmail}</p>}
            <p><strong>Phone:</strong> {shippingPhone}</p>
          </div>
          <div className="info-section">
            <h3>Shipping Address</h3>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
            </p>
            <p><strong>Payment Method:</strong> {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method.toUpperCase()}</p>
          </div>
        </div>

        {/* Order Items */}
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.product_title}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.product_price)}</td>
                <td>{formatPrice(item.product_price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals">
          <div className="totals-row">
            <span>Subtotal:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="totals-row">
            <span>GST (18%):</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          {order.payment_method === "cod" && (
            <div className="totals-row">
              <span>Shipping Fee:</span>
              <span>₹80</span>
            </div>
          )}
          <div className="totals-row total">
            <span>Total Amount:</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your purchase!</p>
          <p>For any queries, please contact our support team.</p>
          <p>This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>
    </div>
  )
}

