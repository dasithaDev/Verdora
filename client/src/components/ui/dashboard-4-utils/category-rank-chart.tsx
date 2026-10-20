import * as React from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { BarChart3 } from "lucide-react"
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
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-row">
          <BarChart3 size={18} className="dashboard-card-icon emerald" />
          <h3 className="dashboard-card-title">Category Popularity Rank</h3>
        </div>
        <p className="dashboard-card-desc">Top culinary menu categories by order volume</p>
      </div>
      <div className="dashboard-card-content">
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
      </div>
    </div>
  )
}
