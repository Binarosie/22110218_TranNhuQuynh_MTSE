import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import BookingTable from '../../components/tables/BookingTable';
import bookingService from '../../services/bookingService';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';

/**
 * BookingManagement Page (Admin)
 * Display all bookings in system with status filter
 */
const BookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Calculate stats from bookings using useMemo (no separate state needed)
  const bookingStats = useMemo(() => {
    const stats = {
      ALL: bookings.length,
      TODO: 0,
      PENDING: 0,
      FIXED: 0,
      DONE: 0,
    };

    bookings.forEach((booking) => {
      if (stats[booking.status] !== undefined) {
        stats[booking.status]++;
      }
    });

    return stats;
  }, [bookings]);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      const response = await bookingService.listBookings(params);
      const bookingData = response.data.data || [];
      setBookings(bookingData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    navigate(`/bookings/${id}`);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? '' : status);
  };

  const statuses = ['TODO', 'PENDING', 'FIXED', 'DONE'];

  if (loading && bookings.length === 0) {
    return <Loading text="Đang tải danh sách booking..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Booking</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý tất cả booking bảo trì cơ sở vật chất trong hệ thống
          </p>
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card
          className={`cursor-pointer transition-all ${
            selectedStatus === '' ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'
          }`}
          onClick={() => handleStatusFilter('')}
        >
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tất cả</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{bookingStats.ALL}</p>
          </div>
        </Card>

        {statuses.map((status) => (
          <Card
            key={status}
            className={`cursor-pointer transition-all ${
              selectedStatus === status ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'
            }`}
            onClick={() => handleStatusFilter(status)}
          >
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                {BOOKING_STATUS_LABELS[status]}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{bookingStats[status] || 0}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Bookings Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách Booking {selectedStatus && `- ${BOOKING_STATUS_LABELS[selectedStatus]}`}
          </h2>
          {loading && <div className="text-sm text-gray-500">Đang tải...</div>}
        </div>

        {bookings.length > 0 ? (
          <BookingTable bookings={bookings} onView={handleView} showActions />
        ) : (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có booking</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus
                ? `Không có booking với trạng thái "${BOOKING_STATUS_LABELS[selectedStatus]}"`
                : 'Chưa có booking nào trong hệ thống'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingManagement;
