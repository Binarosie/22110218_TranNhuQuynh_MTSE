import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import rentalService from '../../services/rentalService';
import { APARTMENT_STATUS_LABELS, APARTMENT_STATUS_COLORS } from '../../utils/constants';

/**
 * MyApartments Page
 * User: View rented apartments and cancel rental
 */
const MyApartments = () => {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, apartmentId: null });

  useEffect(() => {
    fetchMyApartments();
  }, []);

  const fetchMyApartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentalService.getMyApartments();
      setApartments(response.data.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRental = async () => {
    try {
      await rentalService.cancelRental(cancelDialog.apartmentId);
      setCancelDialog({ isOpen: false, apartmentId: null });
      fetchMyApartments();
    } catch (err) {
      setError(err);
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
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colorClass}`}>
        {label}
      </span>
    );
  };

  if (loading) return <Loading text="Đang tải căn hộ của bạn..." />;
  if (error) return <ErrorMessage error={error} onRetry={fetchMyApartments} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Căn hộ của tôi</h1>
          <p className="mt-2 text-gray-600">Quản lý các căn hộ bạn đang thuê</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/browse')}>
          Tìm căn hộ mới
        </Button>
      </div>

      {/* Apartments Grid */}
      {apartments.length === 0 ? (
        <Card>
          <div className="py-8 text-center">
            <p className="text-gray-500">Bạn chưa thuê căn hộ nào</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/browse')}
            >
              Tìm căn hộ ngay
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apartments?.map?.((apartment) => (
            <Card key={apartment?.id} hoverable>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Căn hộ #{apartment.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {apartment.floor?.block?.building?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {apartment.floor?.block?.name} - Tầng {apartment.floor?.number ?? 'N/A'}
                    </p>
                  </div>
                  {getStatusBadge(apartment.status)}
                </div>

                {/* Details */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Diện tích:</span>
                    <span className="font-medium text-gray-900">{apartment.area} m²</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Giá thuê:</span>
                    <span className="font-semibold text-indigo-600">
                      {formatCurrency(apartment.monthlyRent)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-gray-200 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/apartments/${apartment.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate('/bookings/create', { state: { apartmentId: apartment.id } })}
                  >
                    Tạo booking
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCancelDialog({ isOpen: true, apartmentId: apartment.id })}
                  >
                    Hủy thuê
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, apartmentId: null })}
        onConfirm={handleCancelRental}
        title="Hủy thuê căn hộ"
        message="Bạn có chắc chắn muốn hủy thuê căn hộ này?"
        confirmText="Hủy thuê"
        variant="danger"
      />
    </div>
  );
};

export default MyApartments;
