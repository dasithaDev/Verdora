import "./dashboard-4.css";
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
    <div className="dashboard-4-root">
      <DashboardStats stats={stats} />
      <div className="dashboard-4-grid">
        <RevenueChart data={stats?.charts?.weeklyRevenue} />
        <RefundReturnRateChart data={stats?.charts?.fulfillmentRate} />
        <CategoryRankChart data={stats?.charts?.categoryRank} />
        <QuickActions
          onAddDish={onAddDish}
          onViewOrders={onViewOrders}
          onViewBookings={onViewBookings}
        />
      </div>
    </div>
  );
}

export default Dashboard;
