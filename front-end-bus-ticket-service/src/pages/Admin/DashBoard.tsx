import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  // Mock data
  const stats = {
    totalBookings: 1245,
    activeTrips: 28,
    availableBuses: 15,
    staffOnDuty: 42,
    recentBookings: [
      { id: 'BK1001', route: 'Hà Nội - Hồ Chí Minh', date: '15/06/2023', status: 'confirmed', seats: 32 },
      { id: 'BK1002', route: 'Đà Nẵng - Nha Trang', date: '15/06/2023', status: 'pending', seats: 28 },
      { id: 'BK1003', route: 'Hải Phòng - Quảng Ninh', date: '14/06/2023', status: 'completed', seats: 45 },
      { id: 'BK1004', route: 'Hồ Chí Minh - Đà Lạt', date: '14/06/2023', status: 'cancelled', seats: 0 },
    ],
    upcomingTrips: [
      { id: 'TR1001', route: 'Hà Nội - Hải Phòng', departure: '16/06/2023 08:00', driver: 'Nguyễn Văn A', bus: '51B-12345' },
      { id: 'TR1002', route: 'Hồ Chí Minh - Vũng Tàu', departure: '16/06/2023 07:30', driver: 'Trần Thị B', bus: '51G-67890' },
      { id: 'TR1003', route: 'Đà Nẵng - Huế', departure: '16/06/2023 09:15', driver: 'Lê Văn C', bus: '43A-54321' },
    ],
    performance: {
      bookingRate: '+12.5%',
      revenue: '245,000,000₫',
      occupancy: '78%'
    }
  };

  // Status colors mapping
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Status labels
  const statusLabels = {
    confirmed: 'Đã xác nhận',
    pending: 'Chờ thanh toán',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Cập nhật lúc: 10:30, 15/06/2023</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Booking Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="px-5 py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500/10 p-3 rounded-lg">
                  <span className="text-blue-600 text-xl font-bold">V</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Tổng đặt vé</h3>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalBookings.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <Link 
                  to="/quan-ly-dat-ve" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center"
                >
                  Xem tất cả
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trips Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="px-5 py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500/10 p-3 rounded-lg">
                  <span className="text-green-600 text-xl font-bold">C</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Chuyến xe hoạt động</h3>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.activeTrips}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <Link 
                  to="/dieu-phoi-chuyen-xe" 
                  className="text-sm font-medium text-green-600 hover:text-green-500 inline-flex items-center"
                >
                  Xem tất cả
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Buses Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="px-5 py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500/10 p-3 rounded-lg">
                  <span className="text-purple-600 text-xl font-bold">X</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Xe khả dụng</h3>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.availableBuses}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <Link 
                  to="/phan-cong-tuyen" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-500 inline-flex items-center"
                >
                  Xem tất cả
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="px-5 py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-500/10 p-3 rounded-lg">
                  <span className="text-amber-600 text-xl font-bold">H</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Hiệu suất</h3>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.performance.occupancy}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">
                  Doanh thu: <span className="font-medium">{stats.performance.revenue}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Đặt vé gần đây</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã vé
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tuyến đường
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghế
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Chi tiết</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.route}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.seats}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/quan-ly-dat-ve/${booking.id}`} 
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          Chi tiết
                          <span className="ml-1">→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right">
              <Link 
                to="/quan-ly-dat-ve" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                Xem tất cả đặt vé
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Chuyến xe sắp khởi hành</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.upcomingTrips.map((trip) => (
                <div key={trip.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{trip.route}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Khởi hành:</span> {trip.departure}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {trip.bus}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="truncate">Tài xế: {trip.driver}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right">
              <Link 
                to="/dieu-phoi-chuyen-xe" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                Xem lịch trình đầy đủ
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            <Link
              to="/quan-ly-dat-ve/tao-moi"
              className="group p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <span className="text-blue-600 text-lg font-bold group-hover:text-blue-700">V</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Tạo đặt vé</h3>
                  <p className="text-xs text-gray-500 mt-1">Thêm đặt vé mới</p>
                </div>
              </div>
            </Link>

            <Link
              to="/dieu-phoi-chuyen-xe/tao-moi"
              className="group p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <span className="text-green-600 text-lg font-bold group-hover:text-green-700">C</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-600">Tạo chuyến xe</h3>
                  <p className="text-xs text-gray-500 mt-1">Thêm chuyến xe mới</p>
                </div>
              </div>
            </Link>

            <Link
              to="/phan-cong-tuyen"
              className="group p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500/10 p-2 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <span className="text-purple-600 text-lg font-bold group-hover:text-purple-700">P</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-600">Phân công</h3>
                  <p className="text-xs text-gray-500 mt-1">Phân công xe/tài xế</p>
                </div>
              </div>
            </Link>

            <Link
              to="/quan-ly-nguoi-dung/tao-moi"
              className="group p-4 border border-gray-200 rounded-lg hover:border-amber-500 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-500/10 p-2 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                  <span className="text-amber-600 text-lg font-bold group-hover:text-amber-700">N</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-amber-600">Thêm nhân sự</h3>
                  <p className="text-xs text-gray-500 mt-1">Tạo tài khoản mới</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;