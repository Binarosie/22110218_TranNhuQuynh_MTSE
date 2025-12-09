import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

/**
 * CartItemCard - Enhanced với apartment details
 * @param {Object} props - Cart item properties
 */
export const CartItemCard = ({
  // Basic info
  id,
  code,
  title,
  type,
  area,
  price,
  mode = "rent",
  status,
  months = 12,

  // Location hierarchy
  block,
  building,
  floor,

  // Apartment details
  bedrooms,
  bathrooms,
  balconies,
  parkingSlots,

  // Amenities
  amenities = [],

  // Financial details
  maintenanceFee = 0,
  deposit = 0,

  // Lease terms
  minLeaseTerm = 6,
  maxLeaseTerm = 36,

  // Handlers
  onMonthsChange,
  onRemove,

  // Selection
  selectable = false,
  selected = false,
  onSelectToggle,

  className = "",
}) => {
  const [currentMonths, setCurrentMonths] = useState(months);

  const handleMonthsChange = (newMonths) => {
    if (newMonths < minLeaseTerm || newMonths > maxLeaseTerm) return;
    setCurrentMonths(newMonths);
    onMonthsChange && onMonthsChange(newMonths);
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateTotal = () => {
    return price * currentMonths + deposit + maintenanceFee * currentMonths;
  };

  return (
    <Card className={`bm-cart-card ${className}`}>
      <div className="bm-cart-card__content">
        {/* Selection checkbox */}
        {selectable && (
          <div className="bm-cart-card__select">
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelectToggle}
              className="bm-checkbox"
            />
          </div>
        )}

        {/* Main content */}
        <div className="bm-cart-card__main">
          {/* Header */}
          <div className="bm-cart-card__header">
            <div className="bm-cart-card__title-group">
              <h3 className="bm-cart-card__title">{title}</h3>
              <span className="bm-cart-card__code">{code}</span>
            </div>
            <span className={`bm-badge bm-badge--${mode}`}>
              {mode === "rent" ? "Thuê" : "Mua"}
            </span>
          </div>

          {/* Location hierarchy */}
          <div className="bm-cart-card__location">
            <span className="bm-location-badge">{block}</span>
            <span className="bm-location-separator">→</span>
            <span className="bm-location-badge">{building}</span>
            <span className="bm-location-separator">→</span>
            <span className="bm-location-badge">{floor}</span>
          </div>

          {/* Apartment details */}
          <div className="bm-cart-card__details">
            <div className="bm-detail-item">
              <span className="bm-detail-label">Diện tích:</span>
              <span className="bm-detail-value">{area} m²</span>
            </div>
            <div className="bm-detail-item">
              <span className="bm-detail-label">Phòng ngủ:</span>
              <span className="bm-detail-value">{bedrooms}</span>
            </div>
            <div className="bm-detail-item">
              <span className="bm-detail-label">Phòng tắm:</span>
              <span className="bm-detail-value">{bathrooms}</span>
            </div>
            {balconies > 0 && (
              <div className="bm-detail-item">
                <span className="bm-detail-label">Ban công:</span>
                <span className="bm-detail-value">{balconies}</span>
              </div>
            )}
            {parkingSlots > 0 && (
              <div className="bm-detail-item">
                <span className="bm-detail-label">Chỗ đỗ xe:</span>
                <span className="bm-detail-value">{parkingSlots}</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bm-cart-card__amenities">
              {amenities.map((amenity, idx) => (
                <span key={idx} className="bm-amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Lease term selector (only for rent) */}
          {mode === "rent" && (
            <div className="bm-cart-card__lease-term">
              <label className="bm-lease-term__label">
                Thời hạn thuê: {currentMonths} tháng
              </label>
              <div className="bm-lease-term__controls">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleMonthsChange(currentMonths - 1)}
                  disabled={currentMonths <= minLeaseTerm}
                >
                  -
                </Button>
                <input
                  type="range"
                  min={minLeaseTerm}
                  max={maxLeaseTerm}
                  value={currentMonths}
                  onChange={(e) => handleMonthsChange(Number(e.target.value))}
                  className="bm-lease-term__slider"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleMonthsChange(currentMonths + 1)}
                  disabled={currentMonths >= maxLeaseTerm}
                >
                  +
                </Button>
              </div>
              <span className="bm-lease-term__range">
                ({minLeaseTerm}-{maxLeaseTerm} tháng)
              </span>
            </div>
          )}

          {/* Financial breakdown */}
          <div className="bm-cart-card__financial">
            <div className="bm-financial-item">
              <span className="bm-financial-label">
                {mode === "rent" ? "Giá thuê/tháng:" : "Giá bán:"}
              </span>
              <span className="bm-financial-value">{formatPrice(price)}</span>
            </div>

            {mode === "rent" && (
              <>
                <div className="bm-financial-item">
                  <span className="bm-financial-label">Đặt cọc:</span>
                  <span className="bm-financial-value">
                    {formatPrice(deposit)}
                  </span>
                </div>
                <div className="bm-financial-item">
                  <span className="bm-financial-label">Phí quản lý/tháng:</span>
                  <span className="bm-financial-value">
                    {formatPrice(maintenanceFee)}
                  </span>
                </div>
                <div className="bm-financial-item bm-financial-item--total">
                  <span className="bm-financial-label">Tổng thanh toán:</span>
                  <span className="bm-financial-value bm-financial-value--highlight">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bm-cart-card__actions">
          <Button variant="danger" onClick={onRemove}>
            Xóa
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CartItemCard;
