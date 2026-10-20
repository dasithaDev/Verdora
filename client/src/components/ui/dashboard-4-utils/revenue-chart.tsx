import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "Mon", revenue: 18500, orders: 42 },
  { month: "Tue", revenue: 22400, orders: 56 },
  { month: "Wed", revenue: 19800, orders: 48 },
  { month: "Thu", revenue: 27900, orders: 68 },
  { month: "Fri", revenue: 34500, orders: 84 },
  { month: "Sat", revenue: 48200, orders: 112 },
  { month: "Sun", revenue: 41800, orders: 98 },
]

const chartConfig = {
  revenue: {
    label: "Revenue (Rs.)",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders Count",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <Card className="col-span-full lg:col-span-2 border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Weekly Revenue Trend</CardTitle>
          <CardDescription>Daily gross sales and order volume across the current week</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(158, 64%, 45%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(158, 64%, 45%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
              stroke="hsl(158, 64%, 45%)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
