import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import bookingService from '../../services/bookingService';
import facilityService from '../../services/facilityService';

// Validation schema
const schema = yup.object().shape({
  facilityId: yup.number()
    .required('Vui lòng chọn cơ sở vật chất')
    .positive('Vui lòng chọn cơ sở vật chất hợp lệ'),
  notes: yup.string()
    .required('Vui lòng nhập mô tả')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự'),
  bookingDate: yup.date()
    .required('Vui lòng chọn ngày hẹn')
    .min(new Date(), 'Ngày hẹn không thể là ngày trong quá khứ'),
});

/**
 * CreateBooking Page
 * User: Create facility maintenance booking with validation
 */
const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      facilityId: '',
      notes: '',
      bookingDate: '',
    },
  });

  const descriptionValue = watch('notes', '');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await facilityService.listFacilities();
      setFacilities(response.data.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      await bookingService.createBooking(data);
      navigate('/my-bookings');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loading text="Đang tải danh sách cơ sở vật chất..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo booking bảo trì</h1>
          <p className="mt-2 text-gray-600">Đặt lịch sửa chữa cơ sở vật chất</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </div>

      {error && <ErrorMessage error={error} />}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Facility Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Cơ sở vật chất <span className="text-red-500">*</span>
            </label>
            <select
              {...register('facilityId')}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                errors.facilityId
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
            {errors.facilityId && (
              <p className="mt-1 text-sm text-red-500">{errors.facilityId.message}</p>
            )}
            {facilities.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                Không có cơ sở vật chất nào trong hệ thống
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mô tả sự cố <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="Mô tả chi tiết sự cố cần sửa chữa..."
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                errors.notes
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
              <p className={`ml-auto text-xs ${descriptionValue.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                {descriptionValue.length} / 500 ký tự (tối thiểu 10)
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
              {...register('bookingDate')}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                errors.bookingDate
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.bookingDate && (
              <p className="mt-1 text-sm text-red-500">{errors.bookingDate.message}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Sau khi tạo booking, quản trị viên sẽ phân công kỹ thuật viên để xử lý. 
                  Bạn có thể theo dõi tiến độ trong trang "Booking của tôi".
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-200 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitLoading}
              disabled={facilities.length === 0}
              className="flex-1"
            >
              Tạo booking
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateBooking;
