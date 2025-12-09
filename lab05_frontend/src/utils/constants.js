// Booking Status
export const BOOKING_STATUS = {
  TODO: 'TODO',
  PENDING: 'PENDING',
  FIXED: 'FIXED',
  DONE: 'DONE',
};

export const BOOKING_STATUS_LABELS = {
  TODO: 'Chờ xử lý',
  PENDING: 'Đang sửa',
  FIXED: 'Đã sửa xong',
  DONE: 'Hoàn thành',
};

export const BOOKING_STATUS_COLORS = {
  TODO: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-blue-100 text-blue-800',
  FIXED: 'bg-green-100 text-green-800',
  DONE: 'bg-gray-100 text-gray-800',
};

// User Roles
export const ROLES = {
  ADMIN: 'Admin',
  TECHNICIAN: 'Technician',
  USER: 'User',
};

// Apartment Status
export const APARTMENT_STATUS = {
  VACANT: 'vacant',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
};

export const APARTMENT_STATUS_LABELS = {
  vacant: 'Trống',
  occupied: 'Đã thuê',
  maintenance: 'Bảo trì',
};

export const APARTMENT_STATUS_COLORS = {
  vacant: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-orange-100 text-orange-800',
};

// Sort Options
export const SORT_OPTIONS = [
  { value: 'viewCount', label: 'Lượt xem' },
  { value: 'monthlyRent', label: 'Giá thuê' },
  { value: 'area', label: 'Diện tích' },
  { value: 'number', label: 'Số căn' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  APARTMENTS: {
    LIST: '/apartments',
    VACANT: '/apartments/vacant',
    TOP_VIEWED: '/apartments/top-viewed',
    TOP_VIEWED_VACANT: '/apartments/top-viewed-vacant',
    STATS: '/apartments/stats',
  },
  RENTAL: {
    RENT: '/rental/rent',
    MY_APARTMENTS: '/rental/my-apartment',
    CANCEL: '/rental/cancel',
    VACANT: '/rental/vacant',
    VIEW: (id) => `/rental/${id}/view`,
  },
  FACILITIES: {
    LIST: '/facilities',
    BOOKINGS: '/facilities/bookings',
    BOOKINGS_STATS: '/facilities/bookings/stats',
  },
  BOOKINGS: {
    CREATE: '/facilities/bookings',
    ASSIGN: (id) => `/facilities/bookings/${id}/assign`,
    FIXED: (id) => `/facilities/bookings/${id}/fixed`,
    DONE: (id) => `/facilities/bookings/${id}/done`,
  },
  BUILDINGS: '/buildings',
  BLOCKS: '/blocks',
  FLOORS: '/floors',
  USERS: '/users',
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  EMAIL: 'Email không hợp lệ',
  PASSWORD_MIN: 'Mật khẩu phải có ít nhất 6 ký tự',
  PHONE: 'Số điện thoại không hợp lệ',
  NUMBER: 'Phải là số',
  POSITIVE: 'Phải là số dương',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};
