import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import './VerdoraDatePicker.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Format Date to 'YYYY-MM-DD' in local timezone
 */
function toDateString(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Format 'YYYY-MM-DD' into human-friendly string e.g. "Wed, Oct 21, 2026"
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function VerdoraDatePicker({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Select reservation date...',
  id = 'verdora-reservation-date',
  required = false,
  error = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Compute today's date in local time
  const now = new Date();
  const todayStr = toDateString(now.getFullYear(), now.getMonth(), now.getDate());

  // Current calendar view (year & month)
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts[0]) return parts[0];
    }
    return now.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts[1]) return parts[1] - 1;
    }
    return now.getMonth();
  });

  // Sync view when value changes from outside
  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value]);

  // Smart viewport positioning (open upwards if near bottom of screen)
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 370 && rect.top > 370) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  // Click outside listener to close popup
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dayStr, isPast) => {
    if (isPast) return;
    if (onChange) onChange(dayStr);
    setIsOpen(false);
  };

  // Quick action presets
  const handleSelectToday = (e) => {
    e.stopPropagation();
    if (onChange) onChange(todayStr);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  const handleSelectTomorrow = (e) => {
    e.stopPropagation();
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const tomStr = toDateString(tom.getFullYear(), tom.getMonth(), tom.getDate());
    if (onChange) onChange(tomStr);
    setViewYear(tom.getFullYear());
    setViewMonth(tom.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) onChange('');
    setIsOpen(false);
  };

  // Calculate grid cells for current month
  // Monday as index 0 (0: Mon, 1: Tue, ... 6: Sun)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7; // Monday = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];

  // Trailing days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = toDateString(prevYear, prevMonthIdx, dayNum);
    cells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isPast: dateStr < todayStr,
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateString(viewYear, viewMonth, d);
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isPast: dateStr < todayStr,
    });
  }

  // Leading days of next month to fill grid (total multiple of 7)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = toDateString(nextYear, nextMonthIdx, d);
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isPast: dateStr < todayStr,
      });
    }
  }

  // Disable navigating further back than current month
  const isCurrentMonthOrFuture =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth >= now.getMonth());

  return (
    <div className="vrd-datepicker-root" ref={containerRef}>
      {/* Hidden real input for HTML5 form validation */}
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        required={required}
        readOnly
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px',
          bottom: 0,
          left: 0,
        }}
        tabIndex={-1}
      />

      {/* Styled Trigger Input Field */}
      <button
        type="button"
        className={`vrd-datepicker-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''} ${error ? 'error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={onBlur}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="vrd-datepicker-trigger-content">
          <Calendar size={17} className="vrd-datepicker-calendar-icon" />
          <span className="vrd-datepicker-display-text">
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`vrd-datepicker-arrow-icon ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {/* Luxury Dark Botanical Dropdown Calendar */}
      {isOpen && (
        <div className={`vrd-datepicker-dropdown ${openUpwards ? 'open-upwards' : ''} animate-fade-in`} role="dialog" aria-label="Select date">
          {/* Header: Month / Year Navigation */}
          <div className="vrd-datepicker-header">
            <button
              type="button"
              className="vrd-datepicker-nav-btn"
              onClick={handlePrevMonth}
              disabled={!isCurrentMonthOrFuture && viewYear === now.getFullYear() && viewMonth <= now.getMonth()}
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="vrd-datepicker-title">
              <span className="vrd-datepicker-month">{MONTH_NAMES[viewMonth]}</span>
              <span className="vrd-datepicker-year">{viewYear}</span>
            </div>

            <button
              type="button"
              className="vrd-datepicker-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Names Header */}
          <div className="vrd-datepicker-weekdays">
            {WEEKDAY_NAMES.map((w) => (
              <span key={w} className="vrd-datepicker-weekday">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="vrd-datepicker-grid">
            {cells.map(({ dateStr, dayNum, isCurrentMonth, isPast }) => {
              const isSelected = value === dateStr;
              const isToday = dateStr === todayStr;

              let cellClass = 'vrd-datepicker-day';
              if (!isCurrentMonth) cellClass += ' outside-month';
              if (isPast) cellClass += ' disabled';
              if (isToday) cellClass += ' today';
              if (isSelected) cellClass += ' selected';

              return (
                <button
                  key={dateStr}
                  type="button"
                  className={cellClass}
                  onClick={() => handleSelectDay(dateStr, isPast)}
                  disabled={isPast}
                  title={isPast ? 'Past date unavailable' : dateStr}
                >
                  <span className="vrd-datepicker-day-number">{dayNum}</span>
                  {isSelected && <span className="vrd-datepicker-selected-dot" />}
                  {isToday && !isSelected && <span className="vrd-datepicker-today-dot" />}
                </button>
              );
            })}
          </div>

          {/* Quick Selection Shortcuts Footer */}
          <div className="vrd-datepicker-footer">
            <div className="vrd-datepicker-presets">
              <button
                type="button"
                className={`vrd-datepicker-preset-chip ${value === todayStr ? 'active' : ''}`}
                onClick={handleSelectToday}
              >
                Today
              </button>
              <button
                type="button"
                className="vrd-datepicker-preset-chip"
                onClick={handleSelectTomorrow}
              >
                Tomorrow
              </button>
            </div>
            {value && (
              <button
                type="button"
                className="vrd-datepicker-clear-btn"
                onClick={handleClear}
                title="Clear date selection"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
