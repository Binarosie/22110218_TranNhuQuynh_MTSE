import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

/**
 * RoleBasedRoute Component
 * Requires user to have specific role(s)
 * @param {Array|string} allowedRoles - Role name(s) allowed to access
 */
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = user?.role?.name;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">403</h1>
          <p className="mt-4 text-xl text-gray-600">Bạn không có quyền truy cập trang này</p>
          <p className="mt-2 text-gray-500">Vui lòng liên hệ quản trị viên nếu bạn cần trợ giúp</p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;
