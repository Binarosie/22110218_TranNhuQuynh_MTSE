import React, { useState } from 'react';
import Button from './Button';

/**
 * FilterPanel Component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Filter controls
 * @param {function} props.onApply - Apply filters handler
 * @param {function} props.onReset - Reset filters handler
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * @param {boolean} props.defaultOpen - Default open state
 */
const FilterPanel = ({ 
  children, 
  onApply, 
  onReset, 
  hasActiveFilters = false,
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium text-gray-900">Bộ lọc</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
              Đang áp dụng
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-gray-200 p-4">
          <div className="space-y-4">{children}</div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={onReset}
              className="flex-1"
              size="sm"
            >
              Xóa bộ lọc
            </Button>
            <Button
              variant="primary"
              onClick={onApply}
              className="flex-1"
              size="sm"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * FilterItem Component - Used inside FilterPanel
 */
export const FilterItem = ({ label, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
};

export default FilterPanel;
