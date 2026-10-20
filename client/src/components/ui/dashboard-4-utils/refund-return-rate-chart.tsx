import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { CheckCircle2 } from "lucide-react"
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
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-row">
          <CheckCircle2 size={18} className="dashboard-card-icon emerald" />
          <h3 className="dashboard-card-title">Fulfillment vs Return Rate</h3>
        </div>
        <p className="dashboard-card-desc">Order delivery success rate with 97.2% completion</p>
      </div>
      <div className="dashboard-card-content">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="fulfilled" fill="hsl(158, 64%, 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
