import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMenuItems } from '../services/menuService';
import {
  UtensilsCrossed,
  Soup,
  GlassWater,
  Flame,
  Cookie,
  Coffee,
  Search,
  Leaf,
  AlertCircle,
  X,
} from 'lucide-react';

const CATEGORIES = ['All', 'Bowls', 'Juices', 'Toast', 'Snacks', 'Beverages'];

const renderCategoryIcon = (category, size = 16) => {
  switch (category) {
    case 'Bowls':
      return <Soup size={size} />;
    case 'Juices':
      return <GlassWater size={size} />;
    case 'Toast':
      return <Flame size={size} />;
    case 'Snacks':
      return <Cookie size={size} />;
    case 'Beverages':
      return <Coffee size={size} />;
    case 'All':
    default:
      return <UtensilsCrossed size={size} />;
  }
};

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Oldest First', value: 'createdAt-asc' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('createdAt-desc');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [expandedCard, setExpandedCard] = useState(null);

  const searchTimeoutRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const fetchMenu = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [sortBy, order] = sortOption.split('-');
      const params = { page, limit: 12, sortBy, order };
      if (activeCategory !== 'All') params.category = activeCategory;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const result = await getMenuItems(params);
      setItems(result.data.items);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load menu');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, debouncedSearch, sortOption]);

  useEffect(() => {
    fetchMenu(1);
  }, [fetchMenu]);

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString('en-LK')}`;
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setExpandedCard(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchMenu(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="menu-page">
      {/* Menu Hero Section */}
      <section className="menu-hero animate-fade-in">
        <div className="menu-hero-badge">
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Leaf size={14} /> Farm-to-Table
          </span>
        </div>
        <h1 className="menu-hero-title">Our Menu</h1>
        <p className="menu-hero-subtitle">
          Handcrafted organic bowls, cold-pressed juices, and artisan toasts — sourced fresh daily from local farms.
        </p>
      </section>

      {/* Search + Sort Controls */}
      <div className="menu-controls animate-fade-in">
        <div className="menu-search-wrapper">
          <span className="menu-search-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            id="menu-search-input"
            className="menu-search-input"
            placeholder="Search by dish name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="menu-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          id="menu-sort-select"
          className="menu-sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter Chips */}
      <div className="menu-category-bar animate-fade-in">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`category-chip-${cat.toLowerCase()}`}
            className={`menu-category-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            <span className="chip-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
              {renderCategoryIcon(cat, 16)}
            </span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Results Summary */}
      {!loading && !error && (
        <div className="menu-results-summary">
          <span>
            Showing <strong>{items.length}</strong> of <strong>{pagination.total}</strong> items
            {activeCategory !== 'All' && (
              <> in <span className="badge badge-info" style={{ marginLeft: '6px' }}>{activeCategory}</span></>
            )}
            {debouncedSearch && (
              <> matching "<em>{debouncedSearch}</em>"</>
            )}
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="menu-loading">
          <div className="menu-loading-spinner"></div>
          <p>Loading fresh picks...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="menu-error glass-panel">
          <span className="menu-error-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <AlertCircle size={32} color="#f87171" />
          </span>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchMenu(1)}>
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="menu-empty glass-panel">
          <span className="menu-empty-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Leaf size={38} color="var(--vrd-emerald, #10b981)" />
          </span>
          <h3>No dishes found</h3>
          <p>Try adjusting your search or filter.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Menu Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="menu-grid">
          {items.map((item, index) => (
            <div
              key={item._id}
              className={`menu-card glass-panel ${expandedCard === item._id ? 'expanded' : ''}`}
              style={{ animationDelay: `${index * 60}ms` }}
              onClick={() => setExpandedCard(expandedCard === item._id ? null : item._id)}
              id={`menu-card-${item._id}`}
            >
              {/* Image */}
              <div className="menu-card-image-wrapper">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="menu-card-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="menu-card-image-placeholder">
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderCategoryIcon(item.category, 36)}
                    </span>
                  </div>
                )}
                <div className="menu-card-category-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {renderCategoryIcon(item.category, 12)} <span>{item.category}</span>
                </div>
                {item.calories && (
                  <div className="menu-card-calories-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={12} /> {item.calories} cal
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="menu-card-content">
                <h3 className="menu-card-title">{item.name}</h3>
                <p className="menu-card-description">{item.description}</p>

                {/* Allergen / Dietary Badges */}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="menu-card-allergens">
                    {item.allergens.map((allergen) => (
                      <span key={allergen} className="allergen-badge">
                        {allergen}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded: Ingredients */}
                {expandedCard === item._id && item.ingredients && item.ingredients.length > 0 && (
                  <div className="menu-card-ingredients animate-fade-in">
                    <span className="ingredients-label">Ingredients:</span>
                    <div className="ingredients-list">
                      {item.ingredients.map((ing) => (
                        <span key={ing} className="ingredient-chip">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price + CTA */}
                <div className="menu-card-footer">
                  <span className="menu-card-price">{formatPrice(item.price)}</span>
                  <button
                    className="btn btn-primary menu-card-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.pages > 1 && (
        <div className="menu-pagination">
          <button
            className="btn btn-secondary pagination-btn"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            ← Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination-page-btn ${pagination.page === p ? 'active' : ''}`}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary pagination-btn"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
