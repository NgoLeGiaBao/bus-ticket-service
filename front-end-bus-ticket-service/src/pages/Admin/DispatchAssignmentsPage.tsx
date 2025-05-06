import React, { useState } from 'react';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiTruck, FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: { roleId: string; roleName: string }[];
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

interface StaffRoute {
  id: string;
  userid: string;
  routeid: string;
  assigndate: string;
  isactive: boolean;
  roleassignments: string[];
}

const DispatchAssignmentsPage = () => {
  // Mock data
  const [users] = useState<User[]>([
    {
      id: "1618604a-69c4-440e-9c76-f63bf6f20bac",
      username: "Ngô Lê Gia Bảo",
      email: "bao25092004@gmail.com",
      phoneNumber: "0123456782",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }],
    },
    {
      id: "b9f40643-408c-40eb-a048-781fda7e7213",
      username: "Phạm Trần Tiến",
      email: "phamtien@gmail.com",
      phoneNumber: "0123456788",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }],
    },
    {
      id: "de6ff5b1-cb79-4806-84e5-535764c40dd6",
      username: "Lục Hoàng Phúc",
      email: "lucphuc@gmail.com",
      phoneNumber: "03966275436",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }],
    },
    {
      id: "f912e7a8-4740-418e-93cb-ab603fc3817c",
      username: "Trần Hồng Đức",
      email: "tranhongduc@gmail.com",
      phoneNumber: "0123456783",
      roles: [{ roleId: "0196a3d2-a032-753b-856e-bb4d3e998c2a", roleName: "Driver" }],
    },
  ]);

  const [routes] = useState<Route[]>([
    {
      id: "b89f45c9-2bfc-4610-8f05-755e311de52d",
      origin: "Ho Chi Minh",
      destination: "Rach Gia",
      distance: 235,
      duration: 6,
      price: 230000,
      is_active: true,
    },
    {
      id: "e0c3847e-9830-4721-941f-bf09e6817143",
      origin: "Ho Chi Minh",
      destination: "Sa Dec",
      distance: 120,
      duration: 3,
      price: 140000,
      is_active: true,
    },
    {
      id: "f1f7a9c2-6976-44ee-9058-9d781431244e",
      origin: "Sa Dec",
      destination: "Ho Chi Minh",
      distance: 120,
      duration: 3,
      price: 140000,
      is_active: true,
    },
    {
      id: "06528ea4-443c-426a-9259-25b0db17ad1a",
      origin: "Ho Chi Minh",
      destination: "Can Tho",
      distance: 180,
      duration: 4,
      price: 165000,
      is_active: true,
    },
    {
      id: "70834bf5-4b75-4cee-9d1f-0b4f0b087deb",
      origin: "Can Tho",
      destination: "Ho Chi Minh",
      distance: 180,
      duration: 4,
      price: 165000,
      is_active: true,
    },
    {
      id: "7ce80238-ca51-49eb-8046-4890a5ce9fe0",
      origin: "Rach Gia",
      destination: "Ho Chi Minh",
      distance: 235,
      duration: 6,
      price: 230000,
      is_active: true,
    },
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
        destination: "Sa Dec",
      },
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
        destination: "Ho Chi Minh",
      },
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
        destination: "Ho Chi Minh",
      },
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
        destination: "Can Tho",
      },
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
        destination: "Ho Chi Minh",
      },
    },
    {
      id: "8abc34b5-6789-0cde-f123-456789abcdef",
      trip_date: "2025-05-09T18:00:00",
      available_seats: 20,
      route_id: "b89f45c9-2bfc-4610-8f05-755e311de52d",
      booked_seats: ["A01", "A02"],
      vehicle_type: "limousine",
      price: 230000,
      status: "scheduled",
      routes: {
        id: "b89f45c9-2bfc-4610-8f05-755e311de52d",
        price: 230000,
        origin: "Ho Chi Minh",
        distance: 235,
        duration: 6,
        is_active: true,
        destination: "Rach Gia",
      },
    },
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
      status: "assigned",
    },
    {
      id: "dc0f20b1-04e2-426a-91f1-61c45d6c8a50",
      userid: "b9f40643-408c-40eb-a048-781fda7e7213",
      tripid: "14715a01-5917-44c4-8a96-0c85606d1ad6",
      assignedate: "2025-05-08T11:00:00",
      expectedendtime: "2025-05-08T14:30:00",
      createdate: "2025-05-06T15:26:55.805574",
      role: "driver",
      status: "in-progress",
    },
    {
      id: "ef12g34h-56i7-89jk-lmno-567890pqrstu",
      userid: "de6ff5b1-cb79-4806-84e5-535764c40dd6",
      tripid: "5bcb4dbe-d70b-4a5c-8a47-16e564a5d028",
      assignedate: "2025-05-08T20:30:00",
      expectedendtime: "2025-05-08T23:30:00",
      createdate: "2025-05-06T16:45:22.334455",
      role: "driver",
      status: "assigned",
    },
    {
      id: "gh45i67j-89k1-23lm-nopq-678901rstuvw",
      userid: "f912e7a8-4740-418e-93cb-ab603fc3817c",
      tripid: "6cde12f3-4567-89ab-cdef-0123456789ab",
      assignedate: "2025-05-09T06:30:00",
      expectedendtime: "2025-05-09T10:30:00",
      createdate: "2025-05-06T17:12:33.445566",
      role: "driver",
      status: "assigned",
    },
    {
      id: "jk78l90m-12n3-45op-qrst-890123uvwxyz",
      userid: "1618604a-69c4-440e-9c76-f63bf6f20bac",
      tripid: "7def23a4-5678-9abc-def0-123456789abc",
      assignedate: "2025-05-09T13:00:00",
      expectedendtime: "2025-05-09T17:00:00",
      createdate: "2025-05-06T18:30:44.556677",
      role: "driver",
      status: "assigned",
    },
  ]);

  const [staffRoutes] = useState<StaffRoute[]>([
    {
      id: "95860afc-a52b-4a13-9015-943ff72319b6",
      userid: "b9f40643-408c-40eb-a048-781fda7e7213",
      routeid: "7ce80238-ca51-49eb-8046-4890a5ce9fe0",
      assigndate: "2025-05-06T14:01:14.825",
      isactive: true,
      roleassignments: ["driver"],
    },
    {
      id: "7aef5c85-0658-497c-a709-98a4fcce7925",
      userid: "b9f40643-408c-40eb-a048-781fda7e7213",
      routeid: "b89f45c9-2bfc-4610-8f05-755e311de52d",
      assigndate: "2025-05-06T14:07:25.515",
      isactive: true,
      roleassignments: ["driver"],
    },
    {
      id: "a649c2e1-aac1-476f-80a6-a334c9eb19c8",
      userid: "1618604a-69c4-440e-9c76-f63bf6f20bac",
      routeid: "f1f7a9c2-6976-44ee-9058-9d781431244e",
      assigndate: "2025-05-06T14:15:54.419",
      isactive: true,
      roleassignments: ["driver"],
    },
    {
      id: "10cf8bd7-90c8-4cd4-9f70-7ddabcd1f303",
      userid: "f912e7a8-4740-418e-93cb-ab603fc3817c",
      routeid: "b89f45c9-2bfc-4610-8f05-755e311de52d",
      assigndate: "2025-05-06T14:32:44.146",
      isactive: true,
      roleassignments: ["driver"],
    },
    {
      id: "e8f41321-f586-48a9-aeb7-c48060571b54",
      userid: "f912e7a8-4740-418e-93cb-ab603fc3817c",
      routeid: "7ce80238-ca51-49eb-8046-4890a5ce9fe0",
      assigndate: "2025-05-06T14:32:51.026",
      isactive: true,
      roleassignments: ["driver"],
    },
    {
      id: "1806bd68-9391-49e5-bac9-165205870998",
      userid: "1618604a-69c4-440e-9c76-f63bf6f20bac",
      routeid: "e0c3847e-9830-4721-941f-bf09e6817143",
      assigndate: "2025-05-06T14:02:11.409",
      isactive: true,
      roleassignments: ["driver"],
    },
  ]);

  // Form and filter state
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedTrips, setExpandedTrips] = useState<Record<string, boolean>>({});
  const [currentAssignment, setCurrentAssignment] = useState<Partial<DispatchAssignment>>({
    status: 'assigned',
    assignedate: new Date().toISOString(),
    expectedendtime: new Date(Date.now() + 3600000).toISOString(),
    role: 'driver',
  });

  // Filter trips based on selected route for form
  const filteredTrips = selectedRouteId
    ? trips.filter((trip) => trip.route_id === selectedRouteId)
    : [];

  // Filter drivers based on selected route
  const filteredDrivers = selectedRouteId
    ? users.filter((user) =>
        staffRoutes.some(
          (sr) =>
            sr.routeid === selectedRouteId &&
            sr.userid === user.id &&
            sr.isactive &&
            sr.roleassignments.includes('driver')
        )
      )
    : [];

  // Get all trips with assignments, applying filters
  const filteredTripAssignments = trips
    .filter((trip) => {
      const tripDate = new Date(trip.trip_date).toISOString().split('T')[0];
      const hasAssignments = assignments.some((a) => a.tripid === trip.id);

      return (
        // Route filter
        (!routeFilter || trip.route_id === routeFilter) &&
        // Date filter
        (!dateFilter || tripDate === dateFilter) &&
        // Status filter
        (statusFilter === 'all' ||
          (statusFilter === 'assigned' && hasAssignments) ||
          (statusFilter === 'unassigned' && !hasAssignments))
      );
    })
    .map((trip) => ({
      tripId: trip.id,
      assignments: assignments.filter((a) => a.tripid === trip.id),
      trip,
    }));

  // Toggle trip expansion
  const toggleTripExpansion = (tripId: string) => {
    setExpandedTrips((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
  };

  // Calculate expected end time based on trip start time and route duration
  const calculateExpectedEndTime = (tripId: string, routeId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    const route = routes.find((r) => r.id === routeId);
    if (trip && route) {
      const startTime = new Date(trip.trip_date);
      const durationHours = route.duration + 1; // Add 1 hour as per requirement
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
      return endTime.toISOString();
    }
    return new Date(Date.now() + 3600000).toISOString();
  };

  // Handle trip selection
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setCurrentAssignment((prev) => ({
        ...prev,
        assignedate: trip.trip_date,
        expectedendtime: calculateExpectedEndTime(tripId, trip.route_id),
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedTripId || !currentAssignment.role) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (
      new Date(currentAssignment.expectedendtime!) <= new Date(currentAssignment.assignedate!)
    ) {
      setErrorMessage('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (
      assignments.some(
        (a) =>
          a.tripid === selectedTripId &&
          a.userid === selectedUserId &&
          a.role === currentAssignment.role &&
          a.id !== currentAssignment.id
      )
    ) {
      setErrorMessage('Nhân viên đã được phân công vai trò này cho chuyến đi này');
      return;
    }

    if (currentAssignment.id) {
      setAssignments(
        assignments.map((assignment) =>
          assignment.id === currentAssignment.id
            ? { ...assignment, ...currentAssignment, userid: selectedUserId, tripid: selectedTripId } as DispatchAssignment
            : assignment
        )
      );
    } else {
      const newAssignment = {
        ...currentAssignment,
        id: `da${Date.now()}`,
        userid: selectedUserId,
        tripid: selectedTripId,
        status: currentAssignment.status || 'assigned',
        createdate: new Date().toISOString(),
      } as DispatchAssignment;
      setAssignments([...assignments, newAssignment]);
    }

    setIsDialogOpen(false);
    setCurrentAssignment({
      status: 'assigned',
      assignedate: new Date().toISOString(),
      expectedendtime: new Date(Date.now() + 3600000).toISOString(),
      role: 'driver',
    });
    setSelectedRouteId('');
    setSelectedTripId('');
    setSelectedUserId('');
    setErrorMessage(null);
  };

  // Handle delete
  const handleDelete = () => {
    if (assignmentToDelete) {
      setAssignments(assignments.filter((a) => a.id !== assignmentToDelete));
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
    }
  };

  // Status badge component
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

  // Helper functions
  const getRouteInfo = (routeId: string) => {
    return routes.find((r) => r.id === routeId) || { origin: '', destination: '' };
  };

  const getTripInfo = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    return trip
      ? {
          date: new Date(trip.trip_date).toLocaleString('vi-VN'),
          origin: trip.routes.origin,
          destination: trip.routes.destination,
          vehicleType: trip.vehicle_type,
        }
      : { date: '', origin: '', destination: '', vehicleType: '' };
  };

  const getUserInfo = (userId: string) => {
    return users.find((u) => u.id === userId) || { username: '' };
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center border-b border-stroke dark:border-strokedark">
        <div className="flex items-center space-x-3">
          {/* <FiUsers className="text-2xl text-primary" /> */}
          <h4 className="text-xl font-semibold text-black dark:text-white">Quản lý điều phối tài xế</h4>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="mr-2" />
          Thêm điều phối
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 2xl:px-7.5 pb-4 pt-4 space-y-4 bg-gray-50 dark:bg-meta-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
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
          <div className="w-full md:w-48">
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
          <div className="w-full md:w-48">
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

      {/* Assignment List */}
      <div className="p-4 md:p-6 2xl:p-7.5 space-y-4">
        {filteredTripAssignments.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">Không có chuyến nào phù hợp</h3>
            <p className="mt-1 text-sm">Thử thay đổi tiêu chí lọc hoặc thêm điều phối mới</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTripAssignments.map(({ tripId, assignments, trip }) => {
              const tripInfo = getTripInfo(tripId);
              const route = getRouteInfo(trip.route_id);
              const isExpanded = expandedTrips[tripId] || false;

              return (
                <div key={tripId} className="rounded-lg border border-stroke shadow-sm overflow-hidden dark:border-strokedark">
                  {/* Trip Card Header */}
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
                          setCurrentAssignment({ status: 'assigned', role: 'driver' });
                          setSelectedRouteId(trip.route_id);
                          setSelectedTripId(tripId);
                          setIsDialogOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary bg-opacity-10 hover:bg-opacity-20 focus:outline-none transition-colors"
                      >
                        <FiPlus className="mr-1" />
                        Thêm phân công
                      </button>
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Trip Assignments (collapsible) */}
                  {isExpanded && (
                    <div className="border-t border-stroke dark:border-strokedark bg-white dark:bg-boxdark">
                      {assignments.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Chưa có nhân viên nào được phân công cho chuyến này
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                            <thead className="bg-gray-50 dark:bg-meta-4">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Nhân viên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Vai trò
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Thời gian bắt đầu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Thời gian kết thúc
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
                              {assignments.map((assignment) => {
                                const user = getUserInfo(assignment.userid);
                                return (
                                  <tr
                                    key={assignment.id}
                                    className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                      <div>
                                        <div className="font-medium">{user.username}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {users.find((u) => u.id === assignment.userid)?.phoneNumber}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary">
                                        {assignment.role === 'driver' ? 'Tài xế' : 'Phụ xe'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {formatDateTime(assignment.assignedate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {formatDateTime(assignment.expectedendtime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      <StatusBadge status={assignment.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => {
                                          setCurrentAssignment(assignment);
                                          setSelectedRouteId(trips.find((t) => t.id === assignment.tripid)?.route_id || '');
                                          setSelectedTripId(assignment.tripid);
                                          setSelectedUserId(assignment.userid);
                                          setIsDialogOpen(true);
                                        }}
                                        className="text-primary hover:text-primary-dark mr-3"
                                      >
                                        <FiEdit className="inline mr-1" />
                                        Sửa
                                      </button>
                                      <button
                                        onClick={() => {
                                          setAssignmentToDelete(assignment.id);
                                          setIsDeleteModalOpen(true);
                                        }}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <FiTrash2 className="inline mr-1" />
                                        Xóa
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
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

      {/* Add/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentAssignment.id ? 'Chỉnh sửa điều phối' : 'Thêm điều phối mới'}
              </h3>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setCurrentAssignment({
                    status: 'assigned',
                    assignedate: new Date().toISOString(),
                    expectedendtime: new Date(Date.now() + 3600000).toISOString(),
                    role: 'driver',
                  });
                  setSelectedRouteId('');
                  setSelectedTripId('');
                  setSelectedUserId('');
                  setErrorMessage(null);
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

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
            <div className="flex justify-center space-y-5">
              <div className="w-full max-w-md">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Tuyến đường
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 py-10 flex items-center pointer-events-none">
                    <FiTruck className="text-gray-400 text-lg" />
                  </div>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      setSelectedTripId('');
                      setSelectedUserId('');
                    }}
                    className="w-full rounded-lg border border-stroke bg-white py-3.5 pl-14 pr-4 text-base font-medium shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors dark:border-strokedark dark:bg-meta-4 dark:text-gray-200"
                    required
                  >
                    <option value="" disabled>
                      Chọn tuyến đường
                    </option>
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
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chuyến đi
                    </label>
                    <select
                      value={selectedTripId}
                      onChange={(e) => handleTripChange(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      required
                    >
                      <option value="">Chọn chuyến đi</option>
                      {filteredTrips.map((trip) => (
                        <option key={trip.id} value={trip.id}>
                          {formatDateTime(trip.trip_date)} - {trip.vehicle_type} ({trip.available_seats}{' '}
                          chỗ trống)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRouteId && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nhân viên
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      required
                    >
                      <option value="">Chọn nhân viên</option>
                      {filteredDrivers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.phoneNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      currentAssignment.assignedate
                        ? new Date(currentAssignment.assignedate).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setCurrentAssignment((prev) => ({
                        ...prev,
                        assignedate: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      currentAssignment.expectedendtime
                        ? new Date(currentAssignment.expectedendtime).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setCurrentAssignment((prev) => ({
                        ...prev,
                        expectedendtime: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vai trò
                  </label>
                  <select
                    value={currentAssignment.role || ''}
                    onChange={(e) =>
                      setCurrentAssignment((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  >
                    <option value="driver">Tài xế</option>
                    <option value="conductor">Phụ xe</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng thái
                  </label>
                  <select
                    value={currentAssignment.status || ''}
                    onChange={(e) =>
                      setCurrentAssignment((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    required
                  >
                    <option value="assigned">Đã phân công</option>
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
                    setCurrentAssignment({
                      status: 'assigned',
                      assignedate: new Date().toISOString(),
                      expectedendtime: new Date(Date.now() + 3600000).toISOString(),
                      role: 'driver',
                    });
                    setSelectedRouteId('');
                    setSelectedTripId('');
                    setSelectedUserId('');
                    setErrorMessage(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {currentAssignment.id ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Xác nhận xóa</h3>
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
                  Bạn có chắc chắn muốn xóa điều phối này?
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
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchAssignmentsPage;