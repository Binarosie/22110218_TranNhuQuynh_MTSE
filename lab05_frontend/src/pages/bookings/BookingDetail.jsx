import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Modal from '../../components/common/Modal';
import BookingWorkflow from '../../components/common/BookingWorkflow';
import AssignTechnicianForm from '../../components/forms/AssignTechnicianForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import bookingService from '../../services/bookingService';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../utils/constants';

/**
 * BookingDetail Page
 * View booking details with role-based actions
 */
const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null });

  const userRole = user?.role?.name;

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Fetch technicians when assign modal opens
  useEffect(() => {
    if (assignModal) {
      fetchTechnicians();
    }
  }, [assignModal]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getBookingById(id);
      setBooking(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      const response = await userService.getTechnicians();
      setTechnicians(response.data.data || response.data || []);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
      setTechnicians([]);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleAssignTechnician = async (technicianId) => {
    try {
      await bookingService.assignTechnician(id, technicianId);
      setAssignModal(false);
      fetchBooking();
    } catch (err) {
      setError(err);
    }
  };

  const handleMarkFixed = async () => {
    try {
      await bookingService.markAsFixed(id);
      setConfirmDialog({ isOpen: false, action: null });
      fetchBooking();
    } catch (err) {
      setError(err);
    }
  };

  const handleMarkDone = async () => {
    try {
      await bookingService.markAsDone(id);
      setConfirmDialog({ isOpen: false, action: null });
      fetchBooking();
    } catch (err) {
      setError(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const label = BOOKING_STATUS_LABELS[status] || 'Không xác định';
    const colorClass = BOOKING_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${colorClass}`}>
        {label}
      </span>
    );
  };

  const canAssign = userRole === 'Admin' && booking?.status === 'TODO';
  const canMarkFixed = userRole === 'Technician' && booking?.status === 'PENDING';
  const canMarkDone = userRole === 'User' && booking?.status === 'FIXED';

  if (loading) return <Loading text="Đang tải thông tin booking..." />;
  if (error) return <ErrorMessage error={error} onRetry={fetchBooking} />;
  if (!booking) return <ErrorMessage error="Không tìm thấy booking" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.id}</h1>
          <p className="mt-1 text-gray-600">{booking.facility?.name}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </div>

      {/* Workflow */}
      <Card title="Quy trình xử lý">
        <BookingWorkflow currentStatus={booking.status} />
      </Card>

      {/* Details */}
      <Card title="Thông tin chi tiết">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Trạng thái</label>
              <div className="mt-1">{getStatusBadge(booking.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Cơ sở vật chất</label>
              <p className="mt-1 text-base text-gray-900">{booking.facility?.name}</p>
              <p className="text-sm text-gray-500">{booking.facility?.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mô tả sự cố</label>
              <p className="mt-1 text-base text-gray-900">{booking.notes || 'Không có'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Ngày hẹn</label>
              <p className="mt-1 text-base text-gray-900">
                {formatDate(booking.bookingDate)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Người tạo</label>
              <div className="mt-1 flex items-center gap-3">
                {booking.user?.avatar ? (
                  <img
                    src={booking.user.avatar}
                    alt={booking.user.firstName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      {booking.user?.firstName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-base font-medium text-gray-900">{booking.user?.firstName} {booking.user?.lastName}</p>
                  <p className="text-sm text-gray-500">{booking.user?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Kỹ thuật viên</label>
              {booking.assignedTechnician ? (
                <div className="mt-1 flex items-center gap-3">
                  {booking.assignedTechnician.avatar ? (
                    <img
                      src={booking.assignedTechnician.avatar}
                      alt={booking.assignedTechnician.firstName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        {booking.assignedTechnician.firstName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-base font-medium text-gray-900">{booking.assignedTechnician.firstName} {booking.assignedTechnician.lastName}</p>
                    <p className="text-sm text-gray-500">{booking.assignedTechnician.email}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-1 italic text-gray-500">Chưa phân công</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
              <p className="mt-1 text-base text-gray-900">{formatDate(booking.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
              <p className="mt-1 text-base text-gray-900">{formatDate(booking.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6">
          {canAssign && (
            <Button
              variant="primary"
              onClick={() => setAssignModal(true)}
            >
              Phân công kỹ thuật viên
            </Button>
          )}
          {canMarkFixed && (
            <Button
              variant="success"
              onClick={() => setConfirmDialog({ isOpen: true, action: 'fixed' })}
            >
              Đánh dấu đã sửa xong
            </Button>
          )}
          {canMarkDone && (
            <Button
              variant="success"
              onClick={() => setConfirmDialog({ isOpen: true, action: 'done' })}
            >
              Xác nhận hoàn thành
            </Button>
          )}
        </div>
      </Card>

      {/* Assign Technician Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Phân công kỹ thuật viên"
      >
        {loadingTechnicians ? (
          <div className="py-8 text-center">
            <Loading text="Đang tải danh sách kỹ thuật viên..." />
          </div>
        ) : (
          <AssignTechnicianForm
            technicians={technicians}
            onSubmit={handleAssignTechnician}
            onCancel={() => setAssignModal(false)}
          />
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null })}
        onConfirm={confirmDialog.action === 'fixed' ? handleMarkFixed : handleMarkDone}
        title={confirmDialog.action === 'fixed' ? 'Xác nhận đã sửa xong' : 'Xác nhận hoàn thành'}
        message={
          confirmDialog.action === 'fixed'
            ? 'Xác nhận rằng bạn đã sửa chữa xong cơ sở vật chất này?'
            : 'Xác nhận rằng công việc đã được hoàn thành và bạn hài lòng với kết quả?'
        }
        confirmText="Xác nhận"
        variant="success"
      />
    </div>
  );
};

export default BookingDetail;
