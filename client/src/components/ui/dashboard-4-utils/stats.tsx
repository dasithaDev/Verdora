import * as React from "react"
import { TrendingUp, ShoppingBag, Calendar, UtensilsCrossed } from "lucide-react"

export function DashboardStats({ stats }: { stats?: any }) {
  const revenue = stats?.summary?.totalRevenue || 128450
  const activeOrders = stats?.orders?.activeKitchenQueue || 6
  const bookings = stats?.reservations?.today || 8
  const activeDishes = stats?.menu?.activeAvailable || 24

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
          <span className="dashboard-stat-badge emerald">+14.2%</span>
          <span className="dashboard-stat-hint">vs previous week</span>
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
          <span className="dashboard-stat-badge emerald">88% Capacity</span>
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
          <span className="dashboard-stat-accent">100% In Stock</span>
          <span className="dashboard-stat-hint">in kitchen inventory</span>
        </div>
      </div>
    </div>
  )
}
