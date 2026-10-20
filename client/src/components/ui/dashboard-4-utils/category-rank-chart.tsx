import * as React from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { category: "Coffee", orders: 480, fill: "hsl(158, 64%, 45%)" },
  { category: "Bowls", orders: 320, fill: "hsl(38, 52%, 61%)" },
  { category: "Juices", orders: 250, fill: "hsl(158, 64%, 35%)" },
  { category: "Toast", orders: 190, fill: "hsl(38, 52%, 50%)" },
  { category: "Pantry", orders: 140, fill: "hsl(140, 20%, 35%)" },
]

const chartConfig = {
  orders: {
    label: "Orders Placed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function CategoryRankChart() {
  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-2 border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Category Popularity Rank</CardTitle>
        <CardDescription>Top culinary menu categories by order volume</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              width={70}
              className="text-xs font-medium fill-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="orders" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
