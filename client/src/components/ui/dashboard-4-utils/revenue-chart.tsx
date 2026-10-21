import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RevenuePoint {
  month: string;
  revenue: number;
  orders: number;
}

const defaultEmptyData: RevenuePoint[] = [
  { month: "Mon", revenue: 0, orders: 0 },
  { month: "Tue", revenue: 0, orders: 0 },
  { month: "Wed", revenue: 0, orders: 0 },
  { month: "Thu", revenue: 0, orders: 0 },
  { month: "Fri", revenue: 0, orders: 0 },
  { month: "Sat", revenue: 0, orders: 0 },
  { month: "Sun", revenue: 0, orders: 0 },
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

export function RevenueChart({ data }: { data?: RevenuePoint[] }) {
  const chartData = data && data.length > 0 ? data : defaultEmptyData;
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-row">
          <TrendingUp size={18} className="dashboard-card-icon emerald" />
          <h3 className="dashboard-card-title">Weekly Revenue Trend</h3>
        </div>
        <p className="dashboard-card-desc">Daily gross sales and order volume across the current week</p>
      </div>
      <div className="dashboard-card-content">
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
      </div>
    </div>
  )
}
