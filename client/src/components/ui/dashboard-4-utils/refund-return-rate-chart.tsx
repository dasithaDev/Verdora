import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { day: "Mon", fulfilled: 42, cancelled: 1 },
  { day: "Tue", fulfilled: 54, cancelled: 2 },
  { day: "Wed", fulfilled: 46, cancelled: 1 },
  { day: "Thu", fulfilled: 65, cancelled: 3 },
  { day: "Fri", fulfilled: 82, cancelled: 2 },
  { day: "Sat", fulfilled: 108, cancelled: 4 },
  { day: "Sun", fulfilled: 95, cancelled: 3 },
]

const chartConfig = {
  fulfilled: {
    label: "Fulfilled Orders",
    color: "hsl(var(--primary))",
  },
  cancelled: {
    label: "Cancelled / Refunded",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function RefundReturnRateChart() {
  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-2 border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Fulfillment vs Return Rate</CardTitle>
          <CardDescription>Order delivery success rate with 97.2% completion</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="fulfilled" fill="hsl(158, 64%, 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
