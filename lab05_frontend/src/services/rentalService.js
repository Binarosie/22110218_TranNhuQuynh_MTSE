import api from './api';
import { listApartments } from './apartmentService';

// ==================== RENTAL (USER) ====================

// User rent apartment
export const rentApartment = (apartmentId) => {
  return api.post('/rental/rent', { apartmentId });
};

// Get my rented apartments
export const getMyApartments = () => {
  return api.get('/rental/my-apartment');
};

// Cancel rental (return apartment)
export const cancelRental = (apartmentId) => {
  return api.post('/rental/cancel', { apartmentId });
};

// List apartments with filters (public/auth) - supports all statuses
export const listVacantApartments = (params) => {
  return listApartments(params);
};

// Increment view count
export const incrementViewCount = (id) => {
  return api.post(`/rental/${id}/view`);
};

export default {
  rentApartment,
  getMyApartments,
  cancelRental,
  listVacantApartments,
  incrementViewCount,
};
