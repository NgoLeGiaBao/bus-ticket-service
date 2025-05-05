import React, { useState, useEffect } from 'react';
// import { Booking } from '../../interfaces/Booking';
interface Booking {
    id: string;
    user_id: string;
    trip_id: string;
    seats: { seat_number: string; price: number }[];
    total_price: number;
    status: string;
    payment_status: string;
    created_at: string;
}
interface BookingWithDetails extends Booking {
  trip: {
    id: string;
    trip_date: string;
    route_id: string;
    routes: {
      origin: string;
      destination: string;
    };
    vehicle_type: string;
    price: number;
  };
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

const BookingManagement: React.FC = () => {
  // Mock data thay thế cho API calls
  const mockBookings: BookingWithDetails[] = [
    {
      id: 'booking-1',
      user_id: 'user-1',
      trip_id: 'trip-1',
      seats: [
        { seat_number: 'A1', price: 150000 },
        { seat_number: 'A2', price: 150000 }
      ],
      total_price: 300000,
      status: 'pending',
      payment_status: 'pending',
      created_at: '2023-05-15T10:30:00Z',
      trip: {
        id: 'trip-1',
        trip_date: '2023-05-20T08:00:00Z',
        route_id: 'route-1',
        routes: {
          origin: 'Hà Nội',
          destination: 'Hải Phòng'
        },
        vehicle_type: 'limousine',
        price: 150000
      },
      user: {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0987654321'
      }
    },
    {
      id: 'booking-2',
      user_id: 'user-2',
      trip_id: 'trip-2',
      seats: [
        { seat_number: 'B3', price: 200000 }
      ],
      total_price: 200000,
      status: 'confirmed',
      payment_status: 'paid',
      created_at: '2023-05-16T14:45:00Z',
      trip: {
        id: 'trip-2',
        trip_date: '2023-05-21T10:00:00Z',
        route_id: 'route-2',
        routes: {
          origin: 'Hồ Chí Minh',
          destination: 'Đà Lạt'
        },
        vehicle_type: 'sleeper',
        price: 200000
      },
      user: {
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0912345678'
      }
    },
    {
      id: 'booking-3',
      user_id: 'user-3',
      trip_id: 'trip-3',
      seats: [
        { seat_number: 'C1', price: 180000 },
        { seat_number: 'C2', price: 180000 },
        { seat_number: 'C3', price: 180000 }
      ],
      total_price: 540000,
      status: 'completed',
      payment_status: 'paid',
      created_at: '2023-05-10T09:15:00Z',
      trip: {
        id: 'trip-3',
        trip_date: '2023-05-15T07:30:00Z',
        route_id: 'route-3',
        routes: {
          origin: 'Đà Nẵng',
          destination: 'Huế'
        },
        vehicle_type: 'limousine',
        price: 180000
      },
      user: {
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0967890123'
      }
    },
    {
      id: 'booking-4',
      user_id: 'user-4',
      trip_id: 'trip-4',
      seats: [
        { seat_number: 'D4', price: 220000 }
      ],
      total_price: 220000,
      status: 'cancelled',
      payment_status: 'refunded',
      created_at: '2023-05-14T16:20:00Z',
      trip: {
        id: 'trip-4',
        trip_date: '2023-05-19T12:00:00Z',
        route_id: 'route-4',
        routes: {
          origin: 'Nha Trang',
          destination: 'Phan Thiết'
        },
        vehicle_type: 'sleeper',
        price: 220000
      },
      user: {
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0934567890'
      }
    },
    {
      id: 'booking-5',
      user_id: 'user-5',
      trip_id: 'trip-5',
      seats: [
        { seat_number: 'E5', price: 170000 },
        { seat_number: 'E6', price: 170000 }
      ],
      total_price: 340000,
      status: 'confirmed',
      payment_status: 'paid',
      created_at: '2023-05-17T11:10:00Z',
      trip: {
        id: 'trip-5',
        trip_date: '2023-05-22T09:00:00Z',
        route_id: 'route-5',
        routes: {
          origin: 'Hải Phòng',
          destination: 'Quảng Ninh'
        },
        vehicle_type: 'limousine',
        price: 170000
      },
      user: {
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        phone: '0978901234'
      }
    }
  ];

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    payment: '',
    date: ''
  });
  const [selectedStatus, setSelectedStatus] = useState('confirmed');
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    show: false,
    bookingId: '',
    currentStatus: ''
  });

  useEffect(() => {
    handleGetBookings();
  }, []);

  const handleGetBookings = async () => {
    // Giả lập delay gọi API
    await new Promise(resolve => setTimeout(resolve, 500));
    setBookings(mockBookings);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      // Giả lập delay gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
      ));
      setStatusUpdateModal({ show: false, bookingId: '', currentStatus: '' });
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const openStatusUpdateModal = (bookingId: string, currentStatus: string) => {
    setStatusUpdateModal({
      show: true,
      bookingId,
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.user.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(search.toLowerCase()) ||
      booking.user.phone.toLowerCase().includes(search.toLowerCase()) ||
      booking.trip.routes.origin.toLowerCase().includes(search.toLowerCase()) ||
      booking.trip.routes.destination.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filters.status ? booking.status === filters.status : true;
    const matchesPayment = filters.payment ? booking.payment_status === filters.payment : true;
    const matchesDate = filters.date ? 
      new Date(booking.created_at).toLocaleDateString() === new Date(filters.date).toLocaleDateString() : true;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return 'Không xác định';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý vé đã đặt</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm vé đặt..."
            className="w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo trạng thái</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo thanh toán</label>
          <select
            name="payment"
            value={filters.payment}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="failed">Thanh toán thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo ngày đặt</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuyến đường</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghế</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TT thanh toán</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  #{booking.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                  <div className="text-sm text-gray-500">{booking.user.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.trip.routes.origin} → {booking.trip.routes.destination}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.trip.vehicle_type === 'limousine' ? 'Limousine' : 'Giường nằm'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(booking.trip.trip_date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.seats.map(seat => seat.seat_number).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.total_price.toLocaleString()}đ
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                      booking.payment_status
                    )}`}
                  >
                    {getPaymentStatusText(booking.payment_status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openStatusUpdateModal(booking.id, booking.status)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                    disabled={!['pending', 'confirmed'].includes(booking.status)}
                  >
                    Cập nhật
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cập nhật trạng thái vé</h2>
              <button
                onClick={() => setStatusUpdateModal({ show: false, bookingId: '', currentStatus: '' })}
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
                  defaultValue={statusUpdateModal.currentStatus === 'pending' ? 'confirmed' : 'cancelled'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusUpdateModal.currentStatus === 'pending' && (
                    <>
                      <option value="confirmed">Xác nhận</option>
                      <option value="cancelled">Hủy vé</option>
                    </>
                  )}
                  {statusUpdateModal.currentStatus === 'confirmed' && (
                    <>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Hủy vé</option>
                    </>
                  )}
                </select>
              </div>

              <button
                onClick={() => handleUpdateStatus(statusUpdateModal.bookingId, selectedStatus)}
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

export default BookingManagement;