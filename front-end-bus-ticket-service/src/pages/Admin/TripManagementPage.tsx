import React, { useState, useEffect } from 'react';
import { createTrip, getAllRoutes, getAllTrips, updateTripStatus} from '../../services/apiServices';
import { RouteFormData } from '../../interfaces/RouteAndTrip';
import { TripFormData } from './../../interfaces/RouteAndTrip';

interface Trip {
  id: string;
  trip_date: string;
  available_seats: number;
  route_id: string;
  vehicle_type: string;
  price: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  routes: {
    id: string;
    origin: string;
    destination: string;
    distance: number;
    duration: number;
    price: number;
    is_active: boolean;
  };
}

const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState('');
  const [routes, setRoutes] = useState<RouteFormData[]>([]);
  const [filters, setFilters] = useState({
    route: '',
    status: '',
    vehicle: ''
  });
  const [newTrip, setNewTrip] = useState<Omit<TripFormData, 'id'>>({
    trip_date: '',
    available_seats: 0,
    route_id: '',
    vehicle_type: '',
    price: 0
  });
  const [selectedStatus, setSelectedStatus] = useState('ongoing');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    show: false,
    tripId: '',
    currentStatus: ''
  });

  useEffect(() => {
    handleGetTrips();
    handleGetRoutes();
  }, []);


  // Handle get all trips
  const handleGetTrips = async () => {
    const res = await getAllTrips();
    setTrips(res.data);
  }
  const handleGetRoutes = async () => {
    const res = await getAllRoutes();
    setRoutes(res.data);
  };

  const handleAddOrUpdateTrip = () => {
    const tripFormData: TripFormData = {
      tripDate: newTrip.trip_date,
      availableSeats: newTrip.vehicle_type === 'limousine' ? 34 : 36,
      routeId: newTrip.route_id,
      vehicle_type: newTrip.vehicle_type,
      price: newTrip.price
    };
    
    createTrip(tripFormData).then(() => {
      setShowModal(false);
      setNewTrip({
        trip_date: '',
        available_seats: 0,
        route_id: '',
        vehicle_type: '',
        price: 0
      });
      handleGetTrips();
    });
  };

  const handleEdit = (trip: Trip) => {
    setNewTrip({
      trip_date: trip.trip_date,
      available_seats: trip.available_seats,
      route_id: trip.route_id,
      vehicle_type: trip.vehicle_type,
      price: trip.price
    });
    setEditingId(trip.id);
    setShowModal(true);
  };

  const handleUpdateStatus = async (tripId: string, newStatus: string) => {
    try {
      await updateTripStatus(tripId, newStatus);
      setTrips(trips.map(trip => 
        trip.id === tripId ? { ...trip, status: newStatus as any } : trip
      ));
      setStatusUpdateModal({ show: false, tripId: '', currentStatus: '' });
    } catch (error) {
      console.error('Failed to update trip status:', error);
    }
  };

  const openStatusUpdateModal = (tripId: string, currentStatus: string) => {
    setStatusUpdateModal({
      show: true,
      tripId,
      currentStatus
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
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
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý chuyến đi</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm chuyến đi..."
            className="w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Thêm chuyến
          </button>
        </div>
      </div>

      {/* Filter section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo tuyến</label>
          <select
            name="route"
            value={filters.route}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả tuyến</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.origin} → {route.destination}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo trạng thái</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="ongoing">Đang chạy</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo loại xe</label>
          <select
            name="vehicle"
            value={filters.vehicle}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại xe</option>
            <option value="limousine">Limousine</option>
            <option value="standard">Giường nằm</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Tuyến đường</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Giờ đi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Loại xe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Ghế trống</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Giá (VND)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50 text-center">
                <td className="px-6 py-4 whitespace-nowrap">
                  {trip.routes.origin} → {trip.routes.destination}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(trip.trip_date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {trip.vehicle_type === 'limousine' ? 'Limousine' : 'Giường nằm'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.available_seats}</td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      trip.status
                    )}`}
                  >
                    {getStatusText(trip.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(trip)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    disabled={!['scheduled'].includes(trip.status)}

                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => openStatusUpdateModal(trip.id, trip.status)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                    disabled={!['scheduled', 'ongoing'].includes(trip.status)}
                    >
                    Cập nhật
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Cập nhật chuyến đi' : 'Thêm chuyến đi mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setNewTrip({
                    trip_date: '',
                    available_seats: 0,
                    route_id: '',
                    vehicle_type: '',
                    price: 0
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Tuyến đường
                </label>
                <select
                  value={newTrip.route_id}
                  onChange={(e) => setNewTrip({ ...newTrip, route_id: e.target.value })}
                  className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn tuyến --</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {`${route.origin.trim()} → ${route.destination.trim()} (${route.distance} km, ${route.price.toLocaleString()}đ)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ đi
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTrip.trip_date}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, trip_date: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại xe
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.vehicle_type}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, vehicle_type: e.target.value })
                    }
                  >
                    <option value="">-- Chọn loại xe --</option>
                    <option value="limousine">Limousine</option>
                    <option value="standard">Giường nằm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.price}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, price: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <button
                onClick={handleAddOrUpdateTrip}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
              >
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cập nhật trạng thái chuyến xe</h2>
              <button
                onClick={() => setStatusUpdateModal({ show: false, tripId: '', currentStatus: '' })}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái hiện tại
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {getStatusText(statusUpdateModal.currentStatus)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cập nhật trạng thái
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="ongoing"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ongoing">Đang chạy</option>
                  <option value="cancelled">Hủy chuyến</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              </div>

              <button
                onClick={() => handleUpdateStatus(statusUpdateModal.tripId, selectedStatus)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;