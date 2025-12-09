import React from 'react';
import { ROLES } from '../../utils/constants';
import Button from '../common/Button';

/**
 * UserTable Component
 * @param {object} props - Component props
 * @param {Array} props.users - Array of user objects
 * @param {function} props.onView - View details handler
 * @param {function} props.onEdit - Edit handler
 * @param {function} props.onDelete - Delete handler
 * @param {function} props.onChangeRole - Change role handler
 */
const UserTable = ({ 
  users = [], 
  onView,
  onEdit,
  onDelete,
  onChangeRole
}) => {
  const getRoleBadge = (roleId) => {
    let config;
    switch(roleId) {
      case 1:
        config = { label: 'Admin', color: 'bg-red-100 text-red-800' };
        break;
      case 2:
        config = { label: 'Technician', color: 'bg-blue-100 text-blue-800' };
        break;
      case 3:
        config = { label: 'User', color: 'bg-green-100 text-green-800' };
        break;
      default:
        config = { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.color}`}>
        {config.label}
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

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">Không có người dùng nào</p>
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
              Tên đăng nhập
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Số điện thoại
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Vai trò
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users?.map?.((user) => (
            <tr key={user?.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                #{user.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    {user.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.avatar}
                        alt={user.username}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-sm font-medium text-gray-600">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">{user.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {user.email}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {user.phone || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {getRoleBadge(user.role_id)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView?.(user?.id)}
                  >
                    Xem
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit?.(user?.id)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onChangeRole?.(user?.id)}
                  >
                    Đổi vai trò
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete?.(user?.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
