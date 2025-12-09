import React from 'react';

/**
 * Footer Component
 */
const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-600">
            © 2024 Quản lý tòa nhà. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
