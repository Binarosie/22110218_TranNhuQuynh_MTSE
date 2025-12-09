import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingTable from '../../components/tables/BookingTable';
import SearchBar from '../../components/common/SearchBar';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import bookingService from '../../services/bookingService';
import { usePagination } from '../../hooks/usePagination';
import { useAuth } from '../../contexts/AuthContext';

/**
 * MyBookings Page
 * User: View my created bookings
 * Technician: View assigned bookings
 */
const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { page, pageSize, totalItems, totalPages, updatePagination, goToPage, changePageSize } = usePagination();

  const userRole = user?.role?.name;

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.listBookings({
        page,
        limit: pageSize,
        search,
        status: statusFilter,
      });
      setBookings(response.data.data || []);
      
      const pagination = response.data.pagination;
      if (pagination) {
        updatePagination({
          totalItems: pagination.totalItems,
          totalPages: pagination.totalPages,
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, updatePagination]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ✅ Reset page về 1 khi search hoặc statusFilter thực sự thay đổi
  useEffect(() => {
    if (page !== 1) {
      goToPage(1);
    }
  }, [search, statusFilter]);

  // 🔧 Debug helper - expose to window for console testing
  useEffect(() => {
    window.__pagination__ = {
      get state() {
        return { currentPage: page, totalPages, total: totalItems, pageSize };
      },
      goToPage: (targetPage) => {
        console.log('[DEBUG] goToPage:', targetPage);
        goToPage(targetPage);
      },
      nextPage: () => {
        console.log('[DEBUG] nextPage');
        goToPage(page + 1);
      },
      prevPage: () => {
        console.log('[DEBUG] prevPage');
        goToPage(page - 1);
      },
    };

    console.log('[DEBUG] pagination exposed to window', { currentPage: page, totalPages });

    return () => {
      delete window.__pagination__;
    };
  }, [page, pageSize, totalItems, totalPages, goToPage]);

  const handleView = (id) => {
    navigate(`/bookings/${id}`);
  };

  const handleAssign = (id) => {
    navigate(`/bookings/${id}`);
  };

  const handleMarkFixed = async (id) => {
    try {
      await bookingService.markAsFixed(id);
      fetchBookings();
    } catch (err) {
      setError(err);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      await bookingService.markAsDone(id);
      fetchBookings();
    } catch (err) {
      setError(err);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    // ✅ KHÔNG gọi goToPage(1) ở đây - để useEffect xử lý
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === 'Technician' ? 'Booking được phân công' : 'Booking của tôi'}
          </h1>
          <p className="mt-2 text-gray-600">
            {userRole === 'Technician' 
              ? 'Các booking đã được phân công cho bạn' 
              : 'Các booking bảo trì bạn đã tạo'}
          </p>
        </div>
        {userRole === 'User' && (
          <Button variant="primary" onClick={() => navigate('/bookings/create')}>
            + Tạo booking mới
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm booking..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            // ✅ KHÔNG gọi goToPage(1) ở đây - để useEffect xử lý
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="TODO">Chờ xử lý</option>
          <option value="PENDING">Đang sửa</option>
          <option value="FIXED">Đã sửa xong</option>
          <option value="DONE">Hoàn thành</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Đang tải danh sách booking..." />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchBookings} />
      ) : (
        <>
          <BookingTable
            bookings={bookings}
            onView={handleView}
            onAssign={handleAssign}
            onMarkFixed={handleMarkFixed}
            onMarkDone={handleMarkDone}
            userRole={userRole}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={totalItems}
            pageSize={pageSize}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        </>
      )}
    </div>
  );
};

export default MyBookings;
