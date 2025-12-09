import api from './api';

// ==================== USER MANAGEMENT ====================

// Get all users (Admin/Manager)
export const getAllUsers = (params) => {
  return api.get('/users', { params });
};

// Get user by ID
export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};

// Create user (Admin)
export const createUser = (data) => {
  return api.post('/users', data);
};

// Update user (Admin)
export const updateUser = (id, data) => {
  return api.put(`/users/${id}`, data);
};

// Delete user (Admin)
export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

// Toggle user status (Admin)
export const toggleUserStatus = (id) => {
  return api.patch(`/users/${id}/toggle-status`);
};

// ==================== DROPDOWN DATA ====================

// Get all roles
export const getRoles = () => {
  return api.get('/users/roles');
};

// Get all positions
export const getPositions = () => {
  return api.get('/users/positions');
};

// Get list of technicians (for assignment dropdown)
export const getTechnicians = () => {
  return api.get('/users/technicians');
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getRoles,
  getPositions,
  getTechnicians,
};
