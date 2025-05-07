import React, { useEffect, useState } from 'react';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiTruck, FiChevronDown, FiChevronUp, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { createDispatchAssignment, getAllDispatchAssignments, getAllRoutes, getAllStaffRoutes, getAllTrips, getAllUsersWithRolesDriverAndConductor, updateDispatchAssignmentStatus } from '../../services/apiServices';
import { DispatchAssignmentPayload, DispatchAssignmentStatusPayload } from '../../interfaces/Dispatch';

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: { roleId: string; roleName: string }[];
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

interface Trip {
  id: string;
  trip_date: string;
  available_seats: number;
  route_id: string;
  booked_seats: string[];
  vehicle_type: string;
  price: number;
  status: string;
  routes: {
    id: string;
    price: number;
    origin: string;
    distance: number;
    duration: number;
    is_active: boolean;
    destination: string;
  };
}

interface DispatchAssignment {
  id: string;
  userid: string;
  tripid: string;
  assignedate: string;
  expectedendtime: string;
  createdate: string;
  role: string;
  status: string;
}

interface StaffRoute {
  id: string;
  userid: string;
  routeid: string;
  assigndate: string;
  isactive: boolean;
  roleassignments: string[];
}

interface Notification {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

const DispatchAssignmentsPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [assignments, setAssignments] = useState<DispatchAssignment[]>([]);
  const [staffRoutes, setStaffRoutes] = useState<StaffRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTrips, setExpandedTrips] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<Notification>({ type: 'success', message: '', show: false });

  const nowInVietnam = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
  const now = new Date(nowInVietnam);
  const oneHourLater = new Date(now.getTime() + 3600000);

  const [currentAssignment, setCurrentAssignment] = useState<Partial<DispatchAssignment>>({
    status: 'assigned',
    assignedate: '',
    expectedendtime: '',
    role: 'driver',
  });

  useEffect(() => {
    fetchUser();
    fetchRoutes();
    fetchStaffRoutes();
    fetchTrips();
    fetchDispatchAssignments();
  }, []);

  const fetchUser = async () => {
    const res = await getAllUsersWithRolesDriverAndConductor();
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
    }
  };

  const fetchRoutes = async () => {
    const res = await getAllRoutes();
    if (res.success && Array.isArray(res.data)) {
      setRoutes(res.data);
    }
  };

  const fetchStaffRoutes = async () => {
    const res = await getAllStaffRoutes();
    if (res.success && Array.isArray(res.data.routes)) {
      setStaffRoutes(res.data.routes);
    }
  };

  const fetchTrips = async () => {
    const res = await getAllTrips();
    if (res.success && Array.isArray(res.data)) {
      setTrips(res.data);
    }
  };

  const fetchDispatchAssignments = async () => {
    const res = await getAllDispatchAssignments();
    if (res.success) {
      setAssignments(res.data.assignments);
    }
  };

  const filteredTrips = selectedRouteId
    ? trips.filter((trip) => trip.route_id === selectedRouteId)
    : [];

  const filteredDrivers = selectedRouteId
    ? users.filter((user) =>
        staffRoutes.some(
          (sr) =>
            sr.routeid === selectedRouteId &&
            sr.userid === user.id &&
            sr.isactive &&
            sr.roleassignments.includes('driver')
        )
      )
    : [];

  const filteredTripAssignments = trips
    .filter((trip) => {
      const tripDate = new Date(trip.trip_date).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).split('T')[0];
      const hasAssignments = assignments.some((a) => a.tripid === trip.id);

      return (
        (!routeFilter || trip.route_id === routeFilter) &&
        (!dateFilter || tripDate === dateFilter) &&
        (statusFilter === 'all' ||
          (statusFilter === 'assigned' && hasAssignments) ||
          (statusFilter === 'unassigned' && !hasAssignments))
      );
    })
    .map((trip) => ({
      tripId: trip.id,
      assignments: assignments.filter((a) => a.tripid === trip.id),
      trip,
    }));

  const toggleTripExpansion = (tripId: string) => {
    setExpandedTrips((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
  };

  const calculateExpectedEndTime = (tripId: string, routeId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    const route = routes.find((r) => r.id === routeId);
    if (trip && route) {
      const startTime = new Date(new Date(trip.trip_date).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const durationHours = route.duration + 1;
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
      return endTime.toISOString();
    }
    return new Date(new Date(nowInVietnam).getTime() + 3600000).toISOString();
  };

  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      const assignedDate = new Date(trip.trip_date).toISOString();
      const expectedEndTime = calculateExpectedEndTime(tripId, trip.route_id);
      setCurrentAssignment((prev) => ({
        ...prev,
        assignedate: assignedDate,
        expectedendtime: expectedEndTime,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedTripId || !currentAssignment.role) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      setNotification({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin', show: true });
      return;
    }

    if (
      new Date(currentAssignment.expectedendtime!) <= new Date(currentAssignment.assignedate!)
    ) {
      setErrorMessage('Thời gian kết thúc phải sau thời gian bắt đầu');
      setNotification({ type: 'error', message: 'Thời gian kết thúc phải sau thời gian bắt đầu', show: true });
      return;
    }

    if (
      assignments.some(
        (a) =>
          a.tripid === selectedTripId &&
          a.userid === selectedUserId &&
          a.role === currentAssignment.role &&
          a.id !== currentAssignment.id
      )
    ) {
      setErrorMessage('Nhân viên đã được phân công vai trò này cho chuyến đi này');
      setNotification({ type: 'error', message: 'Nhân viên đã được phân công vai trò này cho chuyến đi này', show: true });
      return;
    }

    const isUpdating = Boolean(currentAssignment.id);

    if (isUpdating) {
      const assignmentPayLoad: DispatchAssignmentStatusPayload = {
        status: currentAssignment.status || 'assigned',
      };
  
      const res = await updateDispatchAssignmentStatus(currentAssignment.id!, assignmentPayLoad);
      if (res.success) {
        fetchDispatchAssignments();
        setNotification({
          type: 'success',
          message: 'Cập nhật phân công thành công',
          show: true,
        });
        
      }
    } else {
      const now = new Date();
      const toISOStringPlus7 = (date: string | Date) =>
        new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000).toISOString();
  
      const newAssignment: DispatchAssignment = {
        ...currentAssignment,
        id: `da${Date.now()}`,
        userid: selectedUserId,
        tripid: selectedTripId,
        status: currentAssignment.status || 'assigned',
        createdate: now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
        assignedate: currentAssignment.assignedate || new Date().toISOString(),
        expectedendtime: currentAssignment.expectedendtime || new Date().toISOString(),
        role: currentAssignment.role || 'driver',
      };
  
      setAssignments(prev => [...prev, newAssignment]);
  
      const assignmentPayLoad: DispatchAssignmentPayload = {
        tripid: selectedTripId,
        userid: selectedUserId,
        assignedate: toISOStringPlus7(newAssignment.assignedate),
        expectedendtime: toISOStringPlus7(newAssignment.expectedendtime),
        role: newAssignment.role,
        status: newAssignment.status,
      };
  
      const res = await createDispatchAssignment(assignmentPayLoad);
      if (res.success) {
        fetchDispatchAssignments();
        setNotification({
          type: 'success',
          message: 'Phân công đã được thêm thành công',
          show: true,
        });
      }
    }
  
    // Close dialog
    setTimeout(() => {
      setNotification({ type: 'success', message: '', show: false });
    }, 3000);
    // Reset form
    setIsDialogOpen(false);
    setCurrentAssignment({
      status: 'assigned',
      assignedate: '',
      expectedendtime: '',
      role: 'driver',
    });
    setSelectedRouteId('');
    setSelectedTripId('');
    setSelectedUserId('');
    setErrorMessage(null);
  };

  const handleDelete = async () => {
    const assignmentPayLoad: DispatchAssignmentStatusPayload = {
      status: 'cancelled',
    };
    
    const res = await updateDispatchAssignmentStatus(assignmentToDelete || '', assignmentPayLoad);
    if (res.success) {
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
      
      fetchDispatchAssignments();

      setNotification({
        type: 'success',
        message: 'Đã huỷ phân công thành công',
        show: true,
      });

      setTimeout(() => {
        setNotification({ type: 'success', message: '', show: false });
      }, 3000); 

      
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      assigned: { text: 'Đã phân công', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'in-progress': { text: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      completed: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };

    const statusKey = status.toLowerCase() as keyof typeof statusMap;
    const badgeInfo = statusMap[statusKey] || { text: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeInfo.color}`}>
        {badgeInfo.text}
      </span>
    );
  };

  const getRouteInfo = (routeId: string) => {
    return routes.find((r) => r.id === routeId) || { origin: '', destination: '' };
  };

  const getTripInfo = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    return trip
      ? {
          date: new Date(trip.trip_date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          origin: trip.routes.origin,
          destination: trip.routes.destination,
          vehicleType: trip.vehicle_type,
        }
      : { date: '', origin: '', destination: '', vehicleType: '' };
  };

  const getUserInfo = (userId: string) => {
    return users.find((u) => u.id === userId) || { username: '' };
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatToDateTimeLocal = (isoString: string) => {
    return new Date(isoString).toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).slice(0, 16).replace(' ', 'T');
  };

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center border-b border-stroke dark:border-strokedark">
        <div className="flex items-center space-x-3">
          <h4 className="text-xl font-semibold text-black dark:text-white">Quản lý điều phối tài xế</h4>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="mr-2" />
          Thêm điều phối
        </button>
      </div>

      <div className="px-4 md:px-6 2xl:px-7.5 pb-4 pt-4 space-y-4 bg-gray-50 dark:bg-meta-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tuyến đường</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTruck className="text-gray-400" />
              </div>
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              >
                <option value="">Tất cả tuyến</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.origin} → {route.destination}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ngày khởi hành</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="assigned">Đã phân công</option>
              <option value="unassigned">Chưa phân công</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 2xl:p-7.5 space-y-4">
        {filteredTripAssignments.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">Không có chuyến nào phù hợp</h3>
            <p className="mt-1 text-sm">Thử thay đổi tiêu chí lọc hoặc thêm điều phối mới</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTripAssignments.map(({ tripId, assignments, trip }) => {
              const tripInfo = getTripInfo(tripId);
              const route = getRouteInfo(trip.route_id);
              const isExpanded = expandedTrips[tripId] || false;

              return (
                <div key={tripId} className="rounded-lg border border-stroke shadow-sm overflow-hidden dark:border-strokedark">
                  <div
                    className={`flex justify-between items-center p-4 cursor-pointer ${
                      isExpanded ? 'bg-gray-50 dark:bg-meta-4' : 'bg-white dark:bg-boxdark'
                    } hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors`}
                    onClick={() => toggleTripExpansion(tripId)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                        <FiTruck className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {tripInfo.origin} → {tripInfo.destination}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {tripInfo.date} • {tripInfo.vehicleType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentAssignment({ status: 'assigned', role: 'driver' });
                          setSelectedRouteId(trip.route_id);
                          setSelectedTripId(tripId);
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

                  {isExpanded && (
                    <div className="border-t border-stroke dark:border-strokedark bg-white dark:bg-boxdark">
                      {assignments.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Chưa có nhân viên nào được phân công cho chuyến này
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                            <thead className="bg-gray-50 dark:bg-meta-4">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Nhân viên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Vai trò
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Thời gian bắt đầu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Thời gian kết thúc
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Hành động
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-boxdark divide-y divide-stroke dark:divide-strokedark">
                              {assignments.map((assignment) => {
                                const user = getUserInfo(assignment.userid);
                                return (
                                  <tr
                                    key={assignment.id}
                                    className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                      <div>
                                        <div className="font-medium">{user.username}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {users.find((u) => u.id === assignment.userid)?.phoneNumber}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary">
                                        {assignment.role === 'driver' ? 'Tài xế' : 'Phụ xe'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {formatDateTime(assignment.assignedate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {formatDateTime(assignment.expectedendtime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      <StatusBadge status={assignment.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => {
                                          setCurrentAssignment(assignment);
                                          setSelectedRouteId(trips.find((t) => t.id === assignment.tripid)?.route_id || '');
                                          setSelectedTripId(assignment.tripid);
                                          setSelectedUserId(assignment.userid);
                                          setIsDialogOpen(true);
                                        }}
                                        className="text-primary hover:text-primary-dark mr-3"
                                      >
                                        <FiEdit className="inline mr-1" />
                                        Sửa
                                      </button>
                                      <button
                                        onClick={() => {
                                          setAssignmentToDelete(assignment.id);
                                          setIsDeleteModalOpen(true);
                                        }}
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

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentAssignment.id ? 'Chỉnh sửa điều phối' : 'Thêm điều phối mới'}
              </h3>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setCurrentAssignment({
                    status: 'assigned',
                    assignedate: '',
                    expectedendtime: '',
                    role: 'driver',
                  });
                  setSelectedRouteId('');
                  setSelectedTripId('');
                  setSelectedUserId('');
                  setErrorMessage(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tuyến đường</label>
                <div className="relative">
                  <FiTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      setSelectedTripId('');
                      setSelectedUserId('');
                    }}
                    className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  >
                    <option value="" disabled>Chọn tuyến đường</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {`${route.origin} → ${route.destination} (${route.distance}km)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRouteId && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Chuyến đi</label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => handleTripChange(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  >
                    <option value="">Chọn chuyến đi</option>
                    {filteredTrips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {formatDateTime(trip.trip_date)} - {trip.vehicle_type} ({trip.available_seats} chỗ trống)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedRouteId && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nhân viên</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  >
                    <option value="">Chọn nhân viên</option>
                    {filteredDrivers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.phoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  value={currentAssignment.assignedate ? formatToDateTimeLocal(currentAssignment.assignedate) : ''}
                  onChange={(e) =>
                    setCurrentAssignment((prev) => ({
                      ...prev,
                      assignedate: new Date(e.target.value).toISOString(),
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  value={currentAssignment.expectedendtime ? formatToDateTimeLocal(currentAssignment.expectedendtime) : ''}
                  onChange={(e) =>
                    setCurrentAssignment((prev) => ({
                      ...prev,
                      expectedendtime: new Date(e.target.value).toISOString(),
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò</label>
                <select
                  value={currentAssignment.role || ''}
                  onChange={(e) =>
                    setCurrentAssignment((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-white py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  required
                >
                  <option value="driver">Tài xế</option>
                  <option value="conductor">Phụ xe</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                <select
                  value={currentAssignment.status || ''}
                  onChange={(e) =>
                    setCurrentAssignment((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-white py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  required
                >
                  <option value="assigned">Đã phân công</option>
                  <option value="in-progress">Đang thực hiện</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setCurrentAssignment({
                      status: 'assigned',
                      assignedate: now.toISOString(),
                      expectedendtime: oneHourLater.toISOString(),
                      role: 'driver',
                    });
                    setSelectedRouteId('');
                    setSelectedTripId('');
                    setSelectedUserId('');
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
                  {currentAssignment.id ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} dark:bg-opacity-80 dark:text-white`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <FiCheckCircle className="mr-2" />
            ) : (
              <FiXCircle className="mr-2" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className="ml-4 text-lg focus:outline-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Xác nhận xóa</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-0.5">
                <FiTrash2 className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Bạn có chắc chắn muốn xóa điều phối này?
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Hành động này không thể hoàn tác.
                </p>
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
                onClick={handleDelete}
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

export default DispatchAssignmentsPage;