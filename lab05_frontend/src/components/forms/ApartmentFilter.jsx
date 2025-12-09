import React, { useState, useEffect } from 'react';
import useFilter from '../../hooks/useFilter';
import FilterPanel, { FilterItem } from '../common/FilterPanel';
import buildingService from '../../services/buildingService';

/**
 * ApartmentFilter Component
 * For filtering apartments by building, block, floor (Browse page - vacant only)
 */
const ApartmentFilter = ({ onFilterChange, initialFilters = {} }) => {
  const { filters, updateFilter, resetAllFilters, hasActiveFilters } = useFilter(initialFilters);
  const [buildings, setBuildings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (filters.buildingId) {
      fetchBlocks(filters.buildingId);
    } else {
      setBlocks([]);
      setFloors([]);
    }
  }, [filters.buildingId]);

  useEffect(() => {
    if (filters.blockId) {
      fetchFloors(filters.blockId);
    } else {
      setFloors([]);
    }
  }, [filters.blockId]);

  const fetchBuildings = async () => {
    try {
      const response = await buildingService.getAllBuildings();
      setBuildings(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      setBuildings([]);
    }
  };

  const fetchBlocks = async (buildingId) => {
    try {
      const response = await buildingService.getBlocksByBuilding(buildingId);
      setBlocks(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching blocks:', err);
      setBlocks([]);
    }
  };

  const fetchFloors = async (blockId) => {
    try {
      const response = await buildingService.getFloorsByBlock(blockId);
      setFloors(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching floors:', err);
      setFloors([]);
    }
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    resetAllFilters();
    setBlocks([]);
    setFloors([]);
    onFilterChange({});
  };

  return (
    <FilterPanel
      onApply={handleApply}
      onReset={handleReset}
      hasActiveFilters={hasActiveFilters()}
    >
      <FilterItem label="Tòa nhà">
        <select
          value={filters.buildingId || ''}
          onChange={(e) => {
            updateFilter('buildingId', e.target.value);
            updateFilter('blockId', '');
            updateFilter('floorId', '');
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tất cả</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </FilterItem>

      <FilterItem label="Khu">
        <select
          value={filters.blockId || ''}
          onChange={(e) => {
            updateFilter('blockId', e.target.value);
            updateFilter('floorId', '');
          }}
          disabled={!filters.buildingId}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Tất cả</option>
          {blocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.name}
            </option>
          ))}
        </select>
      </FilterItem>

      <FilterItem label="Tầng">
        <select
          value={filters.floorId || ''}
          onChange={(e) => updateFilter('floorId', e.target.value)}
          disabled={!filters.blockId}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Tất cả</option>
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              Tầng {floor.number}
            </option>
          ))}
        </select>
      </FilterItem>

      <FilterItem label="Trạng thái">
        <select
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Tất cả</option>
          <option value="vacant">Còn trống</option>
          <option value="occupied">Đã cho thuê</option>
          <option value="maintenance">Đang bảo trì</option>
        </select>
      </FilterItem>

      <FilterItem label="Sắp xếp theo">
        <select
          value={filters.sortBy || ''}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Mặc định</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="newest">Mới nhất</option>
          <option value="view_desc">Lượt xem nhiều nhất</option>
        </select>
      </FilterItem>
    </FilterPanel>
  );
};

export default ApartmentFilter;
