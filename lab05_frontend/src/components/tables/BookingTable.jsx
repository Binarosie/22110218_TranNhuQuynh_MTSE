import React from 'react';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../utils/constants';
import Button from '../common/Button';

/**
 * BookingTable Component
 * @param {object} props - Component props
 * @param {Array} props.bookings - Array of booking objects
 * @param {function} props.onView - View details handler
 * @param {function} props.onAssign - Assign technician handler (Admin)
 * @param {function} props.onMarkFixed - Mark as fixed handler (Technician)
 * @param {function} props.onMarkDone - Mark as done handler (User)
 * @param {string} props.userRole - Current user role
 */
const BookingTable = ({ 
  bookings = [], 
  onView,
  onAssign,
  onMarkFixed,
  onMarkDone,
  userRole = 'User'
}) => {
  const getStatusBadge = (status) => {
    const label = BOOKING_STATUS_LABELS[status] || 'Không xác định';
    const colorClass = BOOKING_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    return (
      <span 
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const canAssign = (booking) => {
    return userRole === 'Admin' && booking.status === 'TODO';
  };

  const canMarkFixed = (booking) => {
    return userRole === 'Technician' && booking.status === 'PENDING';
  };

  const canMarkDone = (booking) => {
    return userRole === 'User' && booking.status === 'FIXED';
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">Không có booking nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Cơ sở vật chất
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Người tạo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Kỹ thuật viên
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Ngày hẹn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {bookings?.map?.((booking) => (
            <tr key={booking?.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                #{booking?.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex flex-col">
                  <span className="font-medium">{booking.facility?.name || 'N/A'}</span>
                  <span className="text-xs text-gray-500">{booking.facility?.description || ''}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex flex-col">
                  <span>{booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'N/A'}</span>
                  <span className="text-xs text-gray-500">{booking.user?.email || ''}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {booking.assignedTechnician ? (
                  <div className="flex flex-col">
                    <span>{booking.assignedTechnician.firstName} {booking.assignedTechnician.lastName}</span>
                    <span className="text-xs text-gray-500">{booking.assignedTechnician.email}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Chưa phân công</span>
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {formatDate(booking.bookingDate)}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {getStatusBadge(booking.status)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView?.(booking?.id)}
                  >
                    Xem
                  </Button>
                  {canAssign(booking) && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onAssign?.(booking?.id)}
                    >
                      Phân công
                    </Button>
                  )}
                  {canMarkFixed(booking) && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onMarkFixed?.(booking?.id)}
                    >
                      Đã sửa xong
                    </Button>
                  )}
                  {canMarkDone(booking) && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onMarkDone?.(booking?.id)}
                    >
                      Xác nhận hoàn thành
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
