import React from "react";
import { Card } from "./ui/Card";

/**
 * PaymentBreakdown - Chi tiết phân tích chi phí
 * @param {Object} props
 * @param {Array} props.items - Danh sách items trong cart
 * @param {Object} props.config - Cấu hình (tax, discount, etc.)
 */
export const PaymentBreakdown = ({
  items = [],
  config = {},
  className = "",
}) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate totals by category
  const calculateTotals = () => {
    let rentTotal = 0;
    let depositTotal = 0;
    let maintenanceTotal = 0;

    items.forEach((item) => {
      rentTotal += item.price * item.months;
      depositTotal += item.deposit || 0;
      maintenanceTotal += (item.maintenanceFee || 0) * item.months;
    });

    return { rentTotal, depositTotal, maintenanceTotal };
  };

  const totals = calculateTotals();
  const subtotal =
    totals.rentTotal + totals.depositTotal + totals.maintenanceTotal;

  // Apply tax if configured
  const taxRate = config.taxRate || 0;
  const taxAmount = subtotal * taxRate;

  // Apply discount if configured
  const discountRate = config.discountRate || 0;
  const discountAmount = subtotal * discountRate;

  const grandTotal = subtotal + taxAmount - discountAmount;

  return (
    <Card className={`bm-payment-breakdown ${className}`}>
      <div className="bm-payment-breakdown__content">
        <h3 className="bm-payment-breakdown__title">Chi tiết thanh toán</h3>

        {/* Items count */}
        <div className="bm-breakdown-row bm-breakdown-row--info">
          <span>Số lượng căn hộ:</span>
          <span className="bm-breakdown-value">{items.length}</span>
        </div>

        <div className="bm-breakdown-divider"></div>

        {/* Rent totals */}
        {totals.rentTotal > 0 && (
          <>
            <div className="bm-breakdown-section">
              <h4 className="bm-breakdown-section__title">Chi tiết thanh toán</h4>
              <div className="bm-breakdown-row">
                <span>Tiền thuê:</span>
                <span className="bm-breakdown-value">
                  {formatPrice(totals.rentTotal)}
                </span>
              </div>
              <div className="bm-breakdown-row">
                <span>Đặt cọc:</span>
                <span className="bm-breakdown-value">
                  {formatPrice(totals.depositTotal)}
                </span>
              </div>
              <div className="bm-breakdown-row">
                <span>Phí quản lý:</span>
                <span className="bm-breakdown-value">
                  {formatPrice(totals.maintenanceTotal)}
                </span>
              </div>
            </div>
            <div className="bm-breakdown-divider"></div>
          </>
        )}

        {/* Subtotal */}
        <div className="bm-breakdown-row bm-breakdown-row--subtotal">
          <span>Tạm tính:</span>
          <span className="bm-breakdown-value">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Tax */}
        {taxRate > 0 && (
          <div className="bm-breakdown-row bm-breakdown-row--tax">
            <span>Thuế ({(taxRate * 100).toFixed(1)}%):</span>
            <span className="bm-breakdown-value bm-breakdown-value--positive">
              +{formatPrice(taxAmount)}
            </span>
          </div>
        )}

        {/* Discount */}
        {discountRate > 0 && (
          <div className="bm-breakdown-row bm-breakdown-row--discount">
            <span>Giảm giá ({(discountRate * 100).toFixed(1)}%):</span>
            <span className="bm-breakdown-value bm-breakdown-value--negative">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}

        {/* Grand total */}
        <div className="bm-breakdown-divider bm-breakdown-divider--thick"></div>
        <div className="bm-breakdown-row bm-breakdown-row--total">
          <span className="bm-breakdown-total-label">Tổng cộng:</span>
          <span className="bm-breakdown-total-value">
            {formatPrice(grandTotal)}
          </span>
        </div>

        {/* Payment note */}
        {items.length > 0 && (
          <div className="bm-breakdown-note">
            <p>
              <strong>Lưu ý:</strong> Giá trên chưa bao gồm các chi phí phát
              sinh như điện, nước, internet, v.v.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentBreakdown;
