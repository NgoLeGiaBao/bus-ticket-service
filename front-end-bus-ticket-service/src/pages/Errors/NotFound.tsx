import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaSadTear } from 'react-icons/fa';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
          <FaSadTear className="h-10 w-10 text-indigo-600" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Error code */}
        <div className="bg-gray-100 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-800 mb-6">
          <FaSearch className="mr-2" /> Error 404: Not Found
        </div>
        
        {/* Actions */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaHome className="mr-2" /> Return to Homepage
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Spicy Pot Delight. All rights reserved.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;