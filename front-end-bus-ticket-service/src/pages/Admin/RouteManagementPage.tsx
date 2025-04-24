import React, { useState, useEffect } from 'react';

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState('');
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id'>>({
    name: '',
    origin: '',
    destination: '',
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fake fetch
    setRoutes([
      { id: '1', name: 'Tuyến A', origin: 'Hà Nội', destination: 'Đà Nẵng' },
      { id: '2', name: 'Tuyến B', origin: 'TP.HCM', destination: 'Cần Thơ' },
    ]);
  }, []);

  const handleAddRoute = () => {
    const newId = String(Date.now());
    setRoutes([...routes, { id: newId, ...newRoute }]);
    setNewRoute({ name: '', origin: '', destination: '' });
    setShowModal(false);
  };

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Quản lý tuyến đường</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Thêm tuyến
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm kiếm tuyến..."
        className="w-full p-2 border border-gray-300 rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-4">
        {filteredRoutes.map((route) => (
          <div key={route.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold">{route.name}</h2>
            <p>
              {route.origin} → {route.destination}
            </p>
          </div>
        ))}
      </div>

      {/* Modal thêm tuyến */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Thêm tuyến mới</h2>

            <input
              type="text"
              placeholder="Tên tuyến"
              className="w-full mb-3 p-2 border rounded"
              value={newRoute.name}
              onChange={(e) =>
                setNewRoute({ ...newRoute, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Điểm đi"
              className="w-full mb-3 p-2 border rounded"
              value={newRoute.origin}
              onChange={(e) =>
                setNewRoute({ ...newRoute, origin: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Điểm đến"
              className="w-full mb-4 p-2 border rounded"
              value={newRoute.destination}
              onChange={(e) =>
                setNewRoute({ ...newRoute, destination: e.target.value })
              }
            />

            <button
              onClick={handleAddRoute}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Thêm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
