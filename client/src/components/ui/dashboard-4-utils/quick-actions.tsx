import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item"
import { Plus, UtensilsCrossed, Calendar, Package, RefreshCw, Sparkles } from "lucide-react"

export function QuickActions({
  onAddDish,
  onViewOrders,
  onViewBookings,
}: {
  onAddDish?: () => void
  onViewOrders?: () => void
  onViewBookings?: () => void
}) {
  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-2 border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>Operational Quick Actions</span>
        </CardTitle>
        <CardDescription>Instant administrative shortcuts for daily cafe floor management</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Item variant="muted" className="p-3 border border-border/40 rounded-lg">
          <ItemMedia variant="icon" className="text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            <Plus className="h-4 w-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Add New Menu Dish</ItemTitle>
            <ItemDescription>Publish breakfast bowls, juices, or artisan roasts</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={onAddDish}>
              Add Dish
            </Button>
          </ItemActions>
        </Item>

        <Item variant="muted" className="p-3 border border-border/40 rounded-lg">
          <ItemMedia variant="icon" className="text-amber-400 bg-amber-500/10 border-amber-500/20">
            <Package className="h-4 w-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Kitchen Live Queue</ItemTitle>
            <ItemDescription>Update ticket states from placed to preparing</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline" onClick={onViewOrders}>
              Orders
            </Button>
          </ItemActions>
        </Item>

        <Item variant="muted" className="p-3 border border-border/40 rounded-lg">
          <ItemMedia variant="icon" className="text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            <Calendar className="h-4 w-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Table Allocations</ItemTitle>
            <ItemDescription>Review guest arrivals and seat dining parties</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline" onClick={onViewBookings}>
              Bookings
            </Button>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  )
}
