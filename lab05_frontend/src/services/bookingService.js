import api from './api';

// ==================== BOOKING WORKFLOW ====================

// Get booking statistics
export const getBookingStats = () => {
  return api.get('/facilities/bookings/stats');
};

// List bookings (role-based)
export const listBookings = (params) => {
  return api.get('/facilities/bookings', { params });
};

// Get booking by ID
export const getBookingById = (id) => {
  return api.get(`/facilities/bookings/${id}`);
};

// Step 1: USER creates booking (TODO)
export const createBooking = (data) => {
  return api.post('/facilities/bookings', data);
};

// Step 2: ADMIN assigns technician (TODO → PENDING)
export const assignTechnician = (id, technicianId) => {
  return api.post(`/facilities/bookings/${id}/assign`, { technicianId });
};

// Step 3: TECHNICIAN marks as fixed (PENDING → FIXED)
export const markAsFixed = (id, technicianNotes) => {
  return api.post(`/facilities/bookings/${id}/fixed`, { technicianNotes });
};

// Step 4: USER confirms done (FIXED → DONE)
export const markAsDone = (id) => {
  return api.post(`/facilities/bookings/${id}/done`);
};

export default {
  getBookingStats,
  listBookings,
  getBookingById,
  createBooking,
  assignTechnician,
  markAsFixed,
  markAsDone,
};
