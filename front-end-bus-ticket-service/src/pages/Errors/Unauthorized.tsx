import { useNavigate } from 'react-router-dom';
import { FaLock, FaHome, FaEnvelope } from 'react-icons/fa';
import { MdWarning } from 'react-icons/md';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
          <MdWarning className="h-10 w-10 text-amber-600" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        {/* Error code */}
        <div className="bg-gray-100 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-800 mb-6">
          <FaLock className="mr-2" /> Error 403: Forbidden
        </div>
        
        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaHome className="mr-2" /> Go to Home
          </button>
          
          <a
            href="mailto:admin@restaurant.com"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaEnvelope className="mr-2" /> Contact Admin
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Spicy Pot Delight. All rights reserved.</p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;