import React from "react";

/**
 * LeaseTermSelector - Chọn thời hạn thuê
 * @param {Object} props
 * @param {number} props.minMonths - Số tháng tối thiểu
 * @param {number} props.maxMonths - Số tháng tối đa
 * @param {number} props.selectedMonths - Số tháng hiện tại
 * @param {number} props.monthlyRent - Giá thuê hàng tháng
 * @param {function} props.onSelect - Callback khi thay đổi
 */
export const LeaseTermSelector = ({
  minMonths = 6,
  maxMonths = 36,
  selectedMonths = 12,
  monthlyRent = 0,
  onSelect,
  className = "",
}) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onSelect && onSelect(value);
  };

  const totalCost = monthlyRent * selectedMonths;

  return (
    <div className={`bm-lease-selector ${className}`}>
      <h4 className="bm-lease-selector__title">Thời hạn thuê</h4>

      <div className="bm-lease-selector__content">
        <div className="bm-lease-selector__slider-container">
          <input
            type="range"
            min={minMonths}
            max={maxMonths}
            step={1}
            value={selectedMonths}
            onChange={handleChange}
            className="bm-lease-slider"
          />
          <div className="bm-lease-selector__markers">
            <span className="bm-lease-marker">{minMonths} tháng</span>
            <span className="bm-lease-marker">{maxMonths} tháng</span>
          </div>
        </div>

        <div className="bm-lease-selector__display">
          <div className="bm-lease-value">
            <span className="bm-lease-value__number">{selectedMonths}</span>
            <span className="bm-lease-value__unit">tháng</span>
          </div>

          <div className="bm-lease-cost">
            <p className="bm-lease-cost__label">Chi phí thuê:</p>
            <p className="bm-lease-cost__amount">{formatPrice(totalCost)}</p>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="bm-lease-selector__quick-picks">
          {[6, 12, 24, 36].map((term) => {
            if (term < minMonths || term > maxMonths) return null;
            return (
              <button
                key={term}
                className={`bm-quick-pick ${
                  selectedMonths === term ? "bm-quick-pick--active" : ""
                }`}
                onClick={() => onSelect && onSelect(term)}
              >
                {term} tháng
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaseTermSelector;
