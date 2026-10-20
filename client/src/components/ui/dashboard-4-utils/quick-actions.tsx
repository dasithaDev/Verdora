import * as React from "react"
import { Sparkles, Plus, ShoppingBag, Calendar } from "lucide-react"

export function QuickActions({
  onAddDish,
  onViewOrders,
  onViewBookings,
}: {
  onAddDish?: () => void
  onViewOrders?: () => void
  onViewBookings?: () => void
}) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-row">
          <Sparkles size={18} className="dashboard-card-icon emerald" />
          <h3 className="dashboard-card-title">Operational Quick Actions</h3>
        </div>
        <p className="dashboard-card-desc">Instant administrative shortcuts for daily cafe floor management</p>
      </div>
      <div className="dashboard-card-content">
        <div className="dashboard-quick-actions-list">
          <div className="dashboard-action-row">
            <div className="dashboard-action-left">
              <div className="dashboard-action-icon-badge emerald">
                <Plus size={18} />
              </div>
              <div className="dashboard-action-text">
                <div className="dashboard-action-name">Add New Menu Dish</div>
                <div className="dashboard-action-hint">Publish breakfast bowls, juices, or artisan roasts</div>
              </div>
            </div>
            <button className="dashboard-action-btn primary" onClick={onAddDish}>
              Add Dish
            </button>
          </div>

          <div className="dashboard-action-row">
            <div className="dashboard-action-left">
              <div className="dashboard-action-icon-badge amber">
                <ShoppingBag size={18} />
              </div>
              <div className="dashboard-action-text">
                <div className="dashboard-action-name">Kitchen Live Queue</div>
                <div className="dashboard-action-hint">Update ticket states from placed to preparing</div>
              </div>
            </div>
            <button className="dashboard-action-btn secondary" onClick={onViewOrders}>
              Orders
            </button>
          </div>

          <div className="dashboard-action-row">
            <div className="dashboard-action-left">
              <div className="dashboard-action-icon-badge emerald">
                <Calendar size={18} />
              </div>
              <div className="dashboard-action-text">
                <div className="dashboard-action-name">Table Allocations</div>
                <div className="dashboard-action-hint">Review guest arrivals and seat dining parties</div>
              </div>
            </div>
            <button className="dashboard-action-btn secondary" onClick={onViewBookings}>
              Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
