import React from 'react';

interface Props {
  func: {
    closeModal: () => void;
  };
  message: string;
}

const FailureNotification: React.FC<Props> = ({ func, message }) => {
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border-2 border-red-500 overflow-hidden">
        {/* Header with red accent */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 py-3 px-6 text-white font-bold text-lg">
          Thông báo lỗi
        </div>
        
        {/* Body */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <svg 
              className="w-16 h-16 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          {/* Message */}
          <h3 className="mb-5 text-lg font-medium text-gray-700">
            {message}
          </h3>
          
          {/* Button */}
          <button
            type="button"
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-lg shadow-md hover:from-red-600 hover:to-orange-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={func.closeModal}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailureNotification;