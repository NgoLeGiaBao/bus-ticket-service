import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import { createTrip, getAllRoutes, getAllTrips, updateTripStatus, mergeTrips, consolidateTrip } from '../../services/apiServices';
import { RouteFormData, Trip, TripFormData } from '../../interfaces/RouteAndTrip';

const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<RouteFormData[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    route: '',
    status: '',
    vehicle: '',
  });
  const [newTrip, setNewTrip] = useState<Omit<TripFormData, 'id'>>({
    tripDate: '',
    availableSeats: 0,
    routeId: '',
    vehicle_type: '',
    price: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    show: false,
    tripId: '',
    currentStatus: '',
    newStatus: 'ongoing' as 'ongoing' | 'completed' | 'cancelled',
  });
  const [mergeTripModal, setMergeTripModal] = useState({
    show: false,
    tripId1: '',
    tripId2: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    fetchTrips();
    fetchRoutes();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await getAllTrips();
      setTrips(res.data);
    } catch (error) {
      setModalMessage({ text: 'Không thể tải danh sách chuyến đi', type: 'error' });
      setShowModal(true);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await getAllRoutes();
      setRoutes(res.data);
    } catch (error) {
      setModalMessage({ text: 'Không thể tải danh sách tuyến đường', type: 'error' });
      setShowModal(true);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!newTrip.routeId) newErrors.route_id = 'Vui lòng chọn tuyến đường';
    if (!newTrip.tripDate) newErrors.trip_date = 'Vui lòng chọn thời gian đi';
    if (!newTrip.vehicle_type) newErrors.vehicle_type = 'Vui lòng chọn loại xe';
    if (newTrip.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTrip = async () => {
    if (!validateForm()) {
      setModalMessage({ text: 'Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu', type: 'error' });
      return;
    }

    try {
      const tripData: TripFormData = {
        id: '',
        tripDate: newTrip.tripDate,
        availableSeats: newTrip.vehicle_type === 'limousine' ? 34 : 36,
        routeId: newTrip.routeId,
        vehicle_type: newTrip.vehicle_type,
        price: newTrip.price,
      };

      await createTrip(tripData);
      setModalMessage({ text: 'Thêm chuyến đi thành công', type: 'success' });
      await fetchTrips();
      setTimeout(resetForm, 1500);
    } catch (error) {
      setModalMessage({ text: 'Đã xảy ra lỗi khi thêm chuyến đi', type: 'error' });
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateTripStatus(statusUpdateModal.tripId, statusUpdateModal.newStatus);
      await fetchTrips();
      setStatusUpdateModal({ show: false, tripId: '', currentStatus: '', newStatus: 'ongoing' });
      setShowModal(false);
    } catch (error) {
      setModalMessage({ text: 'Không thể cập nhật trạng thái chuyến đi', type: 'error' });
      setShowModal(true);
    }
  };

  const handleMergeTrips = async () => {
  // Kiểm tra điều kiện trước khi merge/dồn chuyến
  if (!mergeTripModal.tripId1 || !mergeTripModal.tripId2) {
    setModalMessage({ text: 'Vui lòng chọn hai chuyến đi để dồn', type: 'error' });
    return;
  }

  const trip1 = trips.find(t => t.id === mergeTripModal.tripId1);
  const trip2 = trips.find(t => t.id === mergeTripModal.tripId2);
  if (!trip1 || !trip2) {
    setModalMessage({ text: 'Không tìm thấy thông tin chuyến đi', type: 'error' });
    return;
  }

  // Kiểm tra trạng thái chuyến
  if (trip1.status !== 'scheduled' || trip2.status !== 'scheduled') {
    setModalMessage({ text: 'Chỉ có thể dồn các chuyến đang ở trạng thái "scheduled"', type: 'error' });
    return;
  }

  // Kiểm tra loại xe
  if (trip1.vehicle_type !== trip2.vehicle_type) {
    setModalMessage({ text: 'Chỉ có thể dồn các chuyến cùng loại xe', type: 'error' });
    return;
  }

  // Kiểm tra thời gian (cho phép chênh lệch tối đa 2 tiếng)
  const timeDiff = Math.abs(new Date(trip1.trip_date).getTime() - new Date(trip2.trip_date).getTime());
  if (timeDiff > 2 * 60 * 60 * 1000) {
    setModalMessage({ text: 'Chỉ có thể dồn các chuyến cách nhau tối đa 2 tiếng', type: 'error' });
    return;
  }

  // Kiểm tra quan hệ route (CHA-CON hoặc CÙNG TUYẾN)
  const isTrip1Parent = findParentRoutes(trip2.route_id).includes(trip1.route_id);
  const isTrip2Parent = findParentRoutes(trip1.route_id).includes(trip2.route_id);
  const isSameRoute = trip1.route_id === trip2.route_id;

  if (!(isTrip1Parent || isTrip2Parent || isSameRoute)) {
    setModalMessage({
      text: 'Không thể dồn chuyến: Chỉ có thể dồn chuyến con vào chuyến cha hoặc chuyến cùng tuyến',
      type: 'error'
    });
    return;
  }

  // Kiểm tra số ghế (cho phép merge nếu 1 trong 2 chuyến chưa có ai đặt)
  const bookedSeats1 = trip1.booked_seats?.length || 0;
  const bookedSeats2 = trip2.booked_seats?.length || 0;
  const totalBookedSeats = bookedSeats1 + bookedSeats2;
  const vehicleCapacity = trip1.vehicle_type === 'limousine' ? 34 : 36;

  if (totalBookedSeats > vehicleCapacity && bookedSeats1 > 0 && bookedSeats2 > 0) {
    setModalMessage({
      text: `Không thể dồn chuyến: Tổng số ghế đã đặt (${totalBookedSeats}) vượt quá sức chứa xe (${vehicleCapacity})`,
      type: 'error'
    });
    return;
  }

  try {
    const res = await consolidateTrip(trip1.id, trip2.id);
    if (res.success) {
      setModalMessage({ text: 'Dồn chuyến đi thành công', type: 'success' });
      setMergeTripModal({ show: false, tripId1: '', tripId2: '' });
      setTimeout(() => setModalMessage(null), 1500);
      fetchTrips();
      
    }

  } catch (error) {
    setModalMessage({ text: 'Không thể dồn chuyến đi', type: 'error' });
  }
};

  const openStatusUpdateModal = (tripId: string, currentStatus: string) => {
    setStatusUpdateModal({
      show: true,
      tripId,
      currentStatus,
      newStatus: 'ongoing',
    });
  };

  const openMergeTripModal = (tripId: string) => {
    setMergeTripModal({
      show: true,
      tripId1: tripId,
      tripId2: '',
    });
  };

  const resetForm = () => {
    setShowModal(false);
    setNewTrip({
      tripDate: '',
      available_seats: 0,
      route_id: '',
      vehicle_type: '',
      price: 0,
    });
    setErrors({});
    setModalMessage(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.routes.origin.toLowerCase().includes(search.toLowerCase()) ||
      trip.routes.destination.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicle_type.toLowerCase().includes(search.toLowerCase());
    const matchesRoute = filters.route ? trip.route_id === filters.route : true;
    const matchesStatus = filters.status ? trip.status === filters.status : true;
    const matchesVehicle = filters.vehicle ? trip.vehicle_type === filters.vehicle : true;

    return matchesSearch && matchesRoute && matchesStatus && matchesVehicle;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'ongoing':
        return 'Đang chạy';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  // Helper function to calculate available seats
  const calculateAvailableSeats = (trip: Trip): number => {
    const vehicleCapacity = trip.vehicle_type === 'limousine' ? 34 : 36;
    const bookedSeats = trip.booked_seats?.length || 0;
    return vehicleCapacity - bookedSeats;
  };

  // Helper function to find parent routes
  const findParentRoutes = (routeId: string): string[] => {
    const parentRoutes: string[] = [];
    for (const route of routes) {
      if (route.subroutes.some((sub) => sub.relatedrouteid === routeId && sub.isactive)) {
        parentRoutes.push(route.id);
      }
    }
    return parentRoutes;
  };

  // Helper function to find direct related routes (parent, child, or direct siblings only)
  const findRelatedRoutes = (routeId: string): string[] => {
    const relatedRoutes = new Set<string>([routeId]);

    // Add direct parent routes
    const parentRoutes = findParentRoutes(routeId);
    parentRoutes.forEach((parentId) => relatedRoutes.add(parentId));

    // Add direct sibling routes (only those sharing the same parent)
    for (const route of routes) {
      if (route.subroutes.some((sub) => sub.relatedrouteid === routeId && sub.isactive)) {
        route.subroutes
          .filter((sub) => sub.isactive && sub.relatedrouteid !== routeId)
          .forEach((sub) => relatedRoutes.add(sub.relatedrouteid));
      }
    }

    // Add direct child routes
    const currentRoute = routes.find((r) => r.id === routeId);
    if (currentRoute && currentRoute.subroutes) {
      currentRoute.subroutes
        .filter((sub) => sub.isactive)
        .forEach((sub) => relatedRoutes.add(sub.relatedrouteid));
    }

    return Array.from(relatedRoutes);
  };

  // Check if two routes are directly mergeable (direct parent-child or siblings)
  const areRoutesMergeable = (routeId1: string, routeId2: string): boolean => {
    if (routeId1 === routeId2) return false; // Same route, not mergeable

    // Check if one is a direct parent of the other
    const parentOf1 = findParentRoutes(routeId1);
    const parentOf2 = findParentRoutes(routeId2);
    if (parentOf1.includes(routeId2) || parentOf2.includes(routeId1)) {
      return true;
    }

    // Check if they are direct siblings (share the same parent)
    const sharedParents = parentOf1.filter(parent => parentOf2.includes(parent));
    return sharedParents.length > 0;
  };

  // Filter mergeable trips
  const mergeableTrips = (tripId: string) => {
    const selectedTrip = trips.find((t) => t.id === tripId);
    if (!selectedTrip) return []; // Bỏ điều kiện booked_seats

    const vehicleCapacity = selectedTrip.vehicle_type === 'limousine' ? 34 : 36;
    const bookedSeatsSelected = selectedTrip.booked_seats?.length || 0;

    return trips.filter((t) => {
      if (
        t.id === tripId || 
        t.status !== 'scheduled' ||
        selectedTrip.status !== 'scheduled' ||
        t.vehicle_type !== selectedTrip.vehicle_type
      ) {
        return false;
      }

      // Kiểm tra thời gian (cách nhau ≤ 2 tiếng)
      const timeDiff = Math.abs(
        new Date(t.trip_date).getTime() - new Date(selectedTrip.trip_date).getTime()
      );
      if (timeDiff > 2 * 60 * 60 * 1000) return false;

      // Tính tổng ghế đã đặt (nếu có)
      const bookedSeatsOther = t.booked_seats?.length || 0;
      const totalBookedSeats = bookedSeatsSelected + bookedSeatsOther;

      // Điều kiện merge:
      const isOtherParentOfSelected = findParentRoutes(selectedTrip.route_id).includes(t.route_id);
      const isSameRoute = selectedTrip.route_id === t.route_id;

      return (
        (isOtherParentOfSelected || isSameRoute) &&
        (totalBookedSeats <= vehicleCapacity || bookedSeatsOther === 0) // Cho phép merge nếu chuyến kia chưa có ai đặt
      );
    });
  };

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stroke py-6 px-4 md:px-6 xl:px-7.5 dark:border-strokedark">
        <div className="flex items-center space-x-3">
          <h4 className="text-xl font-semibold text-black dark:text-white">Quản lý chuyến đi</h4>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="mr-2" />
          Thêm chuyến đi
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 xl:px-7.5 pb-4 pt-4 space-y-4 bg-gray-50 dark:bg-meta-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tìm kiếm chuyến đi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nhập điểm đi, điểm đến hoặc loại xe..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lọc theo tuyến
            </label>
            <select
              name="route"
              value={filters.route}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">Tất cả tuyến</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.origin} → {route.destination}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lọc theo trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="ongoing">Đang chạy</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lọc theo loại xe
            </label>
            <select
              name="vehicle"
              value={filters.vehicle}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">Tất cả loại xe</option>
              <option value="limousine">Limousine</option>
              <option value="standard">Giường nằm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="p-4 md:p-6 xl:p-7.5">
        {filteredTrips.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <FiMapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">Không tìm thấy chuyến đi nào</h3>
            <p className="mt-1 text-sm">Thử thay đổi tiêu chí tìm kiếm hoặc thêm chuyến đi mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="bg-gray-50 dark:bg-meta-4">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Tuyến đường
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Giờ đi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Loại xe
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Ghế đã đặt
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Ghế trống
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Giá (VND)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke bg-white dark:bg-boxdark dark:divide-strokedark">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                      {trip.routes.origin} → {trip.routes.destination}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {new Date(trip.trip_date).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {trip.vehicle_type === 'limousine' ? 'Limousine' : 'Giường nằm'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {trip.booked_seats?.length || 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {calculateAvailableSeats(trip)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {trip.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {getStatusText(trip.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openStatusUpdateModal(trip.id, trip.status)}
                          className={`flex items-center text-amber-600 hover:text-amber-900 ${
                            !['scheduled', 'ongoing'].includes(trip.status)
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          disabled={!['scheduled', 'ongoing'].includes(trip.status)}
                        >
                          Cập nhật
                        </button>
<button
  onClick={() => openMergeTripModal(trip.id)}
  className={`flex items-center text-blue-600 hover:text-blue-900 ${
    trip.status !== 'scheduled' || trip.booked_seats?.length === 0 
      ? 'opacity-50 cursor-not-allowed' 
      : ''
  }`}
  disabled={trip.status !== 'scheduled' || trip.booked_seats?.length === 0}
>
  Dồn chuyến
</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Thêm chuyến đi mới</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {modalMessage && (
              <div
                className={`mb-4 rounded p-3 text-sm ${
                  modalMessage.type === 'error'
                    ? 'bg-red-50 text-red-600 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300'
                    : 'bg-green-50 text-green-600 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300'
                }`}
              >
                {modalMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tuyến đường <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTrip.route_id}
                  onChange={(e) => setNewTrip({ ...newTrip, route_id: e.target.value })}
                  className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                    errors.route_id ? 'border-red-500' : 'border-stroke'
                  }`}
                >
                  <option value="">Chọn tuyến đường</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {`${route.origin} → ${route.destination} (${route.distance} km)`}
                    </option>
                  ))}
                </select>
                {errors.route_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.route_id}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Giờ đi <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                    errors.trip_date ? 'border-red-500' : 'border-stroke'
                  }`}
                  value={newTrip.trip_date}
                  onChange={(e) => setNewTrip({ ...newTrip, trip_date: e.target.value })}
                />
                {errors.trip_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.trip_date}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại xe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTrip.vehicle_type}
                    onChange={(e) => setNewTrip({ ...newTrip, vehicle_type: e.target.value })}
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.vehicle_type ? 'border-red-500' : 'border-stroke'
                    }`}
                  >
                    <option value="">Chọn loại xe</option>
                    <option value="limousine">Limousine</option>
                    <option value="standard">Giường nằm</option>
                  </select>
                  {errors.vehicle_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Giá (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.price ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newTrip.price}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, price: Number(e.target.value) })
                    }
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddTrip}
                  type="button"
                  className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Thêm chuyến đi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Cập nhật trạng thái chuyến đi
              </h3>
              <button
                onClick={() =>
                  setStatusUpdateModal({ show: false, tripId: '', currentStatus: '', newStatus: 'ongoing' })
                }
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái hiện tại
                </label>
                <div className="rounded bg-gray-100 p-2 text-sm text-gray-700 dark:bg-meta-4 dark:text-gray-300">
                  {getStatusText(statusUpdateModal.currentStatus)}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cập nhật trạng thái
                </label>
                <select
                  value={statusUpdateModal.newStatus}
                  onChange={(e) =>
                    setStatusUpdateModal({
                      ...statusUpdateModal,
                      newStatus: e.target.value as 'ongoing' | 'completed' | 'cancelled',
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value="ongoing">Đang chạy</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setStatusUpdateModal({
                      show: false,
                      tripId: '',
                      currentStatus: '',
                      newStatus: 'ongoing',
                    })
                  }
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  type="button"
                  className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merge Trip Modal */}
      {mergeTripModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dồn chuyến đi
              </h3>
              <button
                onClick={() => setMergeTripModal({ show: false, tripId1: '', tripId2: '' })}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {modalMessage && (
              <div
                className={`mb-4 rounded p-3 text-sm ${
                  modalMessage.type === 'error'
                    ? 'bg-red-50 text-red-600 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300'
                    : 'bg-green-50 text-green-600 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300'
                }`}
              >
                {modalMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chuyến đi 1
                </label>
                <div className="rounded bg-gray-100 p-2 text-sm text-gray-700 dark:bg-meta-4 dark:text-gray-300">
                  {trips.find(t => t.id === mergeTripModal.tripId1)?.routes.origin} → 
                  {trips.find(t => t.id === mergeTripModal.tripId1)?.routes.destination} 
                  ({new Date(trips.find(t => t.id === mergeTripModal.tripId1)?.trip_date || '').toLocaleString('vi-VN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}) 
                  - {trips.find(t => t.id === mergeTripModal.tripId1)?.booked_seats?.length || 0} ghế đã đặt
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chọn chuyến đi để dồn <span className="text-red-500">*</span>
                </label>
                <select
                  value={mergeTripModal.tripId2}
                  onChange={(e) => setMergeTripModal({ ...mergeTripModal, tripId2: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value="">Chọn chuyến đi</option>
                  {mergeableTrips(mergeTripModal.tripId1).map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.routes.origin} → {trip.routes.destination} ({new Date(trip.trip_date).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}) - {trip.booked_seats?.length || 0} ghế đã đặt
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setMergeTripModal({ show: false, tripId1: '', tripId2: '' })}
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  Hủy
                </button>
                <button
                  onClick={handleMergeTrips}
                  type="button"
                  className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Dồn chuyến
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;