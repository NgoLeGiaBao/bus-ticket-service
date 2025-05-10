import { FiUsers, FiPlus, FiEdit, FiTrash2, FiTruck, FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';
import { assignVehicleForTrip, getAllActiveVehicles, getAllRoutes, getAllTrips } from '../../services/apiServices';
import { useEffect, useState } from 'react';
import { Route, Trip } from '../../interfaces/RouteAndTrip';
import { Vehicle } from '../../interfaces/Vehicles';

// interface Trip {
//   id: string;
//   trip_date: string;
//   available_seats: number;
//   route_id: string;
//   booked_seats: string[];
//   vehicle_type: string;
//   price: number;
//   status: string;
//   vehicle_id?: string;
//   licenseplate?: string;
//   routes: {
//     id: string;
//     price: number;
//     origin: string;
//     distance: number;
//     duration: number;
//     is_active: boolean;
//     destination: string;
//   };
// }

interface Notification {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

const VehicleDispatchPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tripToUnassign, setTripToUnassign] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTrips, setExpandedTrips] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<Notification>({ type: 'success', message: '', show: false });

  // Tự động ẩn thông báo sau 5 giây
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
    fetchTrips();
  }, []);

  const fetchVehicles = async () => {
    const res = await getAllActiveVehicles();
    
    if (res.success && Array.isArray(res.data)) {
      setVehicles(res.data);
    }
  };

  const fetchRoutes = async () => {
    const res = await getAllRoutes();
    if (res.success && Array.isArray(res.data)) {
      setRoutes(res.data);
    }
  };

  const fetchTrips = async () => {
    const res = await getAllTrips();
    if (res.success && Array.isArray(res.data)) {
      setTrips(res.data);
    }
  };

  const filteredTrips = selectedRouteId
    ? trips.filter((trip) => trip.route_id === selectedRouteId)
    : [];

  const filteredVehicles = vehicles.filter((vehicle) => vehicle.status === 'Active');

  const filteredTripAssignments = trips
    .filter((trip) => {
      const tripDate = new Date(trip.trip_date).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).split('T')[0];
      const hasVehicle = !!trip.vehicle_id;

      return (
        (!routeFilter || trip.route_id === routeFilter) &&
        (!dateFilter || tripDate === dateFilter) &&
        (statusFilter === 'all' ||
          (statusFilter === 'assigned' && hasVehicle) ||
          (statusFilter === 'unassigned' && !hasVehicle))
      );
    })
    .map((trip) => ({
      tripId: trip.id,
      trip,
    }));

  const toggleTripExpansion = (tripId: string) => {
    setExpandedTrips((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
  };

  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicleId || !selectedTripId) {
      setNotification({
        type: 'error',
        message: 'Vui lòng chọn xe và chuyến đi',
        show: true,
      });
      return;
    }

    const currentTrip = trips.find((t) => t.id === selectedTripId);
    if (!currentTrip || currentTrip.status === 'cancelled') {
      setNotification({
        type: 'error',
        message: 'Chuyến đi không hợp lệ hoặc đã bị hủy',
        show: true,
      });
      return;
    }

    // Kiểm tra trùng phân công xe cho chuyến đi
    if (currentTrip.vehicle_id && currentTrip.vehicle_id === selectedVehicleId) {
      setNotification({
        type: 'error',
        message: 'Xe này đã được phân công cho chuyến đi này',
        show: true,
      });
      return;
    }

    // Kiểm tra xung đột thời gian
    const vehicleTrips = trips.filter((t) => t.vehicle_id === selectedVehicleId && t.status !== 'cancelled');
    const startTimeCurrent = new Date(currentTrip.trip_date).getTime();
    const currentRoute = routes.find((r) => r.id === currentTrip.route_id);
    const endTimeCurrent = currentRoute
      ? startTimeCurrent + (currentRoute.duration + 1) * 60 * 60 * 1000
      : startTimeCurrent + 60 * 60 * 1000;

    for (const trip of vehicleTrips) {
      if (trip.id === selectedTripId) continue;

      const previousRoute = routes.find((r) => r.id === trip.route_id);
      if (!previousRoute) continue;

      const startTimePrevious = new Date(trip.trip_date).getTime();
      const endTimePrevious = startTimePrevious + (previousRoute.duration + 1) * 60 * 60 * 1000;

      if (
        (startTimeCurrent >= startTimePrevious && startTimeCurrent <= endTimePrevious) ||
        (endTimeCurrent >= startTimePrevious && endTimeCurrent <= endTimePrevious) ||
        (startTimeCurrent <= startTimePrevious && endTimeCurrent >= endTimePrevious)
      ) {
        setNotification({
          type: 'error',
          message: `Không thể phân công: Xe này đã được phân công cho chuyến đi khác vào thời điểm ${formatDateTime(trip.trip_date)}`,
          show: true,
        });
        return;
      }
    }

    // Cập nhật chuyến đi với vehicle_id và licenseplate
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    console.log(vehicle);
    const res = await assignVehicleForTrip(selectedTripId, vehicle?.id,  vehicle?.licenseplate);

    if (res.success) {
        setNotification({
        type: 'success',
        message: 'Phân công xe thành công',
        show: true,
      });
      setTimeout(() => {
        fetchTrips();
      }, 1000);

    } else {
      setNotification({
        type: 'error',
        message: 'Lỗi khi cập nhật chuyến đi',
        show: true,
      });
      return;
    }

    setIsDialogOpen(false);
    setSelectedRouteId('');
    setSelectedTripId('');
    setSelectedVehicleId('');
  };

  const handleUnassign = async () => {
    if (!tripToUnassign) return;
    const res = await assignVehicleForTrip(tripToUnassign, null, null); 
    if (res.success) {
      setIsDeleteModalOpen(false);
      setTripToUnassign(null);
      setNotification({
        type: 'success',
        message: 'Hủy phân công xe thành công',
        show: true,
      });
      setTimeout(() => {
        fetchTrips();
      }, 1000);
    }
  };

  const handleCancelAssignment = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip || !trip.vehicle_id) return;

    const res = await assignVehicleForTrip(tripId, null, null); 
    if (res.success) {
      setIsDeleteModalOpen(false);
      setTripToUnassign(null);
      setNotification({
        type: 'success',
        message: 'Hủy phân công xe thành công',
        show: true,
      });
      setTimeout(() => {
        fetchTrips();
      }, 1000);
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

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find((v) => v.id === vehicleId) || { licenseplate: '', vehiclelabel: '', vehicletype: '', capacity: 0 };
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

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center border-b border-stroke dark:border-strokedark">
        <div className="flex items-center space-x-3">
          <h4 className="text-xl font-semibold text-black dark:text-white">Điều phối xe</h4>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="mr-2" />
          Thêm phân công xe
        </button>
      </div>

      {notification.show && (
        <div className={`p-4 mx-4 mt-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 text-lg focus:outline-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="px-4 md:px-6 2xl:px-7.5 pb-4 pt-4 space-y-4 bg-gray-50 dark:bg-meta-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
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
          <div className="w-full">
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
          <div className="w-full">
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
            <p className="mt-1 text-sm">Thử thay đổi tiêu chí lọc hoặc thêm phân công mới</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTripAssignments.map(({ tripId, trip }) => {
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
                          setSelectedRouteId(trip.route_id);
                          setSelectedTripId(tripId);
                          setIsDialogOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary bg-opacity-10 hover:bg-opacity-20 focus:outline-none transition-colors"
                      >
                        <FiPlus className="mr-1" />
                        Phân công xe
                      </button>
                      {trip.vehicle_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelAssignment(tripId);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none transition-colors"
                        >
                          <FiTrash2 className="mr-1" />
                          Hủy phân công
                        </button>
                      )}
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-stroke dark:border-strokedark bg-white dark:bg-boxdark">
                      {!trip.vehicle_id ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Chưa có xe nào được phân công cho chuyến này
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                            <thead className="bg-gray-50 dark:bg-meta-4">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Xe
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Biển số
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
                              <tr className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  <div>
                                    <div className="font-medium">{getVehicleInfo(trip.vehicle_id).vehiclelabel}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {getVehicleInfo(trip.vehicle_id).vehicletype} ({getVehicleInfo(trip.vehicle_id).capacity} chỗ)
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {trip.license_plate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  <StatusBadge status="assigned" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => {
                                      setSelectedRouteId(trip.route_id);
                                      setSelectedTripId(trip.id);
                                      setSelectedVehicleId(trip.vehicle_id!);
                                      setIsDialogOpen(true);
                                    }}
                                    className="text-primary hover:text-primary-dark mr-3"
                                  >
                                    <FiEdit className="inline mr-1" />
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTripToUnassign(trip.id);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FiTrash2 className="inline mr-1" />
                                    Xóa
                                  </button>
                                </td>
                              </tr>
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
                {selectedVehicleId ? 'Sửa phân công xe' : 'Thêm phân công xe'}
              </h3>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedRouteId('');
                  setSelectedTripId('');
                  setSelectedVehicleId('');
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
                      setSelectedVehicleId('');
                    }}
                    disabled={!!selectedVehicleId}
                    className={`w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${selectedVehicleId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Xe</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  >
                    <option value="">Chọn xe</option>
                    {filteredVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehiclelabel} ({vehicle.licenseplate}) - {vehicle.vehicletype}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedRouteId('');
                    setSelectedTripId('');
                    setSelectedVehicleId('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {selectedVehicleId ? 'Cập nhật phân công' : 'Phân công xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Xác nhận hủy phân công</h3>
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
                  Bạn có chắc chắn muốn hủy phân công xe này?
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
                onClick={handleUnassign}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDispatchPage;