import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import facilityService from '../../services/facilityService';

/**
 * FacilityManagement Page (Admin)
 * Display all facilities in system with pagination
 */
const FacilityManagement = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, needFix: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchFacilities();
    fetchStats();
  }, [pagination.page]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await facilityService.listFacilities({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setFacilities(response.data.data || []);
      if (response.data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await facilityService.getFacilityStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch facility stats:', err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/facilities/${id}/edit`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      operational: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
      maintenance: { label: 'Bảo trì', class: 'bg-yellow-100 text-yellow-800' },
      broken: { label: 'Hỏng', class: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (loading && facilities.length === 0) {
    return <Loading text="Đang tải danh sách cơ sở vật chất..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Cơ sở vật chất</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý tất cả cơ sở vật chất trong hệ thống
          </p>
        </div>
        <Button variant="primary">
          + Thêm cơ sở vật chất
        </Button>
      </div>

      {error && <ErrorMessage error={error} />}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng số</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Hoạt động</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.total - stats.needFix}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Cần bảo trì</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {stats.needFix}
            </p>
          </div>
        </Card>
      </div>

      {/* Facilities Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tên cơ sở vật chất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {facilities?.map?.((facility) => (
                <tr key={facility?.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    #{facility.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{facility.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">{facility.description || '—'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleEdit(facility.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Cập nhật
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="secondary"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Trước
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Sau
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.pageSize + 1}
                  </span>{' '}
                  đến{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{pagination.total}</span> cơ sở vật chất
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    ←
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination((prev) => ({ ...prev, page }))}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === pagination.page
                          ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FacilityManagement;
