import React, { useState, useEffect } from 'react';
import { createTrip, getAllRoutes } from '../../services/apiServices';
import { RouteFormData } from '../../interfaces/RouteAndTrip';
import { TripFormData } from './../../interfaces/RouteAndTrip';

interface Trip {
  id: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  driver: string;
  vehicle: string;
  availableSeats: number;
  price: number;
  status: 'active' | 'inactive' | 'completed';
}

const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState('');
  const [routes, setRoutes] = useState<RouteFormData[]>([]);
  const [newTrip, setNewTrip] = useState<Omit<Trip, 'id'>>({
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    driver: '',
    vehicle: '',
    availableSeats: 0,
    price: 0,
    status: 'active',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    setTrips([
      {
        id: '1',
        routeId: 'HCM-HN',
        departureTime: '2023-05-15T08:00',
        arrivalTime: '2023-05-15T15:00',
        driver: 'Nguyễn Văn A',
        vehicle: 'Limousine',
        availableSeats: 15,
        price: 200000,
        status: 'active',
      },
      {
        id: '2',
        routeId: 'HN-LC',
        departureTime: '2023-05-16T07:00',
        arrivalTime: '2023-05-16T10:00',
        driver: 'Trần Thị B',
        vehicle: 'Ford Transit',
        availableSeats: 8,
        price: 100000,
        status: 'active',
      },
      {
        id: '3',
        routeId: 'HN-HCM',
        departureTime: '2023-05-14T20:00',
        arrivalTime: '2023-05-15T10:00',
        driver: 'Lê Văn C',
        vehicle: 'Giường nằm',
        availableSeats: 0,
        price: 750000,
        status: 'completed',
      },
    ]);
    
    hanldeGetRoutes();
  
  }, []);
  const hanldeGetRoutes = async () => {
    const res = await getAllRoutes();
    setRoutes(res.data);
    console.log(routes);
  };
  // const handleAddTrip = () => {
  //   if (editingId) {
  //     setTrips(
  //       trips.map((trip) =>
  //         trip.id === editingId ? { id: editingId, ...newTrip } : trip
  //       )
  //     );
  //     setEditingId(null);
  //   } else {
  //     const newId = crypto.randomUUID();
  //     setTrips([...trips, { id: newId, ...newTrip }]);
  //   }
  //   setNewTrip({
  //     routeId: '',
  //     departureTime: '',
  //     arrivalTime: '',
  //     driver: '',
  //     vehicle: '',
  //     availableSeats: 0,
  //     price: 0,
  //     status: 'active',
  //   });
  //   setShowModal(false);
  // };
  const handleAddOrUpdateTrip = () => {
    if (editingId) {
      // setTrips(
      //   trips.map((trip) =>
      //     trip.id === editingId ? { id: editingId, ...newTrip } : trip
      //   )
      // );
      // setEditingId(null);
    } else {
      const tripFormData : TripFormData = {
        tripDate: newTrip.departureTime, 
        availableSeats: newTrip.vehicle === 'limousine' ? 34 : 36,  
        routeId: newTrip.routeId, 
        vehicle_type: newTrip.vehicle,  
        price: newTrip.price
      };
      createTrip(tripFormData);
      setNewTrip({
        routeId: '',
        departureTime: '',
        arrivalTime: '',
        driver: '',
        vehicle: '',
        availableSeats: 0,
        price: 0,
        status: 'active',
      });
    }
    setShowModal(false);
  };
  const handleEdit = (trip: Trip) => {
    setNewTrip({
      routeId: trip.routeId,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      driver: trip.driver,
      vehicle: trip.vehicle,
      availableSeats: trip.availableSeats,
      price: trip.price,
      status: trip.status,
    });
    setEditingId(trip.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  const toggleStatus = (id: string) => {
    setTrips(
      trips.map((trip) =>
        trip.id === id
          ? {
              ...trip,
              status: trip.status === 'active' ? 'inactive' : 'active',
            }
          : trip
      )
    );
  };

  const filteredTrips = trips.filter(
    (trip) =>
      trip.routeId.toLowerCase().includes(search.toLowerCase()) ||
      trip.driver.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  const handleVehicleChange = (value: string, tripId: number) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === tripId ? { ...trip, vehicle: value } : trip
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Ngừng hoạt động';
      case 'completed':
        return 'Đã hoàn thành';
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

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã tuyến</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ đi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ đến</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghế trống</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá (VND)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{trip.vehicle}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(trip.departureTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(trip.arrivalTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.driver}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={trip.vehicle}
                    onChange={(e) => handleVehicleChange(e.target.value, trip.id)}
                    className="border px-2 py-1 rounded"
                  >
                    {[
                      { value: 'limousine', label: 'Limousine' },
                      { value: 'sleeper', label: 'Giường nằm' },
                    ].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>               */}
                <td className="px-6 py-4 whitespace-nowrap">{trip.vehicle}</td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.availableSeats}</td>
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
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => toggleStatus(trip.id)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    {trip.status === 'active' ? 'Tắt' : 'Bật'}
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
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
                    routeId: '',
                    departureTime: '',
                    arrivalTime: '',
                    driver: '',
                    vehicle: '',
                    availableSeats: 0,
                    price: 0,
                    status: 'active',
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
                  value={newTrip.routeId}
                  onChange={(e) => setNewTrip({ ...newTrip, routeId: e.target.value })}
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

              {/* <div className="grid grid-cols-2 gap-4"> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ đi
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.departureTime}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, departureTime: e.target.value })
                    }
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ đến
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.arrivalTime}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, arrivalTime: e.target.value })
                    }
                  />
                </div> */}
              {/* </div> */}

              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tài xế
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.driver}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, driver: e.target.value })
                    }
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại xe
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.vehicle}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, vehicle: e.target.value as 'limousine' | 'sleeper' })
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

              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số ghế trống
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.availableSeats}
                    onChange={(e) =>
                      setNewTrip({
                        ...newTrip,
                        availableSeats: Number(e.target.value),
                      })
                    }
                  />
                </div> */}

                {/* <div>
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
                </div> */}
              </div>
{/* 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={newTrip.status}
                  onChange={(e) => setNewTrip({ ...newTrip, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn trạng thái chuyến xe --</option>
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="ongoing">Đang chạy</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div> */}

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
    </div>
  );
};

export default TripManagement;