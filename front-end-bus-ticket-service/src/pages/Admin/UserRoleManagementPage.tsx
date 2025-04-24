import React, { useState, useEffect } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  isActive: boolean;
}

const UserRoleManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState('');
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    email: '',
    roles: [],
    isActive: true,
  });
  const [newRole, setNewRole] = useState<Omit<Role, 'id'>>({
    name: '',
    description: '',
    permissions: [],
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Mock data initialization
  useEffect(() => {
    // Mock permissions
    const mockPermissions: Permission[] = [
      { id: '1', name: 'user_management', description: 'Manage users' },
      { id: '2', name: 'role_management', description: 'Manage roles' },
      { id: '3', name: 'content_management', description: 'Manage content' },
      { id: '4', name: 'settings_management', description: 'Manage settings' },
    ];

    // Mock roles
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access',
        permissions: mockPermissions,
      },
      {
        id: '2',
        name: 'Editor',
        description: 'Content management access',
        permissions: mockPermissions.filter(p => p.name.includes('content')),
      },
      {
        id: '3',
        name: 'Viewer',
        description: 'Read-only access',
        permissions: [],
      },
    ];

    // Mock users
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: [mockRoles[0]],
        isActive: true,
      },
      {
        id: '2',
        username: 'editor1',
        email: 'editor1@example.com',
        roles: [mockRoles[1]],
        isActive: true,
      },
      {
        id: '3',
        username: 'viewer1',
        email: 'viewer1@example.com',
        roles: [mockRoles[2]],
        isActive: false,
      },
    ];

    setPermissions(mockPermissions);
    setRoles(mockRoles);
    setUsers(mockUsers);
  }, []);

  // User management functions
  const handleAddUser = () => {
    if (editingUserId) {
      setUsers(users.map(user =>
        user.id === editingUserId ? { id: editingUserId, ...newUser } : user
      ));
    } else {
      const newId = crypto.randomUUID();
      setUsers([...users, { id: newId, ...newUser }]);
    }
    resetUserForm();
    setShowUserModal(false);
  };

  const handleEditUser = (user: User) => {
    setNewUser({
      username: user.username,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    });
    setEditingUserId(user.id);
    setShowUserModal(true);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
  };

  // Role management functions
  const handleAddRole = () => {
    if (editingRoleId) {
      setRoles(roles.map(role =>
        role.id === editingRoleId ? { id: editingRoleId, ...newRole } : role
      ));
    } else {
      const newId = crypto.randomUUID();
      setRoles([...roles, { id: newId, ...newRole }]);
    }
    resetRoleForm();
    setShowRoleModal(false);
  };

  const handleEditRole = (role: Role) => {
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setEditingRoleId(role.id);
    setShowRoleModal(true);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  // Form reset functions
  const resetUserForm = () => {
    setNewUser({
      username: '',
      email: '',
      roles: [],
      isActive: true,
    });
    setEditingUserId(null);
  };

  const resetRoleForm = () => {
    setNewRole({
      name: '',
      description: '',
      permissions: [],
    });
    setEditingRoleId(null);
  };

  // Filter functions
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.description.toLowerCase().includes(search.toLowerCase())
  );

  // Helper components
  const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );

  const PermissionBadge: React.FC<{ permission: Permission }> = ({ permission }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
      {permission.name}
    </span>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User & Role Management</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => activeTab === 'users' ? setShowUserModal(true) : setShowRoleModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {activeTab === 'users' ? '+ Add User' : '+ Add Role'}
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles
          </button>
        </nav>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.roles.map(role => (
                      <span key={role.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-1 mb-1">
                        {role.name}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge active={user.isActive} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Roles Table */}
      {activeTab === 'roles' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{role.name}</td>
                  <td className="px-6 py-4">{role.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap">
                      {role.permissions.map(permission => (
                        <PermissionBadge key={permission.id} permission={permission} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
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

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingUserId ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  resetUserForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roles
                </label>
                <select
                  multiple
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  value={newUser.roles.map(role => role.id)}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                    setNewUser({
                      ...newUser,
                      roles: roles.filter(role => selectedIds.includes(role.id)),
                    });
                  }}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={newUser.isActive}
                  onChange={(e) =>
                    setNewUser({ ...newUser, isActive: e.target.checked })
                  }
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active User
                </label>
              </div>

              <button
                onClick={handleAddUser}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
              >
                {editingUserId ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingRoleId ? 'Edit Role' : 'Add New Role'}
              </h2>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  resetRoleForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions
                </label>
                <select
                  multiple
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  value={newRole.permissions.map(permission => permission.id)}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                    setNewRole({
                      ...newRole,
                      permissions: permissions.filter(permission => selectedIds.includes(permission.id)),
                    });
                  }}
                >
                  {permissions.map(permission => (
                    <option key={permission.id} value={permission.id}>
                      {permission.name} - {permission.description}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddRole}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
              >
                {editingRoleId ? 'Update Role' : 'Add Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleManagement;