import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sidebar Component
 * Role-based navigation menu
 */
const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = {
    Admin: [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/apartments', icon: '🏢', label: 'Quản lý căn hộ' },
      { path: '/bookings', icon: '📝', label: 'Quản lý booking' },
      { path: '/facilities', icon: '🔧', label: 'Cơ sở vật chất' },
      { path: '/buildings', icon: '🏗️', label: 'Tòa nhà' },
      { path: '/users', icon: '👥', label: 'Người dùng' },
    ],
    Technician: [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/my-bookings', icon: '📝', label: 'Booking của tôi' },
      { path: '/facilities', icon: '🔧', label: 'Cơ sở vật chất' },
    ],
    User: [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/browse', icon: '🔍', label: 'Tìm căn hộ' },
      { path: '/my-apartments', icon: '🏠', label: 'Căn hộ của tôi' },
      { path: '/my-bookings', icon: '📝', label: 'Booking của tôi' },
    ],
  };

  const items = menuItems[user?.role?.name] || menuItems.User;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white">
      <nav className="h-full overflow-y-auto p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
