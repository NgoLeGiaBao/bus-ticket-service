import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'admin' | 'manager' | 'user';
  lastLogin?: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<Omit<User, 'id' | 'lastLogin' | 'createdAt'>>({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    status: 'active',
    role: 'user',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            fullName: 'System Administrator',
            phoneNumber: '0987654321',
            status: 'active',
            role: 'admin',
            lastLogin: '2023-05-15T10:30:00',
            createdAt: '2023-01-01T00:00:00',
          },
          {
            id: '2',
            username: 'manager1',
            email: 'manager@example.com',
            fullName: 'Operations Manager',
            phoneNumber: '0912345678',
            status: 'active',
            role: 'manager',
            lastLogin: '2023-05-14T15:45:00',
            createdAt: '2023-02-15T00:00:00',
          },
          {
            id: '3',
            username: 'user1',
            email: 'user1@example.com',
            fullName: 'Regular User',
            phoneNumber: '0909123456',
            status: 'inactive',
            role: 'user',
            createdAt: '2023-03-20T00:00:00',
          },
        ];
        
        setUsers(mockUsers);
        toast.success('User data loaded successfully');
      } catch (error) {
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // User actions
  const handleSubmitUser = async () => {
    if (!validateUserData()) return;

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isEditMode && currentUserId) {
        // Update existing user
        setUsers(users.map(user => 
          user.id === currentUserId 
            ? { 
                ...user, 
                ...currentUser,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
              } 
            : user
        ));
        toast.success('User updated successfully');
      } else {
        // Create new user
        const newUser: User = {
          ...currentUser,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
      toast.info('User deleted successfully');
    }
  };

  const handleStatusChange = (id: string, newStatus: User['status']) => {
    setUsers(users.map(user =>
      user.id === id 
        ? { ...user, status: newStatus }
        : user
    ));
    toast.info('User status updated');
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
      fullName: '',
      phoneNumber: '',
      status: 'active',
      role: 'user',
    });
    setIsEditMode(false);
    setCurrentUserId(null);
  };

  const prepareEditForm = (user: User) => {
    setCurrentUser({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      role: user.role,
    });
    setIsEditMode(true);
    setCurrentUserId(user.id);
    setIsModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // UI Components
  const StatusBadge: React.FC<{ status: User['status'] }> = ({ status }) => {
    const statusMap = {
      active: { color: 'green', text: 'Active' },
      inactive: { color: 'yellow', text: 'Inactive' },
      suspended: { color: 'red', text: 'Suspended' },
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusMap[status].color}-100 text-${statusMap[status].color}-800`}>
        {statusMap[status].text}
      </span>
    );
  };

  const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
    const roleMap = {
      admin: { color: 'purple', text: 'Admin' },
      manager: { color: 'blue', text: 'Manager' },
      user: { color: 'gray', text: 'User' },
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleMap[role].color}-100 text-${roleMap[role].color}-800`}>
        {roleMap[role].text}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New User
        </button>
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => prepareEditForm(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleStatusChange(
                        user.id, 
                        user.status === 'active' ? 'inactive' : 'active'
                      )}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.fullName}
                      onChange={(e) => setCurrentUser({...currentUser, fullName: e.target.value})}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="role"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={currentUser.role}
                        onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as User['role']})}
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={currentUser.status}
                        onChange={(e) => setCurrentUser({...currentUser, status: e.target.value as User['status']})}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmitUser}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : isEditMode ? 'Update User' : 'Create User'}
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