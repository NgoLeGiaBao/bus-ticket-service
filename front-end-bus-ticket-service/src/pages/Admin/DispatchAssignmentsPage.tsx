import React, { useState } from 'react';

interface DispatchAssignment {
  id: string;
  staff_id: string;
  trip_id: string;
  route_id: string;
  assigned_at: string;
  expected_end_time: string;
  from_location: string;
  to_location: string;
  role: string;
  status: 'pending' | 'in-progress' | 'completed';
}

// Dữ liệu mock nhân viên
const staffList = [
  { id: "st1", full_name: "Nguyễn Văn A", role: "driver" },
  { id: "st2", full_name: "Trần Thị B", role: "conductor" },
  { id: "st3", full_name: "Lê Văn C", role: "driver" },
  { id: "st4", full_name: "Phạm Thị D", role: "conductor" }
];

// Dữ liệu mock chuyến đi
const tripList = [
  { id: "tr1", name: "Chuyến HP-001", route_id: "rt1", departure_time: "08:00" },
  { id: "tr2", name: "Chuyến DN-001", route_id: "rt2", departure_time: "10:00" },
  { id: "tr3", name: "Chuyến CT-001", route_id: "rt3", departure_time: "07:00" }
];

// Dữ liệu mock tuyến đường
const routeList = [
  { id: "rt1", name: "Tuyến Hà Nội - Hải Phòng", distance: 120 },
  { id: "rt2", name: "Tuyến Hà Nội - Đà Nẵng", distance: 800 },
  { id: "rt3", name: "Tuyến Hồ Chí Minh - Cần Thơ", distance: 170 }
];

// Dữ liệu mock điều phối ban đầu
const initialAssignments = [
  {
    id: "da1",
    staff_id: "st1",
    trip_id: "tr1",
    route_id: "rt1",
    assigned_at: "2023-06-15T08:00:00Z",
    expected_end_time: "2023-06-15T12:00:00Z",
    from_location: "Bến xe Mỹ Đình",
    to_location: "Bến xe Hải Phòng",
    role: "driver",
    status: "completed"
  },
  {
    id: "da2",
    staff_id: "st2",
    trip_id: "tr2",
    route_id: "rt2",
    assigned_at: "2023-06-16T10:00:00Z",
    expected_end_time: "2023-06-17T06:00:00Z",
    from_location: "Bến xe Giáp Bát",
    to_location: "Bến xe Đà Nẵng",
    role: "conductor",
    status: "in-progress"
  }
];

const DispatchAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<DispatchAssignment[]>(initialAssignments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<DispatchAssignment>>({
    status: 'pending',
    assigned_at: new Date().toISOString(),
    expected_end_time: new Date(Date.now() + 3600000).toISOString()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (field: string, value: string) => {
    setCurrentAssignment(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(currentAssignment.expected_end_time!) <= new Date(currentAssignment.assigned_at!)) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (currentAssignment.id) {
      // Cập nhật điều phối
      setAssignments(assignments.map(assignment => 
        assignment.id === currentAssignment.id ? { ...assignment, ...currentAssignment } as DispatchAssignment : assignment
      ));
    } else {
      // Thêm điều phối mới
      const newAssignment = {
        ...currentAssignment,
        id: `da${assignments.length + 1}`,
        status: currentAssignment.status || 'pending'
      } as DispatchAssignment;
      setAssignments([...assignments, newAssignment]);
    }
    
    setIsDialogOpen(false);
    setCurrentAssignment({
      status: 'pending',
      assigned_at: new Date().toISOString(),
      expected_end_time: new Date(Date.now() + 3600000).toISOString()
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa điều phối này?')) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      'in-progress': { text: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' }
    };

    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusMap[status as keyof typeof statusMap].color}`}>
        {statusMap[status as keyof typeof statusMap].text}
      </span>
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Quản lý điều phối
        </h4>
        <button
          onClick={() => {
            setCurrentAssignment({
              status: 'pending',
              assigned_at: new Date().toISOString(),
              expected_end_time: new Date(Date.now() + 3600000).toISOString()
            });
            setIsDialogOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
        >
          Thêm điều phối
        </button>
      </div>

      <div className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 2xl:px-7.5">
        <div className="col-span-2">Nhân viên</div>
        <div className="col-span-1">Từ</div>
        <div className="col-span-1">Đến</div>
        <div className="col-span-1">Bắt đầu</div>
        <div className="col-span-1">Kết thúc</div>
        <div className="col-span-1">Trạng thái</div>
        <div className="col-span-1">Hành động</div>
      </div>

      {assignments.map((assignment) => {
        const staff = staffList.find(s => s.id === assignment.staff_id);
        const trip = tripList.find(t => t.id === assignment.trip_id);
        const route = routeList.find(r => r.id === assignment.route_id);
        
        return (
          <div
            key={assignment.id}
            className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 2xl:px-7.5"
          >
            <div className="col-span-2">{staff?.full_name || assignment.staff_id}</div>
            <div className="col-span-1">{assignment.from_location}</div>
            <div className="col-span-1">{assignment.to_location}</div>
            <div className="col-span-1">{new Date(assignment.assigned_at).toLocaleString()}</div>
            <div className="col-span-1">{new Date(assignment.expected_end_time).toLocaleString()}</div>
            <div className="col-span-1">
              <StatusBadge status={assignment.status} />
            </div>
            <div className="col-span-1 flex space-x-2">
              <button
                onClick={() => {
                  setCurrentAssignment(assignment);
                  setIsDialogOpen(true);
                }}
                className="text-primary hover:text-opacity-80"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(assignment.id)}
                className="text-danger hover:text-opacity-80"
              >
                Xóa
              </button>
            </div>
          </div>
        );
      })}

      {/* Dialog thêm/sửa điều phối */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {currentAssignment.id ? 'Chỉnh sửa điều phối' : 'Thêm điều phối mới'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Nhân viên</label>
                  <select
                    name="staff_id"
                    value={currentAssignment.staff_id || ''}
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
                  <label className="block mb-2">Chuyến đi</label>
                  <select
                    name="trip_id"
                    value={currentAssignment.trip_id || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="">Chọn chuyến đi</option>
                    {tripList.map(trip => (
                      <option key={trip.id} value={trip.id}>
                        {trip.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Tuyến đường</label>
                  <select
                    name="route_id"
                    value={currentAssignment.route_id || ''}
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
                  <label className="block mb-2">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={currentAssignment.assigned_at ? new Date(currentAssignment.assigned_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateTimeChange('assigned_at', e.target.value)}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    value={currentAssignment.expected_end_time ? new Date(currentAssignment.expected_end_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateTimeChange('expected_end_time', e.target.value)}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Điểm xuất phát</label>
                  <input
                    type="text"
                    name="from_location"
                    value={currentAssignment.from_location || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Điểm đến</label>
                  <input
                    type="text"
                    name="to_location"
                    value={currentAssignment.to_location || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Vai trò</label>
                  <select
                    name="role"
                    value={currentAssignment.role || ''}
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

                <div>
                  <label className="block mb-2">Trạng thái</label>
                  <select
                    name="status"
                    value={currentAssignment.status || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="in-progress">Đang thực hiện</option>
                    <option value="completed">Hoàn thành</option>
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

export default DispatchAssignmentsPage;