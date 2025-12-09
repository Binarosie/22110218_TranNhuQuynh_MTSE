import React from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

/**
 * CartSummary - Tổng hợp giỏ hàng
 * @param {Object} props
 * @param {Array} props.items - Cart items
 * @param {Object} props.totals - Pre-calculated totals
 * @param {function} props.onSelectAll - Select all handler
 * @param {function} props.onClear - Clear cart handler
 * @param {function} props.onCheckout - Checkout handler
 */
export const CartSummary = ({
  items = [],
  totals,
  onSelectAll,
  onClear,
  onCheckout,
  className = "",
}) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  const {
    rentTotal = 0,
    depositTotal = 0,
    maintenanceTotal = 0,
    grandTotal = 0,
  } = totals || {};

  const handleSelectAll = () => {
    onSelectAll && onSelectAll(!allSelected);
  };

  const handleCheckout = () => {
    if (selectedCount === 0) return;
    const selectedIds = items.filter((i) => i.selected).map((i) => i.id);
    onCheckout && onCheckout(selectedIds);
  };

  return (
    <Card className={`bm-cart-summary ${className}`}>
      {/* Select all */}
      <div className="bm-cart-summary__select-all">
        <label className="bm-cart-summary__checkbox-label">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="bm-checkbox"
          />
          <span>
            Chọn tất cả ({selectedCount}/{items.length})
          </span>
        </label>
        <Button variant="secondary" size="sm" onClick={onClear}>
          Xóa giỏ hàng
        </Button>
      </div>

      {/* Totals breakdown */}
      <div className="bm-cart-summary__breakdown">
        <h4 className="bm-cart-summary__title">Tổng kết thanh toán</h4>

        {totals?.rentTotal > 0 && (
          <div className="bm-summary-item">
            <span className="bm-summary-label">Tiền thuê:</span>
            <span className="bm-summary-value">
              {formatPrice(totals.rentTotal)}
            </span>
          </div>
        )}

        {totals?.depositTotal > 0 && (
          <div className="bm-summary-item">
            <span className="bm-summary-label">Đặt cọc:</span>
            <span className="bm-summary-value">
              {formatPrice(totals.depositTotal)}
            </span>
          </div>
        )}

        {totals?.maintenanceTotal > 0 && (
          <div className="bm-summary-item">
            <span className="bm-summary-label">Phí quản lý:</span>
            <span className="bm-summary-value">
              {formatPrice(totals.maintenanceTotal)}
            </span>
          </div>
        )}

        <div className="bm-summary-divider"></div>

        <div className="bm-summary-item bm-summary-item--grand-total">
          <span className="bm-summary-label">Tổng thanh toán:</span>
          <span className="bm-summary-value bm-summary-value--highlight">
            {formatPrice(totals?.grandTotal || 0)}
          </span>
        </div>
      </div>

      {/* Checkout button */}
      <Button
        variant="primary"
        disabled={selectedCount === 0}
        onClick={handleCheckout}
        className="bm-cart-summary__checkout-btn"
      >
        Thanh toán ({selectedCount} căn hộ)
      </Button>
    </Card>
  );
};

export default CartSummary;
