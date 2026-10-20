import { CategoryRankChart } from "@/components/ui/dashboard-4-utils/category-rank-chart";
import { QuickActions } from "@/components/ui/dashboard-4-utils/quick-actions";
import { RefundReturnRateChart } from "@/components/ui/dashboard-4-utils/refund-return-rate-chart";
import { RevenueChart } from "@/components/ui/dashboard-4-utils/revenue-chart";
import { DashboardStats } from "@/components/ui/dashboard-4-utils/stats";

export function Dashboard({
  stats,
  onAddDish,
  onViewOrders,
  onViewBookings,
}: {
  stats?: any;
  onAddDish?: () => void;
  onViewOrders?: () => void;
  onViewBookings?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStats stats={stats} />
      <RevenueChart />
      <RefundReturnRateChart />
      <CategoryRankChart />
      <QuickActions
        onAddDish={onAddDish}
        onViewOrders={onViewOrders}
        onViewBookings={onViewBookings}
      />
    </div>
  );
}

export default Dashboard;
