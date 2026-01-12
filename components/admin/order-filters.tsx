"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [dateFilter, setDateFilter] = useState(searchParams.get("dateFilter") || "all")
  const [selectedDate, setSelectedDate] = useState(searchParams.get("date") || "")
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || "")
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "")

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (status !== "all") params.set("status", status)
    if (dateFilter !== "all") {
      params.set("dateFilter", dateFilter)
      if (dateFilter === "date" && selectedDate) params.set("date", selectedDate)
      if (dateFilter === "month" && selectedMonth) params.set("month", selectedMonth)
      if (dateFilter === "year" && selectedYear) params.set("year", selectedYear)
    }

    router.push(`/admin/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    setStatus("all")
    setDateFilter("all")
    setSelectedDate("")
    setSelectedMonth("")
    setSelectedYear("")
    router.push("/admin/orders")
  }

  const hasActiveFilters = status !== "all" || dateFilter !== "all"

  // Get current month and year for defaults
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Order Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="out_of_delivery">Out of Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="space-y-2">
          <Label>Date Filter</Label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="date">Specific Date</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Inputs */}
        {dateFilter === "date" && (
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        )}

        {dateFilter === "month" && (
          <div className="space-y-2">
            <Label>Select Month</Label>
            <Input
              type="month"
              value={selectedMonth || `${currentYear}-${currentMonth}`}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={`${currentYear}-${currentMonth}`}
            />
          </div>
        )}

        {dateFilter === "year" && (
          <div className="space-y-2">
            <Label>Select Year</Label>
            <Input
              type="number"
              value={selectedYear || currentYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2020"
              max={currentYear}
              placeholder="Year"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {status !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Status: {status}
              </Badge>
            )}
            {dateFilter === "today" && (
              <Badge variant="secondary" className="text-xs">
                Today
              </Badge>
            )}
            {dateFilter === "date" && selectedDate && (
              <Badge variant="secondary" className="text-xs">
                Date: {new Date(selectedDate).toLocaleDateString("en-IN")}
              </Badge>
            )}
            {dateFilter === "month" && selectedMonth && (
              <Badge variant="secondary" className="text-xs">
                Month: {new Date(selectedMonth + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </Badge>
            )}
            {dateFilter === "year" && selectedYear && (
              <Badge variant="secondary" className="text-xs">
                Year: {selectedYear}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

