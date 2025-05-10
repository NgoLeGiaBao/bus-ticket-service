import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import { createTrip, getAllRoutes, getAllTrips, updateTripStatus } from '../../services/apiServices';
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
    trip_date: '',
    available_seats: 0,
    route_id: '',
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
    if (!newTrip.route_id) newErrors.route_id = 'Vui lòng chọn tuyến đường';
    if (!newTrip.trip_date) newErrors.trip_date = 'Vui lòng chọn thời gian đi';
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
        tripDate: newTrip.trip_date,
        availableSeats: newTrip.vehicle_type === 'limousine' ? 34 : 36, // Configurable in a real app
        routeId: newTrip.route_id,
        vehicle_type: newTrip.vehicle_type,
        price: newTrip.price,
      };

      await createTrip(tripData);
      setModalMessage({ text: 'Thêm chuyến đi thành công', type: 'success' });
      await fetchTrips();
      setTimeout(resetForm, 1500); // Show success message before closing
    } catch (error) {
      setModalMessage({ text: 'Đã xảy ra lỗi khi thêm chuyến đi', type: 'error' });
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateTripStatus(statusUpdateModal.tripId, statusUpdateModal.newStatus);
      await fetchTrips();
      // setModalMessage({
      //   text: `Cập nhật trạng thái chuyến đi thành công`,
      //   type: 'success',
      // });
      setStatusUpdateModal({ show: false, tripId: '', currentStatus: '', newStatus: 'ongoing' });
      // setShowModal(true);
      setShowModal(false);

    } catch (error) {
      setModalMessage({ text: 'Không thể cập nhật trạng thái chuyến đi', type: 'error' });
      setShowModal(true);
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

  const resetForm = () => {
    setShowModal(false);
    setNewTrip({
      trip_date: '',
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

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stroke py-6 px-4 md:px-6 xl:px-7.5 dark:border-strokedark">
        <div className="flex items-center space-x-3">
          {/* <FiMapPin className="text-2xl text-primary" /> */}
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
                      {trip.available_seats}
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
                      <div className="flex justify-center">
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
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
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
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
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
    </div>
  );
};

export default TripManagement;