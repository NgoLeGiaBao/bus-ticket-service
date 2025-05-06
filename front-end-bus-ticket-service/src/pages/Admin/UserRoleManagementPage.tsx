import React, { useState, useEffect } from 'react';
import { createRole, deleteRole, getAllUsers, settingRoles, updateRole } from '../../services/apiServices';
import { getAllRoles } from './../../services/apiServices';

interface Role {
  roleId: string;
  roleName: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: Role[];
  isActive?: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface FullRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

const UserRoleManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<FullRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState('');
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    email: '',
    phoneNumber: '',
    roles: [],
    isActive: true,
  });
  const [newRole, setNewRole] = useState<Omit<FullRole, 'id'>>({
    name: '',
    description: '',
    permissions: [],
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRoleAssignmentModal, setShowRoleAssignmentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Mock data initialization
  useEffect(() => {
    fetchRoles();
    fetchAllUser();
  }, []);

  // Get All User
  const fetchAllUser = async () => {
    try {
      const res = await getAllUsers(); 
      if (res.success && Array.isArray(res.data)) {
        const transformedUsers: User[] = res.data.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isActive: true,
          roles: user.roles.map((role: any) => ({
            roleId: role.roleId,
            roleName: role.roleName
          }))
        }));
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await getAllRoles();
      if (res.success && Array.isArray(res.data)) {
        const transformedRoles: FullRole[] = res.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description || '-',
          permissions: role.permissions || []
        }));
        setRoles(transformedRoles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

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
      phoneNumber: user.phoneNumber,
      roles: user.roles,
      isActive: user.isActive ?? true,
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
  const handleAddRole = async () => {
    if(editingRoleId) {
      const res = await updateRole(editingRoleId, newRole);
      if (res.success) {
        fetchRoles();
        resetRoleForm();
        setShowRoleModal(false);
      }
    } else {
      const res = await createRole(newRole);
      if (res.success) {
        fetchRoles();
        resetRoleForm();
        setShowRoleModal(false);
      }
    }
  };

  const handleEditRole = (role: FullRole) => {
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setEditingRoleId(role.id);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async(id: string) => {
    const res = await deleteRole(id);
    if (res.success) {
      fetchRoles();
    }
  };

  // Role assignment functions
  const openRoleAssignmentModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleAssignmentModal(true);
  };

  const handleAssignRoleToUser = async (userId: string, roleId: string, isAssign: boolean) => {
    const res = await settingRoles(userId, roleId, isAssign);
    if (res.success) {
      const res = await getAllUsers();
      if (res.success && Array.isArray(res.data)) {
        const transformedUsers: User[] = res.data.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isActive: true,
          roles: user.roles.map((role: any) => ({
            roleId: role.roleId,
            roleName: role.roleName
          }))
        }));
        setUsers(transformedUsers);
        
        // Cập nhật selectedUser nếu đang mở modal
        if (showRoleAssignmentModal && selectedUser) {
          const updatedUser = transformedUsers.find(u => u.id === userId);
          if (updatedUser) {
            setSelectedUser(updatedUser);
          }
        }
      }
    }
  };

  // Form reset functions
  const resetUserForm = () => {
    setNewUser({
      username: '',
      email: '',
      phoneNumber: '',
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
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.phoneNumber.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.description.toLowerCase().includes(search.toLowerCase())
  );

  // Helper components
  const StatusBadge: React.FC<{ active?: boolean }> = ({ active }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {active ? 'Hoạt động' : 'Không hoạt động'}
    </span>
  );
  
  const PermissionBadge: React.FC<{ permission: Permission }> = ({ permission }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
      {permission.name}
    </span>
  );
  
  const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    let color = {
      bg: 'bg-gray-100',
      text: 'text-gray-800'
    };
  
    switch (role.roleName) {
      case 'Admin':
        color = { bg: 'bg-purple-100', text: 'text-purple-800' };
        break;
      case 'Employee':
        color = { bg: 'bg-green-100', text: 'text-green-800' };
        break;
      case 'Customer':
        color = { bg: 'bg-blue-100', text: 'text-blue-800' };
        break;
      case 'Driver':
        color = { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        break;
    }
  
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color.bg} ${color.text} mr-1 mb-1`}
      >
        {role.roleName}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng & Vai trò</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            // onClick={() => activeTab === 'users' ? setShowUserModal(true) : setShowRoleModal(true)}
            onClick={() => activeTab === 'users' ? null : setShowRoleModal(true)}

            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {/* {activeTab === 'users' ? '+ Thêm người dùng' : '+ Thêm vai trò'} */}
            {activeTab === 'users' ? null : '+ Thêm vai trò'}
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
            Người dùng
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vai trò
          </button>
        </nav>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Tên đăng nhập</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 text-center">
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phoneNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-center">
                      {user.roles.map((role) => (
                        <RoleBadge key={role.roleId} role={role} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge active={user.isActive} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openRoleAssignmentModal(user)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Phân quyền
                    </button>
                    {/* <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button> */}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Tên vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Quyền hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 text-center">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{role.name}</td>
                  <td className="px-6 py-4">{role.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-center">
                      {role.permissions.map(permission => (
                        <PermissionBadge key={permission.id} permission={permission} />
                      ))}
                      -
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
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
                {editingUserId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
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
                  Tên đăng nhập
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
                  Số điện thoại
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.phoneNumber}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  multiple
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  value={newUser.roles.map(role => role.roleId)}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => ({
                      roleId: option.value,
                      roleName: roles.find(r => r.id === option.value)?.name || ''
                    }));
                    setNewUser({ ...newUser, roles: selectedOptions });
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
                  Kích hoạt tài khoản
                </label>
              </div>

              <button
                onClick={handleAddUser}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
              >
                {editingUserId ? 'Cập nhật' : 'Thêm mới'}
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
                {editingRoleId ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
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
                  Tên vai trò
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
                  Mô tả
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
                  Quyền hạn
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
                {editingRoleId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleAssignmentModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Phân quyền cho {selectedUser.username}
              </h2>
              <button
                onClick={() => setShowRoleAssignmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh sách vai trò
                </label>
                <div className="border rounded p-2 max-h-60 overflow-y-auto">
                  {roles.map(role => {
                    const hasRole = selectedUser.roles.some(r => r.roleId === role.id);
                    return (
                      <div key={role.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
                        <span>{role.name}</span>
                        <button
                          onClick={() => handleAssignRoleToUser(selectedUser.id, role.id, !hasRole)}
                          className={`px-3 py-1 rounded text-sm ${
                            hasRole 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {hasRole ? 'Gỡ bỏ' : 'Thêm vào'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowRoleAssignmentModal(false)}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors mt-4"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleManagement;