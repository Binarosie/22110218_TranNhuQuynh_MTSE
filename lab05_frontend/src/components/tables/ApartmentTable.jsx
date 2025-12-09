import React from 'react';
import { APARTMENT_STATUS_LABELS, APARTMENT_STATUS_COLORS } from '../../utils/constants';
import Button from '../common/Button';

/**
 * ApartmentTable Component
 * @param {object} props - Component props
 * @param {Array} props.apartments - Array of apartment objects
 * @param {function} props.onView - View details handler
 * @param {function} props.onEdit - Edit handler (Admin only)
 * @param {function} props.onDelete - Delete handler (Admin only)
 * @param {function} props.onAssignTenant - Assign tenant handler (Admin only)
 * @param {boolean} props.isAdmin - Whether current user is admin
 */
const ApartmentTable = ({ 
  apartments = [], 
  onView,
  onEdit,
  onDelete,
  onAssignTenant,
  isAdmin = false 
}) => {
  const getStatusBadge = (status) => {
    const label = APARTMENT_STATUS_LABELS[status] || status || 'N/A';
    const colorClass = APARTMENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-500';
    
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colorClass}`}>
        {label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (apartments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">Không có căn hộ nào</p>
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
              Tòa nhà / Khu / Tầng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Diện tích
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Giá thuê
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Lượt xem
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
          {apartments?.map?.((apartment) => (
            <tr key={apartment?.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                #{apartment?.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex flex-col">
                  <span className="font-medium">{apartment.floor?.block?.building?.name || 'N/A'}</span>
                  <span className="text-gray-500">
                    {apartment.floor?.block?.name || 'N/A'} - Tầng {apartment.floor?.floor_number || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {apartment.area} m²
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {formatCurrency(apartment.monthlyRent)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {apartment.viewCount || 0}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {getStatusBadge(apartment.status)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView?.(apartment?.id)}
                  >
                    Xem
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit?.(apartment?.id)}
                      >
                        Sửa
                      </Button>
                      {apartment?.status === 'vacant' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onAssignTenant?.(apartment?.id)}
                        >
                          Gán người thuê
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete?.(apartment?.id)}
                      >
                        Xóa
                      </Button>
                    </>
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

export default ApartmentTable;
