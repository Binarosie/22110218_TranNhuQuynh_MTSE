import api from './api';

// ==================== FACILITY CRUD ====================

// Public: List all facilities
export const listFacilities = (params) => {
  return api.get('/facilities', { params });
};

// Get facility by ID (Admin)
export const getFacilityById = (id) => {
  return api.get(`/facilities/${id}`);
};

// Create facility (Admin)
export const createFacility = (data) => {
  return api.post('/facilities', data);
};

// Update facility (Admin)
export const updateFacility = (id, data) => {
  return api.put(`/facilities/${id}`, data);
};

// Delete facility (Admin)
export const deleteFacility = (id) => {
  return api.delete(`/facilities/${id}`);
};

// Get facility statistics
export const getFacilityStats = () => {
  return api.get('/facilities/stats');
};

export default {
  listFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  getFacilityStats,
};
