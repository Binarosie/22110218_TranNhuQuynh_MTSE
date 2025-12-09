import React, { useState } from 'react';
import Button from '../common/Button';
import { VALIDATION_MESSAGES } from '../../utils/constants';

/**
 * BookingForm Component
 * For creating facility maintenance bookings
 */
const BookingForm = ({ facilities = [], onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    facility_id: '',
    description: '',
    scheduled_date: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.facility_id) {
      newErrors.facility_id = VALIDATION_MESSAGES.REQUIRED;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = VALIDATION_MESSAGES.REQUIRED;
    } else {
      const selectedDate = new Date(formData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.scheduled_date = 'Ngày hẹn không thể là ngày trong quá khứ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Facility Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Cơ sở vật chất <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.facility_id}
          onChange={(e) => handleChange('facility_id', e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
            errors.facility_id
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        >
          <option value="">-- Chọn cơ sở vật chất --</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name} - {facility.status}
            </option>
          ))}
        </select>
        {errors.facility_id && (
          <p className="mt-1 text-sm text-red-500">{errors.facility_id}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Mô tả sự cố <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          placeholder="Mô tả chi tiết sự cố cần sửa chữa..."
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
            errors.description
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
          <p className={`text-xs ${formData.description.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
            {formData.description.length} / tối thiểu 10 ký tự
          </p>
        </div>
      </div>

      {/* Scheduled Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Ngày hẹn <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.scheduled_date}
          onChange={(e) => handleChange('scheduled_date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
            errors.scheduled_date
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
        {errors.scheduled_date && (
          <p className="mt-1 text-sm text-red-500">{errors.scheduled_date}</p>
        )}
      </div>

      {/* Actions */}
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
          className="flex-1"
        >
          Tạo booking
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
