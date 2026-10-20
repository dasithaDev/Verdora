import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ShoppingBag, Users, Calendar, UtensilsCrossed } from "lucide-react"

export function DashboardStats({ stats }: { stats?: any }) {
  const revenue = stats?.summary?.totalRevenue || 128450
  const activeOrders = stats?.orders?.activeKitchenQueue || 6
  const bookings = stats?.reservations?.today || 8
  const activeDishes = stats?.menu?.activeAvailable || 24

  return (
    <div className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">Rs. {revenue.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] px-1.5 py-0.5">
              +14.2%
            </Badge>
            <span>vs previous week</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Kitchen Queue</CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{activeOrders} Tickets</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Active preparation</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Bookings</CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{bookings} Tables</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] px-1.5 py-0.5">
              88% Capacity
            </Badge>
            <span>Confirmed</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Menu Items</CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{activeDishes} Dishes</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span className="text-emerald-400 font-medium">100% In Stock</span>
            <span>in kitchen inventory</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
