import React from 'react';

/**
 * Loading Spinner Component
 * @param {object} props - Component props
 * @param {string} props.size - Size of spinner (sm, md, lg)
 * @param {string} props.color - Color of spinner
 * @param {string} props.text - Loading text
 */
const Loading = ({ size = 'md', color = 'indigo', text = 'Đang tải...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colorClasses = {
    indigo: 'border-indigo-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-4 border-solid border-t-transparent`}
      ></div>
      {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export default Loading;
