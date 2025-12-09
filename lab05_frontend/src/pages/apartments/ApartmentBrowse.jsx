import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import ApartmentFilter from '../../components/forms/ApartmentFilter';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import rentalService from '../../services/rentalService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { APARTMENT_STATUS_LABELS, APARTMENT_STATUS_COLORS } from '../../utils/constants';

/**
 * ApartmentBrowse Page
 * Public: Browse vacant apartments with infinite scroll
 */
const ApartmentBrowse = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  const loadMoreRef = useRef(null);

  const fetchApartments = async (page) => {
    // Clean filters: remove empty strings, null, and undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    );

    const params = {
      page,
      pageSize: 12,
      ...(search && { search }),
      ...(cleanFilters.status && { status: cleanFilters.status }),
      ...(cleanFilters.buildingId && { buildingId: cleanFilters.buildingId }),
      ...(cleanFilters.blockId && { blockId: cleanFilters.blockId }),
      ...(cleanFilters.floorId && { floorId: cleanFilters.floorId }),
      ...(cleanFilters.minArea && { minArea: cleanFilters.minArea }),
      ...(cleanFilters.maxArea && { maxArea: cleanFilters.maxArea }),
      ...(cleanFilters.minRent && { minRent: cleanFilters.minRent }),
      ...(cleanFilters.maxRent && { maxRent: cleanFilters.maxRent }),
      ...(cleanFilters.sortBy && { sortBy: cleanFilters.sortBy }),
    };

    const response = await rentalService.listVacantApartments(params);
    
    // Backend response structure: { success, data: [...], pagination: {...} }
    return response;
  };

  const { data: apartments, loading, hasMore, loadMore, reset } = useInfiniteScroll(
    fetchApartments,
    loadMoreRef
  );

  // Fetch initial data when component mounts
  useEffect(() => {
    reset();
  }, []);

  // Reset and fetch when search or filters change
  useEffect(() => {
    reset();
  }, [search, filters]);

  const handleView = async (id) => {
    try {
      await rentalService.incrementViewCount(id);
      navigate(`/apartments/${id}`);
    } catch (err) {
      console.error('Error incrementing view count:', err);
      navigate(`/apartments/${id}`);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tìm căn hộ</h1>
        <p className="mt-2 text-gray-600">Khám phá các căn hộ còn trống</p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Tìm kiếm căn hộ theo tòa nhà, khu, tầng..."
        />
        <ApartmentFilter onFilterChange={handleFilterChange} initialFilters={filters} />
      </div>

      {/* Error */}
      {error && <ErrorMessage error={error} onRetry={reset} />}

      {/* Apartment Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apartments?.map?.((apartment) => (
          <Card key={apartment?.id} hoverable className="cursor-pointer" onClick={() => handleView(apartment?.id)}>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Căn hộ #{apartment.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {apartment.floor?.block?.building?.name} - {apartment.floor?.block?.name} - Tầng {apartment.floor?.floor_number}
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lượt xem:</span>
                  <span className="text-gray-900">{apartment.viewCount || 0}</span>
                </div>
              </div>

              {/* Action */}
              <Button
                variant="primary"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(apartment.id);
                }}
              >
                Xem chi tiết
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading */}
      {loading && <Loading text="Đang tải căn hộ..." />}

      {/* Load More Trigger */}
      {!loading && hasMore && <div ref={loadMoreRef} className="h-10"></div>}

      {/* No More Results */}
      {!loading && !hasMore && apartments.length > 0 && (
        <p className="text-center text-gray-500">Đã hiển thị tất cả căn hộ</p>
      )}

      {/* No Results */}
      {!loading && apartments.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">Không tìm thấy căn hộ nào phù hợp</p>
        </div>
      )}
    </div>
  );
};

export default ApartmentBrowse;
