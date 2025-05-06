import React, { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: {
    roleId: string;
    roleName: string;
  }[];
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

const DispatchAssignmentsPage = () => {
  // Mock data (same as before)

  // Mock data từ API
  const [users] = useState<User[]>([
    {
      id: "1618604a-69c4-440e-9c76-f63bf6f20bac",
      username: "Ngô Lê Gia Bảo",
      email: "bao25092004@gmail.com",
      phoneNumber: "0123456782",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }]
    },
    {
      id: "b9f40643-408c-40eb-a048-781fda7e7213",
      username: "Phạm Trần Tiến",
      email: "phamtien@gmail.com",
      phoneNumber: "0123456788",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }]
    },
    {
      id: "de6ff5b1-cb79-4806-84e5-535764c40dd6",
      username: "Lục Hoàng Phúc",
      email: "lucphuc@gmail.com",
      phoneNumber: "03966275436",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }]
    },
    {
      id: "f912e7a8-4740-418e-93cb-ab603fc3817c",
      username: "Trần Hồng Đức",
      email: "tranhongduc@gmail.com",
      phoneNumber: "0123456783",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }]
    }
  ]);

  const [routes] = useState<Route[]>([
    {
      id: "b89f45c9-2bfc-4610-8f05-755e311de52d",
      origin: "Ho Chi Minh",
      destination: "Rach Gia",
      distance: 235,
      duration: 6,
      price: 230000,
      is_active: true
    },
    {
      id: "e0c3847e-9830-4721-941f-bf09e6817143",
      origin: "Ho Chi Minh",
      destination: "Sa Dec",
      distance: 120,
      duration: 3,
      price: 140000,
      is_active: true
    },
    {
      id: "f1f7a9c2-6976-44ee-9058-9d781431244e",
      origin: "Sa Dec",
      destination: "Ho Chi Minh",
      distance: 120,
      duration: 3,
      price: 140000,
      is_active: true
    },
    {
      id: "06528ea4-443c-426a-9259-25b0db17ad1a",
      origin: "Ho Chi Minh",
      destination: "Can Tho",
      distance: 180,
      duration: 4,
      price: 165000,
      is_active: true
    },
    {
      id: "70834bf5-4b75-4cee-9d1f-0b4f0b087deb",
      origin: "Can Tho",
      destination: "Ho Chi Minh",
      distance: 180,
      duration: 4,
      price: 165000,
      is_active: true
    },
    {
      id: "7ce80238-ca51-49eb-8046-4890a5ce9fe0",
      origin: "Rach Gia",
      destination: "Ho Chi Minh",
      distance: 235,
      duration: 6,
      price: 230000,
      is_active: true
    }
  ]);

  const [trips] = useState<Trip[]>([
    {
      id: "4db1f902-4c07-4445-ba56-4c9519112475",
      trip_date: "2025-05-08T12:30:00",
      available_seats: 22,
      route_id: "e0c3847e-9830-4721-941f-bf09e6817143",
      booked_seats: ["B04", "A11", "A14", "B15", "B16", "A06", "A02", "A05", "B02", "B01", "A03", "B05"],
      vehicle_type: "limousine",
      price: 140000,
      status: "scheduled",
      routes: {
        id: "e0c3847e-9830-4721-941f-bf09e6817143",
        price: 140000,
        origin: "Ho Chi Minh",
        distance: 120,
        duration: 3,
        is_active: true,
        destination: "Sa Dec"
      }
    },
    {
      id: "14715a01-5917-44c4-8a96-0c85606d1ad6",
      trip_date: "2025-05-08T12:30:00",
      available_seats: 29,
      route_id: "f1f7a9c2-6976-44ee-9058-9d781431244e",
      booked_seats: ["B14", "B17", "A02", "A01", "A03"],
      vehicle_type: "limousine",
      price: 140000,
      status: "scheduled",
      routes: {
        id: "f1f7a9c2-6976-44ee-9058-9d781431244e",
        price: 140000,
        origin: "Sa Dec",
        distance: 120,
        duration: 3,
        is_active: true,
        destination: "Ho Chi Minh"
      }
    },
    {
      id: "5bcb4dbe-d70b-4a5c-8a47-16e564a5d028",
      trip_date: "2025-05-08T22:00:00",
      available_seats: 30,
      route_id: "f1f7a9c2-6976-44ee-9058-9d781431244e",
      booked_seats: ["A06", "A05", "B01", "B02"],
      vehicle_type: "limousine",
      price: 140000,
      status: "scheduled",
      routes: {
        id: "f1f7a9c2-6976-44ee-9058-9d781431244e",
        price: 140000,
        origin: "Sa Dec",
        distance: 120,
        duration: 3,
        is_active: true,
        destination: "Ho Chi Minh"
      }
    },
    {
      id: "6cde12f3-4567-89ab-cdef-0123456789ab",
      trip_date: "2025-05-09T08:00:00",
      available_seats: 25,
      route_id: "06528ea4-443c-426a-9259-25b0db17ad1a",
      booked_seats: ["A01", "A02", "B01", "B02", "B03"],
      vehicle_type: "bus",
      price: 165000,
      status: "scheduled",
      routes: {
        id: "06528ea4-443c-426a-9259-25b0db17ad1a",
        price: 165000,
        origin: "Ho Chi Minh",
        distance: 180,
        duration: 4,
        is_active: true,
        destination: "Can Tho"
      }
    },
    {
      id: "7def23a4-5678-9abc-def0-123456789abc",
      trip_date: "2025-05-09T14:30:00",
      available_seats: 28,
      route_id: "70834bf5-4b75-4cee-9d1f-0b4f0b087deb",
      booked_seats: ["A03", "A04", "B04", "B05"],
      vehicle_type: "bus",
      price: 165000,
      status: "scheduled",
      routes: {
        id: "70834bf5-4b75-4cee-9d1f-0b4f0b087deb",
        price: 165000,
        origin: "Can Tho",
        distance: 180,
        duration: 4,
        is_active: true,
        destination: "Ho Chi Minh"
      }
    }
  ]);

  const [assignments, setAssignments] = useState<DispatchAssignment[]>([
    {
      id: "8913dd4b-3dc0-482c-bae1-e53ba0b7eeb1",
      userid: "1618604a-69c4-440e-9c76-f63bf6f20bac",
      tripid: "4db1f902-4c07-4445-ba56-4c9519112475",
      assignedate: "2025-05-08T10:00:00",
      expectedendtime: "2025-05-08T13:30:00",
      createdate: "2025-05-06T15:22:16.112892",
      role: "driver",
      status: "pending"
    },
    {
      id: "dc0f20b1-04e2-426a-91f1-61c45d6c8a50",
      userid: "b9f40643-408c-40eb-a048-781fda7e7213",
      tripid: "14715a01-5917-44c4-8a96-0c85606d1ad6",
      assignedate: "2025-05-08T11:00:00",
      expectedendtime: "2025-05-08T14:30:00",
      createdate: "2025-05-06T15:26:55.805574",
      role: "driver",
      status: "in-progress"
    },
    {
      id: "ef12g34h-56i7-89jk-lmno-567890pqrstu",
      userid: "de6ff5b1-cb79-4806-84e5-535764c40dd6",
      tripid: "5bcb4dbe-d70b-4a5c-8a47-16e564a5d028",
      assignedate: "2025-05-08T20:30:00",
      expectedendtime: "2025-05-08T23:30:00",
      createdate: "2025-05-06T16:45:22.334455",
      role: "driver",
      status: "pending"
    },
    {
      id: "gh45i67j-89k1-23lm-nopq-678901rstuvw",
      userid: "f912e7a8-4740-418e-93cb-ab603fc3817c",
      tripid: "6cde12f3-4567-89ab-cdef-0123456789ab",
      assignedate: "2025-05-09T06:30:00",
      expectedendtime: "2025-05-09T10:30:00",
      createdate: "2025-05-06T17:12:33.445566",
      role: "driver",
      status: "pending"
    },
    {
      id: "jk78l90m-12n3-45op-qrst-890123uvwxyz",
      userid: "1618604a-69c4-440e-9c76-f63bf6f20bac",
      tripid: "7def23a4-5678-9abc-def0-123456789abc",
      assignedate: "2025-05-09T13:00:00",
      expectedendtime: "2025-05-09T17:00:00",
      createdate: "2025-05-06T18:30:44.556677",
      role: "driver",
      status: "pending"
    }
  ]);

  // Form state
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<DispatchAssignment>>({
    status: 'pending',
    assignedate: new Date().toISOString(),
    expectedendtime: new Date(Date.now() + 3600000).toISOString(),
    role: 'driver'
  });

  // Filter trips based on selected route
  const filteredTrips = selectedRouteId 
    ? trips.filter(trip => trip.route_id === selectedRouteId)
    : [];

  // Get only drivers from users
  const filteredDrivers = users.filter(user => 
    user.roles.some(role => role.roleName === "Driver")
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAssignment(prev => ({ ...prev, [name]: value }));
  };

  // Handle date/time changes
  const handleDateTimeChange = (field: string, value: string) => {
    setCurrentAssignment(prev => ({ ...prev, [field]: value }));
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate end time is after start time
    if (new Date(currentAssignment.expectedendtime!) <= new Date(currentAssignment.assignedate!)) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (currentAssignment.id) {
      // Update existing assignment
      setAssignments(assignments.map(assignment => 
        assignment.id === currentAssignment.id ? { ...assignment, ...currentAssignment } as DispatchAssignment : assignment
      ));
    } else {
      // Create new assignment
      const newAssignment = {
        ...currentAssignment,
        id: `da${Date.now()}`,
        userid: selectedUserId,
        tripid: selectedTripId,
        status: currentAssignment.status || 'pending',
        createdate: new Date().toISOString()
      } as DispatchAssignment;
      setAssignments([...assignments, newAssignment]);
    }
    
    // Reset form and close dialog
    setIsDialogOpen(false);
    setCurrentAssignment({
      status: 'pending',
      assignedate: new Date().toISOString(),
      expectedendtime: new Date(Date.now() + 3600000).toISOString(),
      role: 'driver'
    });
    setSelectedRouteId("");
    setSelectedTripId("");
    setSelectedUserId("");
  };

  // Delete an assignment
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa điều phối này?')) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      'in-progress': { text: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    };

    const statusKey = status.toLowerCase() as keyof typeof statusMap;
    const badgeInfo = statusMap[statusKey] || { text: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${badgeInfo.color}`}>
        {badgeInfo.text}
      </span>
    );
  };

  // Helper functions to get related information
  const getRouteInfo = (routeId: string) => {
    return routes.find(r => r.id === routeId) || { origin: '', destination: '' };
  };

  const getTripInfo = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    return trip ? {
      date: new Date(trip.trip_date).toLocaleString('vi-VN'),
      origin: trip.routes.origin,
      destination: trip.routes.destination,
      vehicleType: trip.vehicle_type
    } : { date: '', origin: '', destination: '', vehicleType: '' };
  };

  const getUserInfo = (userId: string) => {
    return users.find(u => u.id === userId) || { username: '' };
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Quản lý điều phối tài xế
        </h4>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
        >
          Thêm điều phối
        </button>
      </div>

      {/* Assignment list table */}
      <div className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 2xl:px-7.5">
        <div className="col-span-2 font-medium">Tài xế</div>
        <div className="col-span-1 font-medium">Tuyến đường</div>
        <div className="col-span-1 font-medium">Chuyến đi</div>
        <div className="col-span-1 font-medium">Ngày giờ đi</div>
        <div className="col-span-1 font-medium">Thời gian bắt đầu</div>
        <div className="col-span-1 font-medium">Thời gian kết thúc</div>
        <div className="col-span-1 font-medium">Trạng thái</div>
        <div className="col-span-1 font-medium">Hành động</div>
      </div>

      {/* Assignment list items */}
      {assignments.map((assignment) => {
        const user = getUserInfo(assignment.userid);
        const trip = getTripInfo(assignment.tripid);
        const route = getRouteInfo(trips.find(t => t.id === assignment.tripid)?.route_id || '');
        
        return (
          <div
            key={assignment.id}
            className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 2xl:px-7.5 hover:bg-gray-50 dark:hover:bg-meta-4"
          >
            <div className="col-span-2">
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-500">{users.find(u => u.id === assignment.userid)?.phoneNumber}</p>
            </div>
            <div className="col-span-1">
              {`${route.origin} → ${route.destination}`}
            </div>
            <div className="col-span-1">
              {`${trip.origin} → ${trip.destination}`}
              <br />
              <span className="text-gray-600">{trip.vehicleType}</span>
            </div>
            <div className="col-span-1">
              {trip.date}
            </div>
            <div className="col-span-1">
              {formatDateTime(assignment.assignedate)}
            </div>
            <div className="col-span-1">
              {formatDateTime(assignment.expectedendtime)}
            </div>
            <div className="col-span-1">
              <StatusBadge status={assignment.status} />
            </div>
            <div className="col-span-1 flex items-center space-x-2">
              <button
                onClick={() => {
                  setCurrentAssignment(assignment);
                  setSelectedRouteId(trips.find(t => t.id === assignment.tripid)?.route_id || '');
                  setSelectedTripId(assignment.tripid);
                  setSelectedUserId(assignment.userid);
                  setIsDialogOpen(true);
                }}
                className="text-primary hover:text-opacity-80"
                title="Sửa"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(assignment.id)}
                className="text-danger hover:text-opacity-80"
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}

      {/* Assignment form dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {currentAssignment.id ? 'Chỉnh sửa điều phối' : 'Thêm điều phối mới'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Tuyến đường</label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      setSelectedTripId("");
                    }}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="">Chọn tuyến đường</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {`${route.origin} → ${route.destination}`} ({route.distance}km)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRouteId && (
                  <div>
                    <label className="block mb-2 text-sm font-medium">Chuyến đi</label>
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                      required
                    >
                      <option value="">Chọn chuyến đi</option>
                      {filteredTrips.map(trip => (
                        <option key={trip.id} value={trip.id}>
                          {formatDateTime(trip.trip_date)} - {trip.vehicle_type} ({trip.available_seats} chỗ trống)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRouteId && (
                  <div>
                    <label className="block mb-2 text-sm font-medium">Tài xế</label>
                    <select
                      name="userid"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                      required
                    >
                      <option value="">Chọn tài xế</option>
                      {filteredDrivers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.phoneNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={currentAssignment.assignedate ? new Date(currentAssignment.assignedate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateTimeChange('assignedate', e.target.value)}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    value={currentAssignment.expectedendtime ? new Date(currentAssignment.expectedendtime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateTimeChange('expectedendtime', e.target.value)}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Vai trò</label>
                  <select
                    name="role"
                    value={currentAssignment.role || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="driver">Tài xế</option>
                    <option value="conductor">Phụ xe</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Trạng thái</label>
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
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedRouteId("");
                    setSelectedTripId("");
                    setSelectedUserId("");
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                >
                  {currentAssignment.id ? 'Cập nhật' : 'Thêm mới'}
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