import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { CheckCircle2 } from "lucide-react"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FulfillmentPoint {
  day: string;
  fulfilled: number;
  cancelled: number;
}

const defaultFulfillmentData: FulfillmentPoint[] = [
  { day: "Mon", fulfilled: 0, cancelled: 0 },
  { day: "Tue", fulfilled: 0, cancelled: 0 },
  { day: "Wed", fulfilled: 0, cancelled: 0 },
  { day: "Thu", fulfilled: 0, cancelled: 0 },
  { day: "Fri", fulfilled: 0, cancelled: 0 },
  { day: "Sat", fulfilled: 0, cancelled: 0 },
  { day: "Sun", fulfilled: 0, cancelled: 0 },
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

export function RefundReturnRateChart({ data }: { data?: FulfillmentPoint[] }) {
  const chartData = data && data.length > 0 ? data : defaultFulfillmentData;
  const totalFulfilled = chartData.reduce((acc, c) => acc + c.fulfilled, 0);
  const totalCancelled = chartData.reduce((acc, c) => acc + c.cancelled, 0);
  const totalBoth = totalFulfilled + totalCancelled;
  const rateStr = totalBoth > 0 ? `${((totalFulfilled / totalBoth) * 100).toFixed(1)}%` : '100%';

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-row">
          <CheckCircle2 size={18} className="dashboard-card-icon emerald" />
          <h3 className="dashboard-card-title">Fulfillment vs Cancellation Rate</h3>
        </div>
        <p className="dashboard-card-desc">Order delivery success rate with {rateStr} completion</p>
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
