import React, { useState, useEffect } from 'react';
import { createRoute, getAllRoutes, toggleRouteStatus, updateRoute } from '../../services/apiServices';
import { Route, RouteFormData } from '../../interfaces/RouteAndTrip';

// interface Route {
//   id: string;
//   origin: string;
//   destination: string;
//   distance: number;
//   duration: number;
//   price: number;
//   isActive: boolean;
// }

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState('');
  const [newRoute, setNewRoute] = useState<RouteFormData>({
    origin: '',
    destination: '',
    distance: 0,
    duration: "0",
    price: 0,
    is_active: true,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    handleGetRoute();
  }, []);

  const handleGetRoute = async() => {
    const res = await getAllRoutes();
    setRoutes(res.data);
  };

  const handleEdit = (route: Route) => {
    setNewRoute({
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      duration: route.duration.toString(),
      price: route.price,
      is_active: route.is_active,
    });
    setEditingId(route.id);
    setShowModal(true);
  };

  const handleAddOrUpdateRoute = async () => {
    try {
      if (editingId) {
        await updateRoute(editingId, newRoute);
      } else {
        await createRoute(newRoute);
      }
      await handleGetRoute(); 
      setEditingId(null);
      setShowModal(false);
      setNewRoute({
        origin: '',
        destination: '',
        distance: 0,
        duration: "0",
        price: 0,
        is_active: true,
      });
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra!');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await toggleRouteStatus(id, !routes.find(route => route.id === id)?.is_active);
      await handleGetRoute();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái tuyến!');
    }
  };

  const filteredRoutes = routes.filter((route) =>
    route.origin.toLowerCase().includes(search.toLowerCase()) ||
    route.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyến đường</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm tuyến..."
            className="w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Thêm tuyến
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Điểm đi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Điểm đến</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Khoảng cách (km)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Thời gian (giờ)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Giá (VND)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoutes.map((route) => (
              <tr key={route.id} className="hover:bg-gray-50 text-center">
                <td className="px-6 py-4 whitespace-nowrap">{route.origin}</td>
                <td className="px-6 py-4 whitespace-nowrap">{route.destination}</td>
                <td className="px-6 py-4 whitespace-nowrap">{route.distance}</td>
                <td className="px-6 py-4 whitespace-nowrap">{route.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap">{route.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      route.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {route.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(route)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => toggleStatus(route.id)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    {route.is_active ? 'Tắt' : 'Bật'}
                  </button>
                  {/* <button
                    onClick={() => handleDelete(route.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button> */}
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
                {editingId ? 'Cập nhật tuyến' : 'Thêm tuyến mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setNewRoute({
                    origin: '',
                    destination: '',
                    distance: 0,
                    duration: "0",
                    price: 0,
                    is_active: true,
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đi
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRoute.origin}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, origin: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đến
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRoute.destination}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, destination: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khoảng cách (km)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newRoute.distance}
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, distance: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian (giờ)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newRoute.duration}
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, duration: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRoute.price}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, price: Number(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={newRoute.is_active}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, is_active: e.target.checked })
                  }
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Kích hoạt tuyến
                </label>
              </div>

              <button
                onClick={handleAddOrUpdateRoute}
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

export default RouteManagement;