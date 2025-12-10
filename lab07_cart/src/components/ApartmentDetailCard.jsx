import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { LeaseTermSelector } from "./LeaseTermSelector";

/**
 * ApartmentDetailCard - Chi tiết căn hộ trước khi thêm vào cart
 * @param {Object} props
 * @param {Object} props.apartment - Apartment data from lab05 BE
 * @param {function} props.onAddToCart - Add to cart handler
 * @param {string} props.userRole - User role (Resident/Guest)
 */
export const ApartmentDetailCard = ({
  apartment,
  onAddToCart,
  userRole = "Guest",
  className = "",
}) => {
  const [months, setMonths] = useState(12);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const canRent = apartment.status === "vacant" || apartment.status === "occupied";

  const handleAddToCart = () => {
    console.log('🔍 ApartmentDetailCard - handleAddToCart called');
    console.log('🏠 Apartment full object:', JSON.stringify(apartment, null, 2));
    console.log('💰 monthlyRent raw value:', apartment.monthlyRent);
    console.log('💰 monthlyRent type:', typeof apartment.monthlyRent);
    console.log('📞 onAddToCart function:', typeof onAddToCart);
    
    // Ensure price is a positive number
    const price = Number(apartment.monthlyRent);
    if (!price || price <= 0) {
      console.error('❌ Invalid monthlyRent:', apartment.monthlyRent);
      if (onAddToCart) {
        // Call with error to show proper error message
        return;
      }
    }
    
    const cartItem = {
      apartmentId: apartment.id,
      code: apartment.number,
      title: `Apartment ${apartment.number}`,
      type: "apartment",
      area: apartment.area,
      price: price,
      mode: "rent",
      months: months,
      status: apartment.status,

      // Location
      block: apartment.floor?.block?.name || "N/A",
      building: apartment.floor?.block?.building?.name || "N/A",
      floor: `Floor ${apartment.floor?.number || "N/A"}`,

      // Details (default values since lab05 doesn't have these fields)
      bedrooms: 1,
      bathrooms: 1,
      balconies: 0,
      parkingSlots: 0,

      // Amenities (lab05 doesn't have this field)
      amenities: [],

      // Financial
      maintenanceFee: 500000, // Default maintenance fee
      deposit: price * 2, // 2 months deposit

      // Lease terms
      minLeaseTerm: 6,
      maxLeaseTerm: 36,
    };

    console.log('📦 Cart item to add:', JSON.stringify(cartItem, null, 2));
    
    if (onAddToCart) {
      console.log('✅ Calling onAddToCart...');
      onAddToCart(cartItem);
      setIsAddedToCart(true);
    } else {
      console.error('❌ onAddToCart is not defined!');
    }
  };

  return (
    <Card className={`bm-apartment-detail ${className}`}>
      <div className="bm-apartment-detail__content">
        {/* Image gallery */}
        {apartment.images && apartment.images.length > 0 && (
          <div className="bm-apartment-detail__images">
            <img
              src={apartment.images[0]}
              alt={apartment.apartmentNumber}
              className="bm-apartment-detail__main-image"
            />
          </div>
        )}

        {/* Header */}
        <div className="bm-apartment-detail__header">
          <div>
            <h2 className="bm-apartment-detail__title">Căn hộ</h2>
            <p className="bm-apartment-detail__code">{apartment.number}</p>
          </div>
          <span className={`bm-badge bm-badge--${apartment.status}`}>
            {apartment.status === "vacant" ? "Trống" : "Đã cho thuê"}
          </span>
        </div>

        {/* Location */}
        <div className="bm-apartment-detail__location">
          <h4>Vị trí</h4>
          <div className="bm-location-path">
            <span className="bm-location-badge">
              {apartment.floor?.building?.block?.name || "N/A"}
            </span>
            <span className="bm-location-separator">→</span>
            <span className="bm-location-badge">
              {apartment.floor?.building?.name || "N/A"}
            </span>
            <span className="bm-location-separator">→</span>
            <span className="bm-location-badge">
              Tầng {apartment.floor?.floorNumber || "N/A"}
            </span>
          </div>
        </div>

        {/* Specifications */}
        <div className="bm-apartment-detail__specs">
          <h4>Thông số</h4>
          <div className="bm-specs-grid">
            <div className="bm-spec-item">
              <span className="bm-spec-icon">📐</span>
              <div>
                <p className="bm-spec-label">Diện tích</p>
                <p className="bm-spec-value">{apartment.area} m²</p>
              </div>
            </div>
            <div className="bm-spec-item">
              <span className="bm-spec-icon">💰</span>
              <div>
                <p className="bm-spec-label">Giá thuê/tháng</p>
                <p className="bm-spec-value">{formatPrice(apartment.monthlyRent)}</p>
              </div>
            </div>
            <div className="bm-spec-item">
              <span className="bm-spec-icon">👁️</span>
              <div>
                <p className="bm-spec-label">Lượt xem</p>
                <p className="bm-spec-value">{apartment.viewCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lease term selector */}
        <LeaseTermSelector
          minMonths={6}
          maxMonths={36}
          selectedMonths={months}
          monthlyRent={apartment.monthlyRent}
          onSelect={setMonths}
        />

        {/* Financial summary */}
        <div className="bm-apartment-detail__financial">
          <h4>Tổng thanh toán</h4>
          <div className="bm-financial-summary">
            <div className="bm-financial-row">
              <span>Tiền thuê ({months} tháng):</span>
              <span>{formatPrice(apartment.monthlyRent * months)}</span>
            </div>
            <div className="bm-financial-row">
              <span>Đặt cọc (2 tháng):</span>
              <span>{formatPrice(apartment.monthlyRent * 2)}</span>
            </div>
            <div className="bm-financial-row">
              <span>Phí quản lý ({months} tháng):</span>
              <span>{formatPrice(500000 * months)}</span>
            </div>
            <div className="bm-financial-divider"></div>
            <div className="bm-financial-row bm-financial-row--total">
              <span>Tổng cộng:</span>
              <span className="bm-financial-total">
                {formatPrice(
                  apartment.monthlyRent * months +
                    apartment.monthlyRent * 2 +
                    500000 * months
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Add to cart button */}
        <Button
          variant={isAddedToCart ? "secondary" : "primary"}
          onClick={handleAddToCart}
          disabled={apartment.status === "occupied" || isAddedToCart}
          className="bm-apartment-detail__add-btn"
        >
          {apartment.status === "occupied" 
            ? "Đã cho thuê" 
            : isAddedToCart 
            ? "✓ Đã thêm vào giỏ hàng" 
            : "Thêm vào giỏ hàng"}
        </Button>
      </div>
    </Card>
  );
};

export default ApartmentDetailCard;
