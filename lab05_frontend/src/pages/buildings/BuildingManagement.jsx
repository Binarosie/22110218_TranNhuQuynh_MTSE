import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import buildingService from '../../services/buildingService';

/**
 * BuildingManagement Page (Admin/Manager)
 * Display all buildings with their blocks and floors
 */
const BuildingManagement = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBuildings, setExpandedBuildings] = useState(new Set());
  const [buildingDetails, setBuildingDetails] = useState({});
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      
      await fetchOverview();
      await fetchBuildings();
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  const fetchOverview = async () => {
    try {
      const response = await buildingService.getBuildingOverview();
      setOverview(response.data.data);
    } catch (err) {
      console.error('Error fetching overview:', err);
    }
  };

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await buildingService.listBuildings();
      setBuildings(response.data.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBuilding = async (buildingId) => {
    const newExpanded = new Set(expandedBuildings);
    if (newExpanded.has(buildingId)) {
      newExpanded.delete(buildingId);
    } else {
      newExpanded.add(buildingId);
      // Fetch building detail with all nested data if not already loaded
      if (!buildingDetails[buildingId]) {
        await fetchBuildingDetail(buildingId);
      }
    }
    setExpandedBuildings(newExpanded);
  };

  const fetchBuildingDetail = async (buildingId) => {
    try {
      const response = await buildingService.getBuildingById(buildingId);
      const buildingData = response.data.data;
      console.log('Building detail loaded:', buildingData);
      console.log('Blocks:', buildingData.blocks);
      if (buildingData.blocks?.length > 0) {
        buildingData.blocks.forEach(block => {
          console.log(`Block ${block.name}:`, {
            id: block.id,
            floorsCount: block.floors?.length || 0,
            floors: block.floors
          });
        });
      }
      setBuildingDetails((prev) => ({
        ...prev,
        [buildingId]: buildingData,
      }));
    } catch (err) {
      console.error('Error fetching building detail:', err);
    }
  };

  const toggleBlock = (blockId) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  if (loading && buildings.length === 0) {
    return <Loading text="Đang tải danh sách tòa nhà..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tòa nhà</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý tất cả tòa nhà, khu block và tầng trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          {/* Only show if user is Admin or Manager AND blocks exist */}
          {(user?.role?.name === 'Admin' || user?.role?.name === 'Manager') && overview?.canCreateFloor && (
            <Button 
              variant="secondary"
              disabled={!overview?.canCreateFloor}
              title={!overview?.canCreateFloor ? 'Cần tạo block trước' : ''}
            >
              + Thêm tầng
            </Button>
          )}
          
          {/* Only show if user is Admin AND buildings exist */}
          {user?.role?.name === 'Admin' && overview?.canCreateBlock && (
            <Button 
              variant="secondary"
              disabled={!overview?.canCreateBlock}
              title={!overview?.canCreateBlock ? 'Cần tạo tòa nhà trước' : ''}
            >
              + Thêm block
            </Button>
          )}
          
          {/* Only show if user is Admin */}
          {user?.role?.name === 'Admin' && (
            <Button variant="primary">+ Thêm tòa nhà</Button>
          )}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng số tòa nhà</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{buildings.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng số Block</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {Object.values(buildingDetails).reduce(
                (sum, building) => sum + (building.blocks?.length || 0),
                0
              )}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng số tầng</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {Object.values(buildingDetails).reduce(
                (sum, building) =>
                  sum +
                  (building.blocks?.reduce((floorSum, block) => floorSum + (block.floors?.length || 0), 0) || 0),
                0
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Buildings List */}
      <div className="space-y-4">
        {buildings.map((building) => (
          <Card key={building.id} className="overflow-hidden">
            {/* Building Header */}
            <div
              className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
              onClick={() => toggleBuilding(building.id)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`transform transition-transform ${
                    expandedBuildings.has(building.id) ? 'rotate-90' : ''
                  }`}
                >
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{building.name}</h3>
                  <p className="text-sm text-gray-500">{building.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {buildingDetails[building.id]?.blocks?.length || 0} Block
                  </p>
                  <p className="text-xs text-gray-500">ID: #{building.id}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                >
                  Sửa
                </button>
              </div>
            </div>

            {/* Blocks List (Expanded) */}
            {expandedBuildings.has(building.id) && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                {buildingDetails[building.id]?.blocks?.length > 0 ? (
                  <div className="space-y-2">
                    {buildingDetails[building.id].blocks.map((block) => (
                      <div key={block.id} className="rounded-lg bg-white">
                        {/* Block Header */}
                        <div
                          className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
                          onClick={() => toggleBlock(block.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`transform transition-transform ${
                                expandedBlocks.has(block.id) ? 'rotate-90' : ''
                              }`}
                            >
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{block.name}</p>
                              <p className="text-xs text-gray-500">Block #{block.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {block.floors?.length || 0} tầng
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              Sửa
                            </button>
                          </div>
                        </div>

                        {/* Floors List (Expanded) */}
                        {expandedBlocks.has(block.id) && block.floors && (
                          <div className="border-t border-gray-100 bg-gray-50 p-3">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                              {block.floors.map((floor) => (
                                <div
                                  key={floor.id}
                                  className="rounded-lg border border-gray-200 bg-white p-2 text-center"
                                >
                                  <p className="text-sm font-medium text-gray-900">
                                    Tầng {floor.number}
                                  </p>
                                  <p className="text-xs text-gray-500">ID: {floor.id}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500">
                    Chưa có block nào trong tòa nhà này
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {buildings.length === 0 && !loading && (
        <Card>
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tòa nhà</h3>
            <p className="mt-1 text-sm text-gray-500">Hệ thống chưa có tòa nhà nào</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BuildingManagement;
