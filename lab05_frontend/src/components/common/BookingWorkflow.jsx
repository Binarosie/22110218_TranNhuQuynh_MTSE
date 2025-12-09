import React from 'react';
import { BOOKING_STATUS } from '../../utils/constants';

/**
 * BookingWorkflow Component
 * Visual representation of booking workflow: TODO → PENDING → FIXED → DONE
 * @param {object} props - Component props
 * @param {string} props.currentStatus - Current booking status
 */
const BookingWorkflow = ({ currentStatus = 'TODO' }) => {
  const steps = [
    { status: 'TODO', label: 'Chờ xử lý', description: 'Booking mới được tạo' },
    { status: 'PENDING', label: 'Đang sửa', description: 'Kỹ thuật viên đang xử lý' },
    { status: 'FIXED', label: 'Đã sửa xong', description: 'Chờ xác nhận' },
    { status: 'DONE', label: 'Hoàn thành', description: 'Đã xác nhận hoàn thành' },
  ];

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.status === status);
  };

  const currentStepIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-4">
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute left-0 top-5 h-1 w-full bg-gray-200"></div>
        
        {/* Progress line */}
        <div 
          className="absolute left-0 top-5 h-1 bg-indigo-600 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const config = BOOKING_STATUS[step.status];

            return (
              <div key={step.status} className="flex flex-col items-center" style={{ width: '25%' }}>
                {/* Step circle */}
                <div
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'border-indigo-600 bg-indigo-600'
                      : isCurrent
                      ? 'border-indigo-600 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {step.description}
                  </div>
                  {isCurrent && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                        <span className={`mr-1 h-2 w-2 rounded-full ${config.dotColor}`}></span>
                        {config.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingWorkflow;
