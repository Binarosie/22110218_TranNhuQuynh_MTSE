import api from './api';

// ==================== BUILDING MANAGEMENT ====================

// Get building overview stats
export const getBuildingOverview = () => {
  return api.get('/buildings/stats/overview');
};

// Public: List all buildings
export const listBuildings = (params) => {
  return api.get('/buildings', { params });
};

// Get building by ID
export const getBuildingById = (id) => {
  return api.get(`/buildings/${id}`);
};

// Create building (Admin)
export const createBuilding = (data) => {
  return api.post('/buildings', data);
};

// Update building (Admin)
export const updateBuilding = (id, data) => {
  return api.put(`/buildings/${id}`, data);
};

// Delete building (Admin)
export const deleteBuilding = (id) => {
  return api.delete(`/buildings/${id}`);
};

// ==================== BLOCK MANAGEMENT ====================

// Public: List all blocks
export const listBlocks = (params) => {
  return api.get('/blocks', { params });
};

// Get block by ID
export const getBlockById = (id) => {
  return api.get(`/blocks/${id}`);
};

// Create block (Admin)
export const createBlock = (data) => {
  return api.post('/blocks', data);
};

// Update block (Admin)
export const updateBlock = (id, data) => {
  return api.put(`/blocks/${id}`, data);
};

// Delete block (Admin)
export const deleteBlock = (id) => {
  return api.delete(`/blocks/${id}`);
};

// ==================== FLOOR MANAGEMENT ====================

// Public: List all floors
export const listFloors = (params) => {
  return api.get('/floors', { params });
};

// Public: Get floors with vacant apartments
export const getFloorsWithVacantApartments = (params) => {
  return api.get('/floors/vacant', { params });
};

// Get floor by ID
export const getFloorById = (id) => {
  return api.get(`/floors/${id}`);
};

// Create floor (Admin)
export const createFloor = (data) => {
  return api.post('/floors', data);
};

// Update floor (Admin)
export const updateFloor = (id, data) => {
  return api.put(`/floors/${id}`, data);
};

// Delete floor (Admin)
export const deleteFloor = (id) => {
  return api.delete(`/floors/${id}`);
};

export default {
  // Overview
  getBuildingOverview,
  // Buildings
  getAllBuildings: listBuildings, // Alias for convenience
  listBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  // Blocks
  getBlocksByBuilding: (buildingId) => api.get('/blocks', { params: { buildingId } }),
  listBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
  // Floors
  getFloorsByBlock: (blockId) => api.get('/floors', { params: { blockId } }),
  listFloors,
  getFloorsWithVacantApartments,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
};
