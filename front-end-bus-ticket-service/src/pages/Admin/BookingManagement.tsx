import React, { useEffect, useState } from 'react';
import { getAllBookings} from '../../services/apiServices';

interface BookingData {
  booking: {
    id: string;
    phoneNumber: string;
    email: string | null;
    customerName: string;
    tripId: string;
    seatNumbers: string[];
    bookingTime: string;
    status: string;
  };
  payment: {
    id: string;
    bookingId: string;
    amount: number;
    paymentTime: string;
    status: string;
    method: string;
  };
  trip: {
    tripDate: string;
    origin: string;
    destination: string;
    routeId: string;
  };
}

const BookingManagement: React.FC = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [bookingsData, setBookingsData] = useState<BookingData[]>([]);

  useEffect(() => {
    fetchTicket();
  }, []);
  
  //Fetch data
  const fetchTicket = async () => {
    const res = await getAllBookings();
    if(res.success && Array.isArray(res.data)) {
      setBookingsData(res.data);
    }
  }
  // Get unique routes for filter
  const uniqueRoutes = Array.from(new Set(
    bookingsData.map(booking => `${booking.trip.origin} → ${booking.trip.destination}`)
  ));

  // Filter bookings
  const filteredBookings = bookingsData.filter(booking => {
    const matchesSearch = 
      booking.booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking.phoneNumber.includes(searchTerm) ||
      (booking.booking.email && booking.booking.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.payment.status === paymentFilter;
    const matchesRoute = routeFilter === 'all' || 
      `${booking.trip.origin} → ${booking.trip.destination}` === routeFilter;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesRoute;
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      Booked: { color: 'bg-blue-100 text-blue-800', text: 'Đã đặt' },
      Cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
      default: { color: 'bg-gray-100 text-gray-800', text: status }
    };
    
    const { color, text } = config[status as keyof typeof config] || config.default;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };

  // Payment badge component
  const PaymentBadge = ({ status, method }: { status: string; method: string }) => {
    const statusConfig = {
      Success: { color: 'bg-green-100 text-green-800', text: 'Thành công' },
      Pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Đang chờ' },
      Failed: { color: 'bg-red-100 text-red-800', text: 'Thất bại' },
      default: { color: 'bg-gray-100 text-gray-800', text: status }
    };
    
    const methodConfig = {
      vnpay: { color: 'bg-purple-100 text-purple-800', text: 'VNPay' },
      CASH: { color: 'bg-indigo-100 text-indigo-800', text: 'Tiền mặt' },
      default: { color: 'bg-gray-100 text-gray-800', text: method }
    };
    
    const { color: statusColor, text: statusText } = 
      statusConfig[status as keyof typeof statusConfig] || statusConfig.default;
    
    const { color: methodColor, text: methodText } = 
      methodConfig[method as keyof typeof methodConfig] || methodConfig.default;
    
    return (
      <div className="flex flex-col gap-1">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${methodColor}`}>
          {methodText}
        </span>
      </div>
    );
  };

  // Formatted date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleString('vi-VN', options);
  };

  // Formatted currency display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản Lý Đặt Vé</h1>
            <p className="text-sm text-gray-500 mt-1">Danh sách các vé đã đặt và trạng thái thanh toán</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm vé"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tuyến đường</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
              >
                <option value="all">Tất cả tuyến đường</option>
                {uniqueRoutes.map(route => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái vé</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Booked">Đã đặt</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">Tất cả thanh toán</option>
                <option value="Success">Thành công</option>
                <option value="Pending">Đang chờ</option>
                <option value="Failed">Thất bại</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Mã vé</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Khách hàng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Chuyến đi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Ghế & Giá vé</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Thanh toán</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.booking.id}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(booking.booking.bookingTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.booking.customerName}</div>
                        <div className="text-xs text-gray-500">{booking.booking.phoneNumber}</div>
                        {booking.booking.email && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{booking.booking.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.trip.origin} → {booking.trip.destination}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(booking.trip.tripDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex flex-wrap justify-center gap-1">
                            {booking.booking.seatNumbers.map(seat => (
                              <span 
                                key={seat} 
                                className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700"
                              >
                                {seat}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm font-medium text-gray-900 mt-1">
                            {formatCurrency(booking.payment.amount)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentBadge 
                          status={booking.payment.status} 
                          method={booking.payment.method} 
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(booking.payment.paymentTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.booking.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy vé nào</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Hãy thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc của bạn
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">{filteredBookings.length}</span> trong tổng số{' '}
            <span className="font-medium">{bookingsData.length}</span> vé
          </div>
          <div className="text-sm text-gray-500">
            Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;