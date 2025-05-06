import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllUsers } from '../../services/apiServices';

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: string[];
}

const UserManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<Omit<User, 'id'>>({
    username: '',
    email: '',
    phoneNumber: '',
    roles: ['Customer'],
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data);
        toast.success(res.message);
      } catch (error) {
        toast.error('Failed to load user data');
      }
    };

    fetchUsers();
  }, []);

  // User actions
  const handleSubmitUser = async () => {
    if (!validateUserData()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isEditMode && currentUserId) {
        // Update existing user
        setUsers(users.map(user => 
          user.id === currentUserId 
            ? { 
                ...user, 
                ...currentUser
              } 
            : user
        ));
        toast.success('User updated successfully');
      } else {
        // Create new user
        const newUser: User = {
          ...currentUser,
          id: crypto.randomUUID(),
        };
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
      toast.info('User deleted successfully');
    }
  };

  // Helper functions
  const validateUserData = (): boolean => {
    if (!currentUser.username.trim() || !currentUser.email.trim()) {
      toast.warning('Username and email are required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(currentUser.email)) {
      toast.warning('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setCurrentUser({
      username: '',
      email: '',
      phoneNumber: '',
      roles: ['Customer'],
    });
    setIsEditMode(false);
    setCurrentUserId(null);
  };

  const prepareEditForm = (user: User) => {
    setCurrentUser({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roles: [...user.roles],
    });
    setIsEditMode(true);
    setCurrentUserId(user.id);
    setIsModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // UI Components
  const RoleBadge: React.FC<{ roles: string[] }> = ({ roles }) => {
    const roleMap: Record<string, { color: string, text: string }> = {
      Admin: { color: 'purple', text: 'Admin' },
      Customer: { color: 'blue', text: 'Customer' },
      Employee: { color: 'green', text: 'Employee' },
    };

    return (
      <div className="flex space-x-1">
        {roles.map(role => (
          <span 
            key={role}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleMap[role]?.color || 'gray'}-100 text-${roleMap[role]?.color || 'gray'}-800`}
          >
            {roleMap[role]?.text || role}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        {/* <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New User
        </button> */}
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {user.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge roles={user.roles} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => prepareEditForm(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {isEditMode ? 'Update User' : 'Create New User'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.username}
                      onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.email}
                      onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.phoneNumber}
                      onChange={(e) => setCurrentUser({...currentUser, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="roles" className="block text-sm font-medium text-gray-700">
                      Roles
                    </label>
                    <select
                      id="roles"
                      multiple
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.roles}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setCurrentUser({...currentUser, roles: options});
                      }}
                    >
                      <option value="Customer">Customer</option>
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple roles</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmitUser}
                >
                  {isEditMode ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;