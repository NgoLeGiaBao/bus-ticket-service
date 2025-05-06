import React, { useEffect, useState } from 'react';
import { assignUserToRoute, createAssignUserToRoute, getAllRoutes, getAllStaffRoutes, getAllUsersWithRolesDriverAndConductor, updateAssignUserToRoute } from '../../services/apiServices';
import { RouteAssignmentPayload } from '../../interfaces/Dispatch';
import { FiUser, FiPhone, FiMail, FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiTruck, FiUsers } from 'react-icons/fi';

interface StaffRoute {
  id: string;
  userid: string;
  routeid: string;
  assigndate: string;
  isactive: boolean;
  roleassignments: string[];
}

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: {
    roleId: string;
    roleName: string;
  }[];
}

interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  price: number;
  is_active: boolean;
}

const roleOptions = [
  { value: "driver", label: "Tài xế" },
  { value: "conductor", label: "Phụ xe" },
];

const StaffRoutesPage = () => {
  const [routes, setRoutes] = useState<StaffRoute[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [routeOptions, setRouteOptions] = useState<Route[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Partial<StaffRoute>>({
    isactive: true,
    roleassignments: []
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
  const [routeFilter, setRouteFilter] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUser();
    fetchRoutes();
    fetchStaffRoutes();
  }, []);

  const fetchUser = async () => {
    const res = await getAllUsersWithRolesDriverAndConductor();
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
    }
  }

  const fetchRoutes = async () => {
    const res = await getAllRoutes();
    if(res.success && Array.isArray(res.data)) {
      setRouteOptions(res.data);
    }
  };

  const fetchStaffRoutes = async () => {
    const res = await getAllStaffRoutes();
    if(res.success && Array.isArray(res.data.routes)) {
      setRoutes(res.data.routes);
    }
  }

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getUserInfo = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getRouteInfo = (routeId: string) => {
    return routeOptions.find(route => route.id === routeId);
  };

  const checkDuplicateAssignment = (userId: string, routeId: string, roles: string[]) => {
    return routes.some(route => 
      route.userid === userId && 
      route.routeid === routeId &&
      route.roleassignments.some(role => roles.includes(role)) &&
      route.id !== currentRoute.id
    );
  };

  const handleRoleChange = (roleValue: string, isChecked: boolean) => {
    setCurrentRoute(prev => {
      const currentRoles = prev.roleassignments || [];
      let newRoles = [...currentRoles];
      
      if (isChecked) {
        if (roleValue === 'conductor') {
          const user = users.find(u => u.id === prev.userid);
          const isDriver = user?.roles.some(r => r.roleName.toLowerCase() === 'driver');
          if (!isDriver) {
            setErrorMessage("Chỉ nhân viên có vai trò tài xế mới có thể được phân công làm phụ xe");
            return prev;
          }
        }
        newRoles.push(roleValue);
      } else {
        newRoles = newRoles.filter(r => r !== roleValue);
      }
      
      setErrorMessage(null);
      return { ...prev, roleassignments: newRoles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRoute.userid || !currentRoute.routeid || !currentRoute.roleassignments?.length) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (checkDuplicateAssignment(
      currentRoute.userid, 
      currentRoute.routeid, 
      currentRoute.roleassignments
    )) {
      setErrorMessage("Nhân viên đã được phân công vai trò này trên tuyến đường này");
      return;
    }

    setErrorMessage(null);
    
    try {
      const isUpdate = Boolean(currentRoute.id);
    
      const routeAssignmentPayload: RouteAssignmentPayload = {
        userid: currentRoute.userid,
        routeid: currentRoute.routeid,
        assigndate: currentRoute.assigndate || new Date().toISOString(),
        isactive: currentRoute.isactive ?? true,
        roleassignments: currentRoute.roleassignments,
      };
    
      const res = isUpdate
        ? await updateAssignUserToRoute(currentRoute.id, routeAssignmentPayload)
        : await createAssignUserToRoute(routeAssignmentPayload);
    
      if (res.success) {
        fetchStaffRoutes();
      } else {
        console.warn("Assignment API call failed:", res);
      }
    } catch (error) {
      console.error("Assignment failed:", error);
    }
    
    setIsDialogOpen(false);
    setCurrentRoute({ isactive: true, roleassignments: [] });
  };

  const openEditDialog = (route: StaffRoute) => {
    setCurrentRoute(route);
    setIsDialogOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setRouteToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (routeToDelete) {
      try {
        // Gọi API xóa ở đây nếu cần
        setRoutes(routes.filter(r => r.id !== routeToDelete));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
    setIsDeleteModalOpen(false);
    setRouteToDelete(null);
  };

  const groupedRoutes = routes.reduce((acc, route) => {
    if (!acc[route.userid]) {
      acc[route.userid] = [];
    }
    acc[route.userid].push(route);
    return acc;
  }, {} as Record<string, StaffRoute[]>);

  const filteredUsers = users.filter(user => {
    const userRoutes = groupedRoutes[user.id] || [];
    
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm);
    
    const matchesRole = !roleFilter || 
      userRoutes.some(route => 
        route.roleassignments.includes(roleFilter)
      );
    
    const matchesStatus = statusFilter === null || 
      userRoutes.some(route => 
        route.isactive === statusFilter
      );
    
    const matchesRoute = !routeFilter ||
      userRoutes.some(route => 
        route.routeid === routeFilter
      );
    
    return matchesSearch && matchesRole && matchesStatus && matchesRoute;
  });

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center border-b border-stroke dark:border-strokedark">
        <div className="flex items-center space-x-3">
          <FiUsers className="text-2xl text-primary" />
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Quản lý phân công nhân viên
          </h4>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="mr-2" />
          Thêm phân công
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 2xl:px-7.5 pb-4 pt-4 space-y-4 bg-gray-50 dark:bg-meta-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm nhân viên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nhập tên hoặc số điện thoại nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTruck className="text-gray-400" />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              >
                <option value="">Tất cả vai trò</option>
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tuyến đường</label>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">Tất cả tuyến</option>
              {routeOptions.map(route => (
                <option key={route.id} value={route.id}>
                  {route.origin} → {route.destination}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
            <select
              value={statusFilter === null ? '' : String(statusFilter)}
              onChange={(e) => setStatusFilter(e.target.value === '' ? null : e.target.value === 'true')}
              className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">Tất cả</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="p-4 md:p-6 2xl:p-7.5 space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">Không tìm thấy nhân viên nào</h3>
            <p className="mt-1 text-sm">Thử thay đổi tiêu chí tìm kiếm hoặc thêm nhân viên mới</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map(user => {
              const userRoutes = groupedRoutes[user.id] || [];
              const isExpanded = expandedUsers[user.id] || false;
              
              return (
                <div key={user.id} className="rounded-lg border border-stroke shadow-sm overflow-hidden dark:border-strokedark">
                  {/* User Card Header */}
                  <div 
                    className={`flex justify-between items-center p-4 cursor-pointer ${isExpanded ? 'bg-gray-50 dark:bg-meta-4' : 'bg-white dark:bg-boxdark'} hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors`}
                    onClick={() => toggleUserExpansion(user.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                        <FiUser className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiPhone className="mr-1" />
                            <span>{user.phoneNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <FiMail className="mr-1" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentRoute({
                            userid: user.id,
                            isactive: true,
                            roleassignments: []
                          });
                          setIsDialogOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary bg-opacity-10 hover:bg-opacity-20 focus:outline-none transition-colors"
                      >
                        <FiPlus className="mr-1" />
                        Thêm phân công
                      </button>
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* User Routes (collapsible) */}
                  {isExpanded && (
                    <div className="border-t border-stroke dark:border-strokedark bg-white dark:bg-boxdark">
                      {userRoutes.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Nhân viên chưa được phân công tuyến nào
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                            <thead className="bg-gray-50 dark:bg-meta-4">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Tuyến đường
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Vai trò
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Ngày phân công
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Trạng thái
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Hành động
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-boxdark divide-y divide-stroke dark:divide-strokedark">
                              {userRoutes.map(route => {
                                const routeInfo = getRouteInfo(route.routeid);
                                return (
                                  <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                      {routeInfo ? (
                                        <div>
                                          <div className="font-medium">{routeInfo.origin} → {routeInfo.destination}</div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {routeInfo.distance} Km • {routeInfo.duration} Giờ
                                          </div>
                                        </div>
                                      ) : 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {route.roleassignments.map(role => {
                                        const roleOption = roleOptions.find(r => r.value === role);
                                        return (
                                          <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary mr-1">
                                            {roleOption ? roleOption.label : role}
                                          </span>
                                        );
                                      })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(route.assigndate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        route.isactive 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}>
                                        {route.isactive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => openEditDialog(route)}
                                        className="text-primary hover:text-primary-dark mr-3"
                                      >
                                        <FiEdit className="inline mr-1" />
                                        Sửa
                                      </button>
                                      <button
                                        onClick={() => openDeleteModal(route.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <FiTrash2 className="inline mr-1" />
                                        Xóa
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentRoute.id ? 'Chỉnh sửa phân công' : 'Thêm phân công mới'}
              </h3>
              <button 
                onClick={() => {
                  setIsDialogOpen(false);
                  setCurrentRoute({ isactive: true, roleassignments: [] });
                  setErrorMessage(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!currentRoute.userid && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nhân viên</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <select
                        name="userid"
                        value={currentRoute.userid || ''}
                        onChange={(e) => setCurrentRoute({...currentRoute, userid: e.target.value})}
                        className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                        required
                      >
                        <option value="">Chọn nhân viên</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.phoneNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tuyến đường</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTruck className="text-gray-400" />
                    </div>
                    <select
                      name="routeid"
                      value={currentRoute.routeid || ''}
                      onChange={(e) => setCurrentRoute({...currentRoute, routeid: e.target.value})}
                      className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      required
                    >
                      <option value="">Chọn tuyến đường</option>
                      {routeOptions.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.origin} → {route.destination}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò</label>
                  <div className="space-y-2">
                    {roleOptions
                      .filter(role => role.value !== 'manager')
                      .map(role => {
                        const user = users.find(u => u.id === currentRoute.userid);
                        const hasDriverRole = user?.roles.some(r => r.roleName.toLowerCase() === 'driver');
                        const disableDriver = role.value === 'driver' && currentRoute.userid && !hasDriverRole;  

                        return (
                          <div key={role.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`role-${role.value}`}
                              checked={currentRoute.roleassignments?.includes(role.value) || false}
                              onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              disabled={disableDriver}
                            />
                            <label htmlFor={`role-${role.value}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {role.label}
                              {disableDriver && (
                                <span className="text-xs text-gray-500 ml-1 dark:text-gray-400">(Yêu cầu vai trò tài xế)</span>
                              )}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isactive"
                    name="isactive"
                    checked={currentRoute.isactive || false}
                    onChange={(e) => setCurrentRoute({
                      ...currentRoute,
                      isactive: e.target.checked
                    })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isactive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Đang hoạt động</label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setCurrentRoute({ isactive: true, roleassignments: [] });
                    setErrorMessage(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Xác nhận xóa</h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-0.5">
                <FiTrash2 className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Bạn có chắc chắn muốn xóa phân công này?</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRoutesPage;