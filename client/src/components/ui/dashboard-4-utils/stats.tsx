import * as React from "react"
import { TrendingUp, ShoppingBag, Calendar, UtensilsCrossed } from "lucide-react"

export function DashboardStats({ stats }: { stats?: any }) {
  const revenue = stats?.summary?.totalRevenue ?? 0
  const activeOrders = stats?.summary?.activeKitchenOrders ?? 0
  const bookings = stats?.summary?.todayReservationsCount ?? 0
  const activeDishes = stats?.summary?.activeMenuItems ?? 0
  const totalTables = stats?.summary?.totalTables || 8
  const totalOrders = stats?.summary?.totalOrders ?? 0
  const totalMenuItems = stats?.summary?.totalMenuItems || activeDishes
  const capacityPct = totalTables > 0 ? Math.min(100, Math.round((bookings / totalTables) * 100)) : 0
  const inStockPct = totalMenuItems > 0 ? Math.round((activeDishes / totalMenuItems) * 100) : 100

  return (
    <div className="dashboard-4-stats-grid">
      {/* Total Revenue */}
      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <span className="dashboard-stat-label">Total Revenue</span>
          <div className="dashboard-stat-icon emerald">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="dashboard-stat-value">Rs. {revenue.toLocaleString()}</div>
        <div className="dashboard-stat-footer">
          <span className="dashboard-stat-badge emerald">{totalOrders} Orders</span>
          <span className="dashboard-stat-hint">recorded in database</span>
        </div>
      </div>

      {/* Kitchen Queue */}
      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <span className="dashboard-stat-label">Kitchen Queue</span>
          <div className="dashboard-stat-icon amber">
            <ShoppingBag size={16} />
          </div>
        </div>
        <div className="dashboard-stat-value">{activeOrders} Tickets</div>
        <div className="dashboard-stat-footer">
          <span className="dashboard-stat-pulse" />
          <span className="dashboard-stat-hint">Active preparation</span>
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <span className="dashboard-stat-label">Today's Bookings</span>
          <div className="dashboard-stat-icon emerald">
            <Calendar size={16} />
          </div>
        </div>
        <div className="dashboard-stat-value">{bookings} Tables</div>
        <div className="dashboard-stat-footer">
          <span className="dashboard-stat-badge emerald">{capacityPct}% Capacity</span>
          <span className="dashboard-stat-hint">Confirmed</span>
        </div>
      </div>

      {/* Active Menu Items */}
      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <span className="dashboard-stat-label">Active Menu Items</span>
          <div className="dashboard-stat-icon amber">
            <UtensilsCrossed size={16} />
          </div>
        </div>
        <div className="dashboard-stat-value">{activeDishes} Dishes</div>
        <div className="dashboard-stat-footer">
          <span className="dashboard-stat-accent">{inStockPct}% In Stock</span>
          <span className="dashboard-stat-hint">in kitchen inventory</span>
        </div>
      </div>
    </div>
  )
}
