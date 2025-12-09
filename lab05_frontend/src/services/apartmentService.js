import api from './api';

// ==================== APARTMENT MANAGEMENT ====================

// Public/Auth: Get apartments with full filtering support (status, search, sort)
export const listApartments = (params) => {
  return api.get('/apartments', { params });
};

// Public: Get vacant apartments with filters and pagination (semantic: only vacant)
export const getVacantApartments = (params) => {
  return api.get('/apartments/vacant', { params });
};

// Public: Get top viewed apartments
export const getTopViewedApartments = (limit = 10) => {
  return api.get('/apartments/top-viewed', { params: { limit } });
};

// Public: Get top viewed vacant apartments
export const getTopViewedVacantApartments = (limit = 10) => {
  return api.get('/apartments/top-viewed-vacant', { params: { limit } });
};

// Get apartment statistics
export const getApartmentStats = () => {
  return api.get('/apartments/stats');
};

// Get all apartments (Admin/Technician)
export const getAllApartments = (params) => {
  return api.get('/apartments', { params });
};

// Get apartment by ID
export const getApartmentById = (id) => {
  return api.get(`/apartments/${id}`);
};

// Create apartment (Admin/Manager)
export const createApartment = (data) => {
  return api.post('/apartments', data);
};

// Update apartment (Admin/Manager)
export const updateApartment = (id, data) => {
  return api.put(`/apartments/${id}`, data);
};

// Delete apartment (Admin)
export const deleteApartment = (id) => {
  return api.delete(`/apartments/${id}`);
};

// Assign tenant to apartment (Admin/Manager)
export const assignTenant = (id, data) => {
  return api.post(`/apartments/${id}/assign-tenant`, data);
};

// Remove tenant from apartment (Admin/Manager)
export const removeTenant = (id) => {
  return api.post(`/apartments/${id}/remove-tenant`);
};

export default {
  listApartments,
  getVacantApartments,
  getTopViewedApartments,
  getTopViewedVacantApartments,
  getApartmentStats,
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  assignTenant,
  removeTenant,
};
