import React, { useState } from 'react';
import Button from '../common/Button';
import { VALIDATION_MESSAGES } from '../../utils/constants';

/**
 * AssignTechnicianForm Component
 * For assigning technicians to bookings (Admin only)
 */
const AssignTechnicianForm = ({ technicians = [], onSubmit, onCancel }) => {
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTechnician) {
      setError(VALIDATION_MESSAGES.REQUIRED);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedTechnician);
    } catch (error) {
      console.error('Error assigning technician:', error);
      setError(error.response?.data?.error || 'Có lỗi xảy ra khi phân công kỹ thuật viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Chọn kỹ thuật viên <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedTechnician}
          onChange={(e) => {
            setSelectedTechnician(e.target.value);
            setError('');
          }}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        >
          <option value="">-- Chọn kỹ thuật viên --</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.firstName} {technician.lastName} - {technician.email}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>

      {technicians.length === 0 && (
        <div className="rounded-lg bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            Không có kỹ thuật viên nào trong hệ thống
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={technicians.length === 0}
          className="flex-1"
        >
          Phân công
        </Button>
      </div>
    </form>
  );
};

export default AssignTechnicianForm;
