import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import apartmentService from '../../services/apartmentService';
import buildingService from '../../services/buildingService';

// Validation schema
const schema = yup.object().shape({
  floorId: yup.number().required('Vui lòng chọn tầng').positive('Vui lòng chọn tầng hợp lệ'),
  area: yup.number()
    .required('Vui lòng nhập diện tích')
    .positive('Diện tích phải là số dương')
    .min(10, 'Diện tích tối thiểu 10 m²')
    .max(500, 'Diện tích tối đa 500 m²'),
  monthlyRent: yup.number()
    .required('Vui lòng nhập giá thuê')
    .positive('Giá thuê phải là số dương')
    .min(1000000, 'Giá thuê tối thiểu 1,000,000 VNĐ'),
  status: yup.string()
    .required('Vui lòng chọn trạng thái')
    .oneOf(['vacant', 'occupied', 'maintenance'], 'Trạng thái không hợp lệ'),
});

/**
 * CreateApartment Page
 * Admin: Create new apartment with validation
 */
const CreateApartment = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      floorId: '',
      area: '',
      monthlyRent: '',
      status: 'vacant',
    },
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchBlocks(selectedBuilding);
    } else {
      setBlocks([]);
      setFloors([]);
    }
  }, [selectedBuilding]);

  useEffect(() => {
    if (selectedBlock) {
      fetchFloors(selectedBlock);
    } else {
      setFloors([]);
    }
  }, [selectedBlock]);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await buildingService.getAllBuildings();
      setBuildings(response.data.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (buildingId) => {
    try {
      const response = await buildingService.getBlocksByBuilding(buildingId);
      setBlocks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching blocks:', err);
    }
  };

  const fetchFloors = async (blockId) => {
    try {
      const response = await buildingService.getFloorsByBlock(blockId);
      setFloors(response.data.data || []);
    } catch (err) {
      console.error('Error fetching floors:', err);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      await apartmentService.createApartment(data);
      navigate('/apartments');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loading text="Đang tải dữ liệu..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Thêm căn hộ mới</h1>
        <Button variant="secondary" onClick={() => navigate('/apartments')}>
          ← Quay lại
        </Button>
      </div>

      {error && <ErrorMessage error={error} />}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Building Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tòa nhà <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedBlock('');
                setValue('floor_id', '');
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Chọn tòa nhà --</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          {/* Block Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Khu <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                setValue('floor_id', '');
              }}
              disabled={!selectedBuilding}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              <option value="">-- Chọn khu --</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tầng <span className="text-red-500">*</span>
            </label>
            <select
              {...register('floorId')}
              disabled={!selectedBlock}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 disabled:bg-gray-100 ${
                errors.floorId
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="">-- Chọn tầng --</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  Tầng {floor.number}
                </option>
              ))}
            </select>
            {errors.floorId && (
              <p className="mt-1 text-sm text-red-500">{errors.floorId.message}</p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Diện tích (m²) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('area')}
              placeholder="Ví dụ: 50.5"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                errors.area
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.area && (
              <p className="mt-1 text-sm text-red-500">{errors.area.message}</p>
            )}
          </div>

          {/* Rent */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Giá thuê (VNĐ/tháng) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('monthlyRent')}
              placeholder="Ví dụ: 5000000"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                errors.monthlyRent
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.monthlyRent && (
              <p className="mt-1 text-sm text-red-500">{errors.monthlyRent.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status')}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                errors.status
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="vacant">Còn trống</option>
              <option value="occupied">Đã cho thuê</option>
              <option value="maintenance">Đang bảo trì</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-200 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/apartments')}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              className="flex-1"
            >
              Tạo căn hộ
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateApartment;
