import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApartmentTable from '../../components/tables/ApartmentTable';
import SearchBar from '../../components/common/SearchBar';
import ApartmentFilter from '../../components/forms/ApartmentFilter';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import apartmentService from '../../services/apartmentService';
import { usePagination } from '../../hooks/usePagination';

/**
 * ApartmentManagement Page
 * Admin: Full CRUD for apartments
 */
const ApartmentManagement = () => {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, apartmentId: null });

  const { page, pageSize, totalItems, totalPages, updatePagination, goToPage, changePageSize } = usePagination();

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

  // 🔍 Debug: Log khi page thay đổi
  useEffect(() => {
    console.log('[PAGE CHANGED]', page);
  }, [page]);

  // Memoize filters để tránh re-render không cần thiết
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apartmentService.getAllApartments({
        page,
        limit: pageSize,
        search,
        ...filters,
      });
      setApartments(response.data.data || []);
      
      // ✅ Map pagination data rõ ràng từ backend response
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
  }, [page, pageSize, search, filtersKey, updatePagination]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  // ✅ Reset page về 1 khi search hoặc filters thực sự thay đổi
  useEffect(() => {
    if (page !== 1) {
      goToPage(1);
    }
  }, [search, filtersKey]);

  const handleView = (id) => {
    navigate(`/apartments/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/apartments/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await apartmentService.deleteApartment(deleteDialog.apartmentId);
      setDeleteDialog({ isOpen: false, apartmentId: null });
      fetchApartments();
    } catch (err) {
      setError(err);
    }
  };

  const handleAssignTenant = (id) => {
    // TODO: Create AssignTenant component
    alert('Chức năng phân công người thuê đang phát triển');
    // navigate(`/apartments/${id}/assign-tenant`);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    // ✅ KHÔNG gọi goToPage(1) ở đây - để useEffect xử lý
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // ✅ KHÔNG gọi goToPage(1) ở đây - để useEffect xử lý
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý căn hộ</h1>
        <Button variant="primary" onClick={() => navigate('/apartments/create')}>
          + Thêm căn hộ mới
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Tìm kiếm căn hộ..."
        />
        <ApartmentFilter onFilterChange={handleFilterChange} initialFilters={filters} />
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Đang tải danh sách căn hộ..." />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchApartments} />
      ) : (
        <>
          <ApartmentTable
            apartments={apartments}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteDialog({ isOpen: true, apartmentId: id })}
            onAssignTenant={handleAssignTenant}
            isAdmin={true}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, apartmentId: null })}
        onConfirm={handleDelete}
        title="Xóa căn hộ"
        message="Bạn có chắc chắn muốn xóa căn hộ này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  );
};

export default ApartmentManagement;
