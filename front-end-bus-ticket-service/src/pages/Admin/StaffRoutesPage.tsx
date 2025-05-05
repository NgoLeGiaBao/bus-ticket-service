import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StaffRoute {
  id: string;
  staff_id: string;
  route_id: string;
  full_name: string;
  role: string;
}

// Dữ liệu mock nhân viên
const staffList = [
  { id: "st1", full_name: "Nguyễn Văn A", role: "driver" },
  { id: "st2", full_name: "Trần Thị B", role: "conductor" },
  { id: "st3", full_name: "Lê Văn C", role: "driver" },
  { id: "st4", full_name: "Phạm Thị D", role: "conductor" },
  { id: "st5", full_name: "Hoàng Văn E", role: "manager" }
];

// Dữ liệu mock tuyến đường
const routeList = [
  { id: "rt1", name: "Tuyến Hà Nội - Hải Phòng", distance: 120 },
  { id: "rt2", name: "Tuyến Hà Nội - Đà Nẵng", distance: 800 },
  { id: "rt3", name: "Tuyến Hồ Chí Minh - Cần Thơ", distance: 170 },
  { id: "rt4", name: "Tuyến Hải Phòng - Quảng Ninh", distance: 60 }
];

// Dữ liệu mock phân công ban đầu
const initialRoutes = [
  {
    id: "sr1",
    staff_id: "st1",
    route_id: "rt1",
    full_name: "Nguyễn Văn A",
    role: "driver"
  },
  {
    id: "sr2",
    staff_id: "st2",
    route_id: "rt2",
    full_name: "Trần Thị B",
    role: "conductor"
  },
  {
    id: "sr3",
    staff_id: "st3",
    route_id: "rt3",
    full_name: "Lê Văn C",
    role: "driver"
  },
  {
    id: "sr4",
    staff_id: "st4",
    route_id: "rt1",
    full_name: "Phạm Thị D",
    role: "conductor"
  }
];

const StaffRoutesPage = () => {
  const [routes, setRoutes] = useState<StaffRoute[]>(initialRoutes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Partial<StaffRoute>>({});
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentRoute(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentRoute.id) {
      // Cập nhật phân công
      setRoutes(routes.map(route => 
        route.id === currentRoute.id ? { ...route, ...currentRoute } as StaffRoute : route
      ));
    } else {
      // Thêm phân công mới
      const newRoute = {
        ...currentRoute,
        id: `sr${routes.length + 1}`,
        full_name: staffList.find(s => s.id === currentRoute.staff_id)?.full_name || ''
      } as StaffRoute;
      setRoutes([...routes, newRoute]);
    }
    
    setIsDialogOpen(false);
    setCurrentRoute({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phân công này?')) {
      setRoutes(routes.filter(route => route.id !== id));
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Quản lý phân công nhân viên
        </h4>
        <button
          onClick={() => {
            setCurrentRoute({});
            setIsDialogOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
        >
          Thêm phân công
        </button>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-2">Họ tên</div>
        <div className="col-span-1">Vai trò</div>
        <div className="col-span-2">Tuyến đường</div>
        <div className="col-span-1">Hành động</div>
      </div>

      {routes.map((route) => {
        const staff = staffList.find(s => s.id === route.staff_id);
        const routeInfo = routeList.find(r => r.id === route.route_id);
        
        return (
          <div
            key={route.id}
            className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          >
            <div className="col-span-2">{staff?.full_name || route.full_name}</div>
            <div className="col-span-1">{route.role}</div>
            <div className="col-span-2">{routeInfo?.name || route.route_id}</div>
            <div className="col-span-1 flex space-x-2">
              <button
                onClick={() => {
                  setCurrentRoute(route);
                  setIsDialogOpen(true);
                }}
                className="text-primary hover:text-opacity-80"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(route.id)}
                className="text-danger hover:text-opacity-80"
              >
                Xóa
              </button>
            </div>
          </div>
        );
      })}

      {/* Dialog thêm/sửa phân công */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {currentRoute.id ? 'Chỉnh sửa phân công' : 'Thêm phân công mới'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Nhân viên</label>
                  <select
                    name="staff_id"
                    value={currentRoute.staff_id || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Tuyến đường</label>
                  <select
                    name="route_id"
                    value={currentRoute.route_id || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="">Chọn tuyến đường</option>
                    {routeList.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Vai trò</label>
                  <select
                    name="role"
                    value={currentRoute.role || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="driver">Tài xế</option>
                    <option value="conductor">Phụ xe</option>
                    <option value="manager">Quản lý</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRoutesPage;