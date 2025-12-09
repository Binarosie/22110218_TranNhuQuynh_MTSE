import React from 'react';
import { 
  CartItemCard, 
  CartSummary, 
  PaymentBreakdown 
} from '@yourname/lab07-cart';
import { useCartContext } from '../../contexts/CartContext';

export const Cart = () => {
  const cart = useCartContext();

  const handleCheckout = () => {
    if (cart.selectedItems.length === 0) {
      alert('Vui lòng chọn căn hộ để thanh toán');
      return;
    }
    // Logic checkout ở đây
    console.log('Checkout:', cart.selectedItems);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>

      {cart.loading && <p>Đang tải...</p>}
      {cart.error && <p className="text-red-500">{cart.error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.length === 0 ? (
            <p className="text-gray-500">Giỏ hàng trống</p>
          ) : (
            cart.items.map((item) => (
              <CartItemCard
                key={item.id}
                {...item}
                onMonthsChange={(months) => cart.updateMonths(item.id, months)}
                onRemove={() => cart.removeItem(item.id)}
                onSelectToggle={() => cart.toggleSelect(item.id)}
                selectable
              />
            ))
          )}
        </div>

        {/* Cart summary */}
        <div className="lg:col-span-1">
          <CartSummary
            items={cart.items}
            totals={cart.totals}
            onSelectAll={cart.selectAll}
            onClear={cart.clearCart}
            onCheckout={handleCheckout}
          />
          
          <div className="mt-4">
            <PaymentBreakdown
              items={cart.selectedItems}
              config={{
                taxRate: 0, // Không có thuế
                discountRate: 0, // Không có giảm giá
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
