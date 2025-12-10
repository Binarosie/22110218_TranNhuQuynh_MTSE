import { useState, useEffect } from 'react';
import { useCart } from '@yourname/lab07-cart';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Cart = () => {
  const { items, loading, error, removeItem, refreshCart } = useCart();
  const [rentingId, setRentingId] = useState(null);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleRentApartment = async (cartItem) => {
    if (!cartItem.apartmentId) {
      toast.error('Thông tin căn hộ không hợp lệ');
      return;
    }

    try {
      setRentingId(cartItem.id);
      
      // Calculate lease dates based on leaseTerm
      const leaseStartDate = new Date();
      const leaseEndDate = new Date();
      leaseEndDate.setMonth(leaseEndDate.getMonth() + (cartItem.leaseTerm || 12));

      const response = await api.post(`/cart/rent/${cartItem.id}`, {
        leaseStartDate,
        leaseEndDate
      });

      if (response.data.success) {
        toast.success('🎉 ' + response.data.message);
        await refreshCart(); // Refresh cart to remove rented item
      }
    } catch (error) {
      console.error('Rent error:', error);
      toast.error(error.response?.data?.error || 'Không thể thuê căn hộ');
    } finally {
      setRentingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getLocationText = (apartment) => {
    if (!apartment) return 'N/A';
    
    const parts = [];
    if (apartment.number) parts.push(`Căn ${apartment.number}`);
    if (apartment.floor?.name) parts.push(`Tầng ${apartment.floor.name}`);
    if (apartment.floor?.block?.name) parts.push(`Block ${apartment.floor.block.name}`);
    if (apartment.floor?.block?.building?.name) parts.push(apartment.floor.block.building.name);
    
    return parts.join(', ') || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng của tôi</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống</p>
          <a
            href="/apartments"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Khám phá căn hộ
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const apartment = item.apartment;
            const isRenting = rentingId === item.id;
            const isOccupied = apartment?.status === 'occupied';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  isOccupied ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Apartment Image */}
                  <div className="w-full md:w-48 h-48 flex-shrink-0">
                    <img
                      src={apartment?.image || 'https://via.placeholder.com/300x200?text=Apartment'}
                      alt={apartment?.number || 'Apartment'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Apartment Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {getLocationText(apartment)}
                        </h3>
                        
                        {isOccupied && (
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mb-2">
                            Đã được thuê
                          </span>
                        )}

                        <div className="space-y-1 text-gray-600">
                          <p>
                            <span className="font-medium">Diện tích:</span>{' '}
                            {apartment?.area ? `${apartment.area} m²` : 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Giá thuê:</span>{' '}
                            {apartment?.monthlyRent
                              ? formatCurrency(apartment.monthlyRent)
                              : 'N/A'}
                            /tháng
                          </p>
                          <p>
                            <span className="font-medium">Thời hạn thuê:</span>{' '}
                            {item.leaseTerm || 12} tháng
                          </p>
                          <p>
                            <span className="font-medium">Tổng cộng:</span>{' '}
                            <span className="text-blue-600 font-semibold text-lg">
                              {apartment?.monthlyRent
                                ? formatCurrency(
                                    apartment.monthlyRent * (item.leaseTerm || 12)
                                  )
                                : 'N/A'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleRentApartment(item)}
                        disabled={isRenting || isOccupied}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          isRenting || isOccupied
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isRenting ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Đang xử lý...
                          </span>
                        ) : isOccupied ? (
                          'Không khả dụng'
                        ) : (
                          'Thuê ngay'
                        )}
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRenting}
                        className="px-6 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Cart Summary */}
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Tổng kết</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Số căn hộ:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>Tổng tiền:</span>
                <span>
                  {formatCurrency(
                    items.reduce((total, item) => {
                      const price = item.apartment?.monthlyRent || 0;
                      const term = item.leaseTerm || 12;
                      return total + price * term;
                    }, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
