import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApartmentDetailCard } from '@yourname/lab07-cart';
import { useCartContext } from '../../contexts/CartContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Modal from '../../components/common/Modal';
import apartmentService from '../../services/apartmentService';
import rentalService from '../../services/rentalService';
import { APARTMENT_STATUS_LABELS, APARTMENT_STATUS_COLORS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * ApartmentDetail Page
 * View apartment details and rent (if vacant)
 */
const ApartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCartContext();
  
  // DEBUG: Log cart context
  console.log('🛒 Cart context in ApartmentDetail:', cart);
  console.log('👤 User:', user);
  console.log('🔑 Cart enabled:', cart?.enabled);
  console.log('📋 Cart items:', cart?.items);
  console.log('➕ Cart addItem:', typeof cart?.addItem);
  
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentLoading, setRentLoading] = useState(false);
  const [rentModal, setRentModal] = useState(false);
  const [showCartView, setShowCartView] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadApartment = async () => {
      if (!mounted) return;
      await fetchApartment();
    };

    loadApartment();

    return () => {
      mounted = false;
    };
  }, [id]); // Only refetch when apartment ID changes

  const fetchApartment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apartmentService.getApartmentById(id);
      const data = response.data.data;
      
      console.log('🏠 Apartment data:', JSON.stringify(data, null, 2));
      console.log('📍 Floor:', data?.floor ? JSON.stringify(data.floor, null, 2) : 'NULL');
      console.log('🏢 Block:', data?.floor?.block ? JSON.stringify(data.floor.block, null, 2) : 'NULL');
      console.log('🏗️ Building:', data?.floor?.block?.building ? JSON.stringify(data.floor.block.building, null, 2) : 'NULL');
      
      setApartment(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRent = async () => {
    try {
      setRentLoading(true);
      await rentalService.rentApartment(id);
      setRentModal(false);
      navigate('/my-apartments');
    } catch (err) {
      setError(err);
    } finally {
      setRentLoading(false);
    }
  };

  const handleAddToCart = async (cartItem) => {
    console.log('🚀 handleAddToCart called!');
    console.log('📦 Cart item:', cartItem);
    console.log('💰 Price:', cartItem.price);
    
    try {
      const success = await cart.addItem(cartItem);
      console.log('✅ Add result:', success);
      
      if (success) {
        toast.success('🎉 Đã thêm vào giỏ hàng thành công!');
      } else if (cart.error) {
        // Show backend error message
        const errorMessage = cart.error.includes('đã được thuê') || 
                           cart.error.includes('bảo trì') ||
                           cart.error.includes('đã có trong giỏ hàng')
          ? cart.error
          : 'Có lỗi xảy ra khi thêm vào giỏ hàng';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('❌ Add to cart error:', err);
      const errorMessage = err?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng';
      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const label = APARTMENT_STATUS_LABELS[status] || 'Không xác định';
    const colorClass = APARTMENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${colorClass}`}>
        {label}
      </span>
    );
  };

  if (loading) return <Loading text="Đang tải thông tin căn hộ..." />;
  if (error) return <ErrorMessage error={error} onRetry={fetchApartment} />;
  if (!apartment) return <ErrorMessage error="Không tìm thấy căn hộ" />;

  const canRent = user && apartment.status === 'vacant';

  return (
    <div className="space-y-6">
      {/* Toggle View Buttons */}
      <div className="flex gap-4">
        <Button 
          variant={!showCartView ? "primary" : "secondary"}
          onClick={() => setShowCartView(false)}
        >
          Chi tiết mặc định
        </Button>
        <Button 
          variant={showCartView ? "primary" : "secondary"}
          onClick={() => setShowCartView(true)}
        >
          Xem với Cart UI (Lab07)
        </Button>
      </div>

      {/* Show Cart UI View */}
      {showCartView ? (
        <ApartmentDetailCard
          apartment={apartment}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Căn hộ #{apartment.id}</h1>
              <p className="mt-1 text-gray-600">
                {apartment.floor?.block?.building?.name && apartment.floor?.block?.name ? (
                  <>
                    {apartment.floor.block.building.name}
                    {' → '}
                    {apartment.floor.block.name}
                    {' → '}
                    Tầng {apartment.floor.number ?? 'N/A'}
                  </>
                ) : (
                  <span className="text-gray-400 italic">Chưa cập nhật vị trí</span>
                )}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              ← Quay lại
            </Button>
          </div>

      {/* Main Info */}
      <Card title="Thông tin chi tiết">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Diện tích</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{apartment.area} m²</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Giá thuê</label>
              <p className="mt-1 text-2xl font-bold text-indigo-600">
                {formatCurrency(apartment.monthlyRent)}
                <span className="text-sm font-normal text-gray-500">/tháng</span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Trạng thái</label>
              <p className="mt-1">{getStatusBadge(apartment.status)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lượt xem</label>
              <p className="mt-1 text-lg text-gray-900">{apartment.viewCount || 0} lượt</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tòa nhà</label>
              <p className="mt-1 text-lg text-gray-900">
                {apartment.floor?.block?.building?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {apartment.floor?.block?.building?.address || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Khu</label>
              <p className="mt-1 text-lg text-gray-900">
                {apartment.floor?.block?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tầng</label>
              <p className="mt-1 text-lg text-gray-900">
                Tầng {apartment.floor?.number ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        {apartment.tenant && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Người thuê hiện tại</h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                {apartment.tenant.avatar ? (
                  <img
                    src={apartment.tenant.avatar}
                    alt={apartment.tenant.firstName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-lg font-medium text-gray-600">
                      {apartment.tenant.firstName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{apartment.tenant.firstName} {apartment.tenant.lastName}</p>
                  <p className="text-sm text-gray-500">{apartment.tenant.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rent Button */}
        {canRent && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setRentModal(true)}
            >
              Thuê căn hộ này
            </Button>
          </div>
        )}
      </Card>
        </>
      )}

      {/* Rent Confirmation Modal */}
      <Modal
        isOpen={rentModal}
        onClose={() => setRentModal(false)}
        title="Xác nhận thuê căn hộ"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRentModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" loading={rentLoading} onClick={handleRent}>
              Xác nhận thuê
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn thuê căn hộ này?
          </p>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Căn hộ:</span>
                <span className="font-medium">#{apartment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Diện tích:</span>
                <span className="font-medium">{apartment.area} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giá thuê:</span>
                <span className="font-semibold text-indigo-600">
                  {formatCurrency(apartment.monthlyRent)}/tháng
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentDetail;
