import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface PriceRange {
  min: number;
  max: number;
}

interface PriceRangeFilterProps {
  /** Absolute min price across all visible products */
  absoluteMin: number;
  /** Absolute max price across all visible products */
  absoluteMax: number;
  /** Currently applied range */
  value: PriceRange;
  /** Called whenever the applied range changes */
  onChange: (range: PriceRange) => void;
  /** Optional: show as inline panel (sidebar) vs drawer sheet */
  variant?: 'sidebar' | 'drawer';
  /** Called when the drawer "Close" is requested */
  onClose?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const SESSION_KEY = 'farminix_priceFilter_v2';

export function loadSavedPriceRange(absMin: number, absMax: number): PriceRange {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PriceRange;
      if (
        typeof parsed.min === 'number' &&
        typeof parsed.max === 'number' &&
        parsed.min >= absMin &&
        parsed.max <= absMax &&
        parsed.min <= parsed.max
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { min: absMin, max: absMax };
}

export function savePriceRange(range: PriceRange) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(range));
  } catch {
    // ignore
  }
}

export function clearSavedPriceRange() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  absoluteMin,
  absoluteMax,
  value,
  onChange,
  variant = 'sidebar',
  onClose,
}) => {
  // Local draft state while dragging (applied on mouse-up or "Apply")
  const [draft, setDraft] = useState<PriceRange>(value);
  const [collapsed, setCollapsed] = useState(false);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  // Sync draft when external value changes (e.g. Reset from parent)
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const range = absoluteMax - absoluteMin || 1;
  const leftPct = ((draft.min - absoluteMin) / range) * 100;
  const rightPct = 100 - ((draft.max - absoluteMin) / range) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), draft.max - 1);
      const newDraft = { ...draft, min: v };
      setDraft(newDraft);
      onChange(newDraft);
      savePriceRange(newDraft);
    },
    [draft, onChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), draft.min + 1);
      const newDraft = { ...draft, max: v };
      setDraft(newDraft);
      onChange(newDraft);
      savePriceRange(newDraft);
    },
    [draft, onChange]
  );

  const handleReset = () => {
    const full: PriceRange = { min: absoluteMin, max: absoluteMax };
    setDraft(full);
    onChange(full);
    clearSavedPriceRange();
  };

  const isFiltered = draft.min > absoluteMin || draft.max < absoluteMax;

  // ── Sidebar variant ───────────────────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div className="price-filter-sidebar">
        {/* Header row */}
        <div className="pf-header">
          <div className="pf-header-left">
            <SlidersHorizontal className="pf-icon" />
            <span className="pf-title">Price Range</span>
            {isFiltered && <span className="pf-active-dot" />}
          </div>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="pf-collapse-btn"
            aria-label={collapsed ? 'Expand price filter' : 'Collapse price filter'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible body */}
        <div className={`pf-body ${collapsed ? 'pf-body-collapsed' : 'pf-body-open'}`}>
          {/* Live price display */}
          <div className="pf-price-display">
            <span className="pf-price-value">{fmt(draft.min)}</span>
            <span className="pf-price-dash">–</span>
            <span className="pf-price-value">{fmt(draft.max)}</span>
          </div>

          {/* Dual-handle slider */}
          <div className="pf-slider-wrap">
            <div className="pf-track">
              <div
                className="pf-track-fill"
                style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
              />
            </div>
            <input
              ref={minRef}
              type="range"
              min={absoluteMin}
              max={absoluteMax}
              value={draft.min}
              onChange={handleMinChange}
              className="pf-range pf-range-min"
              aria-label="Minimum price"
            />
            <input
              ref={maxRef}
              type="range"
              min={absoluteMin}
              max={absoluteMax}
              value={draft.max}
              onChange={handleMaxChange}
              className="pf-range pf-range-max"
              aria-label="Maximum price"
            />
          </div>

          {/* Boundary labels */}
          <div className="pf-bounds">
            <span>{fmt(absoluteMin)}</span>
            <span>{fmt(absoluteMax)}</span>
          </div>

          {/* Actions */}
          <div className="pf-actions">
            {isFiltered && (
              <button onClick={handleReset} className="pf-btn-reset">
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Drawer variant ────────────────────────────────────────────────────────
  return (
    <div className="price-filter-drawer">
      {/* Drawer header */}
      <div className="pf-drawer-header">
        <div className="pf-header-left">
          <SlidersHorizontal className="pf-icon" />
          <span className="pf-title">Price Range</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="pf-drawer-close" aria-label="Close filter">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Live price display */}
      <div className="pf-price-display pf-price-display-lg">
        <span className="pf-price-value-lg">{fmt(draft.min)}</span>
        <span className="pf-price-dash-lg">–</span>
        <span className="pf-price-value-lg">{fmt(draft.max)}</span>
      </div>

      {/* Dual-handle slider */}
      <div className="pf-slider-wrap pf-slider-wrap-lg">
        <div className="pf-track pf-track-lg">
          <div
            className="pf-track-fill"
            style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
          />
        </div>
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          value={draft.min}
          onChange={handleMinChange}
          className="pf-range pf-range-min"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={absoluteMax}
          max={absoluteMax}
          value={draft.max}
          onChange={handleMaxChange}
          className="pf-range pf-range-max"
          aria-label="Maximum price"
        />
      </div>

      {/* Boundary labels */}
      <div className="pf-bounds pf-bounds-lg">
        <span>{fmt(absoluteMin)}</span>
        <span>{fmt(absoluteMax)}</span>
      </div>

      {/* Drawer actions */}
      <div className="pf-drawer-actions">
        <button onClick={handleReset} className="pf-drawer-btn-reset">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        {onClose && (
          <button onClick={onClose} className="pf-drawer-btn-apply">
            Apply Filter
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Active filter chip (shown above product grid)
// ─────────────────────────────────────────────────────────────────────────────
interface ActiveFilterChipProps {
  value: PriceRange;
  absoluteMin: number;
  absoluteMax: number;
  onClear: () => void;
}

export const ActiveFilterChip: React.FC<ActiveFilterChipProps> = ({
  value,
  absoluteMin,
  absoluteMax,
  onClear,
}) => {
  const isFiltered = value.min > absoluteMin || value.max < absoluteMax;
  if (!isFiltered) return null;

  return (
    <div className="pf-chip-wrap">
      <div className="pf-chip">
        <SlidersHorizontal className="w-3 h-3 text-purple-500 shrink-0" />
        <span>
          {fmt(value.min)} – {fmt(value.max)}
        </span>
        <button
          onClick={onClear}
          className="pf-chip-clear"
          aria-label="Clear price filter"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty state when price filter returns 0 products
// ─────────────────────────────────────────────────────────────────────────────
interface PriceEmptyStateProps {
  onClear: () => void;
}

export const PriceEmptyState: React.FC<PriceEmptyStateProps> = ({ onClear }) => (
  <div className="pf-empty">
    <div className="pf-empty-icon">
      <span>🔍</span>
    </div>
    <h3 className="pf-empty-title">No products in this price range</h3>
    <p className="pf-empty-desc">
      No products found in this price range.
      <br />
      Try adjusting your filter or clearing all filters.
    </p>
    <button onClick={onClear} className="pf-empty-btn">
      <RotateCcw className="w-4 h-4" />
      Clear Price Filter
    </button>
  </div>
);
