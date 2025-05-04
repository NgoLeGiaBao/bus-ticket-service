import React, { useState } from 'react';
import { 
  changeSeatRequestFromCustomer, 
  getTripByRouteId, 
  lookupTicketByPhone, 
  updatePaymentStatusSuccess
} from '../../services/apiServices';
import { ChangeSeatRequest } from '../../interfaces/Reservation';

interface Ticket {
  id: string;
  bookingCode: string;
  passengerName: string;
  phoneNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  seatNumbers: string[];
  route_id: string;
  trip_id: string;
  status: 'confirmed' | 'used' | 'cancelled';
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentId: string;
  paymentMethod: string;
  amount: number;
  email: string | null;
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

const generateAllSeats = (vehicleType: string): string[] => {
  if (vehicleType === 'limousine') {
    const rows = ['A', 'B'];
    const seats = [];
    for (const row of rows) {
      for (let i = 1; i <= 17; i++) {
        seats.push(`${row}${i.toString().padStart(2, '0')}`);
      }
    }
    return seats;
  } else {
    const rows = ['A', 'B'];
    const seats = [];
    for (const row of rows) {
      for (let i = 1; i <= 18; i++) {
        seats.push(`${row}${i.toString().padStart(2, '0')}`);
      }
    }
    return seats;
  }
};

const TicketExchange: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerTickets, setCustomerTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [ticketToConfirmPayment, setTicketToConfirmPayment] = useState<Ticket | null>(null);

  const handleSearch = async () => {
    try {
      const res = await lookupTicketByPhone(phoneNumber);
      if (res.success) {
        const mappedTickets: Ticket[] = res.data.map((item) => ({
          id: item.booking.id,
          bookingCode: item.booking.id,
          passengerName: item.booking.customerName,
          phoneNumber: item.booking.phoneNumber,
          origin: item.trip.origin,
          destination: item.trip.destination,
          departureTime: item.trip.tripDate,
          seatNumbers: item.booking.seatNumbers,
          route_id: item.trip.routeId,
          trip_id: item.booking.tripId,
          status: item.booking.status === 'Booked' ? 'confirmed' : 
                  item.booking.status === 'Cancelled' ? 'cancelled' : 'used',
          paymentStatus: item.payment.status.toLowerCase() as 'pending' | 'success' | 'failed',
          paymentId: item.payment.id,
          paymentMethod: item.payment.method,
          amount: item.payment.amount,
          email: item.booking.email
        }));
        setCustomerTickets(mappedTickets);
      }
    } catch (error) {
      console.error('Error searching tickets:', error);
      setAlertMessage('Có lỗi xảy ra khi tìm kiếm vé');
      setShowAlertModal(true);
    } finally {
      setSelectedTicket(null);
      setSelectedTrip(null);
      setSelectedSeats([]);
    }
  };

  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedSeats([]);
    
    try {
      const res = await getTripByRouteId(ticket.route_id);
      if (res.success && res.data) {
        const tripsForExchange = res.data.filter(
          (trip) => trip.status === 'scheduled'
        );
        setAvailableTrips(tripsForExchange);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setAlertMessage('Có lỗi xảy ra khi tải danh sách chuyến');
      setShowAlertModal(true);
    }
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
  };

  const handleSelectSeat = (seat: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      } else {
        if (prev.length < (selectedTicket?.seatNumbers.length || 0)) {
          return [...prev, seat];
        }
        return prev;
      }
    });
  };

  const handleExchange = async () => {
    if (!selectedTicket || !selectedTrip || selectedSeats.length === 0) return;
    
    try {
      const dataExchange: ChangeSeatRequest = {
        bookingId: selectedTicket.id,
        oldTripId: selectedTicket.trip_id,
        oldSeatNumbers: selectedTicket.seatNumbers,
        newTripId: selectedTrip.id,
        newSeatNumbers: selectedSeats
      };
      
      const res = await changeSeatRequestFromCustomer(dataExchange);
      if (res.success) {
        setExchangeSuccess(true);
        setShowConfirmModal(false);
        setCustomerTickets(customerTickets.filter(t => t.id !== selectedTicket.id));
      } else {
        setAlertMessage(`Đổi vé thất bại: ${res.message || 'Vui lòng thử lại'}`);
        setShowAlertModal(true);
      }
    } catch (error) {
      console.error('Error exchanging ticket:', error);
      setAlertMessage('Có lỗi xảy ra khi đổi vé');
      setShowAlertModal(true);
    } finally {
      setSelectedTicket(null);
      setAvailableTrips([]);
      setSelectedTrip(null);
      setSelectedSeats([]);
    }
  };

  const handlePrintTicket = (ticket: Ticket) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Vé xe ${ticket.bookingCode}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .ticket { border: 1px solid #000; padding: 15px; max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 15px; }
              .details { margin-bottom: 10px; }
              .footer { text-align: center; margin-top: 15px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <h2>VÉ XE KHÁCH</h2>
                <p>Mã vé: ${ticket.bookingCode}</p>
              </div>
              <div class="details">
                <p><strong>Hành khách:</strong> ${ticket.passengerName}</p>
                <p><strong>Tuyến:</strong> ${ticket.origin} → ${ticket.destination}</p>
                <p><strong>Ngày giờ:</strong> ${formatDateTime(ticket.departureTime).date} ${formatDateTime(ticket.departureTime).time}</p>
                <p><strong>Ghế:</strong> ${ticket.seatNumbers.join(', ')}</p>
                <p><strong>Tổng tiền:</strong> ${ticket.amount.toLocaleString('vi-VN')}đ</p>
              </div>
              <div class="footer">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ</p>
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleOpenConfirmPayment = (ticket: Ticket) => {
    if (ticket.paymentStatus !== 'pending') return;
    setTicketToConfirmPayment(ticket);
    setShowConfirmPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!ticketToConfirmPayment) return;
    
    try {
      const res = await updatePaymentStatusSuccess(ticketToConfirmPayment.bookingCode);
      if (res.success) {
        setCustomerTickets(customerTickets.map(t => 
          t.id === ticketToConfirmPayment.id ? {...t, paymentStatus: 'success'} : t
        ));
        setAlertMessage('Xác nhận thanh toán thành công!');
        setShowAlertModal(true);
      } else {
        setAlertMessage(`Xác nhận thanh toán thất bại: ${res.message || 'Vui lòng thử lại'}`);
        setShowAlertModal(true);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setAlertMessage('Có lỗi xảy ra khi xác nhận thanh toán');
      setShowAlertModal(true);
    } finally {
      setShowConfirmPaymentModal(false);
      setTicketToConfirmPayment(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getAvailableSeatsForDisplay = (trip: Trip): string[] => {
    const allSeats = generateAllSeats(trip.vehicle_type);
    return allSeats.filter(seat => !trip.booked_seats.includes(seat));
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Thanh toán lỗi</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hỗ trợ đổi vé</h1>

      {/* Search by phone number */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại khách hàng
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">+84</span>
              </div>
              <input
                type="tel"
                id="phone"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="912345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors h-10"
            >
              Tra cứu
            </button>
          </div>
        </div>
      </div>

      {/* Customer's tickets */}
      {customerTickets.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Danh sách vé</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {customerTickets.map((ticket) => {
              const time = formatDateTime(ticket.departureTime);
              const isPending = ticket.paymentStatus === 'pending';
              
              return (
                <div
                  key={ticket.id}
                  className={`p-4 hover:bg-gray-50 ${selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => handleSelectTicket(ticket)}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{ticket.passengerName}</h3>
                        {getPaymentStatusBadge(ticket.paymentStatus)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {ticket.origin} → {ticket.destination}
                      </p>
                      <p className="text-sm text-gray-600">
                        {time.date} - {time.time} | 
                        Ghế: {ticket.seatNumbers.join(', ')} ({ticket.seatNumbers.length} vé)
                      </p>
                      <p className="text-sm text-gray-600">
                        Giá vé: {ticket.amount.toLocaleString('vi-VN')}đ | 
                        Phương thức: {ticket.paymentMethod}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {ticket.bookingCode}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintTicket(ticket);
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
                        >
                          In vé
                        </button>
                        {isPending && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConfirmPayment(ticket);
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                          >
                            Xác nhận TT
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available trips for exchange */}
      {selectedTicket && availableTrips.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Chọn chuyến mới</h2>
            <p className="text-sm text-gray-500">
              Đổi {selectedTicket.seatNumbers.length} vé từ chuyến: {selectedTicket.origin} → {selectedTicket.destination} -{' '}
              {formatDateTime(selectedTicket.departureTime).date}{' '}
              {formatDateTime(selectedTicket.departureTime).time}
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {availableTrips.map((trip) => {
              const time = formatDateTime(trip.trip_date);
              const availableSeats = getAvailableSeatsForDisplay(trip);
              
              return (
                <div
                  key={trip.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedTrip?.id === trip.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectTrip(trip)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{trip.routes.origin} → {trip.routes.destination}</h3>
                      <p className="text-sm text-gray-600">
                        {time.date} - {time.time}
                      </p>
                      <p className="text-sm text-gray-600">
                        Loại xe: {trip.vehicle_type} | Giá: {trip.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {availableSeats.length} ghế trống
                      </span>
                    </div>
                  </div>

                  {/* Seat selection */}
                  {selectedTrip?.id === trip.id && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Chọn {selectedTicket.seatNumbers.length} ghế mới (hiện tại: {selectedTicket.seatNumbers.join(', ')})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {availableSeats.map((seat) => (
                          <button
                            key={seat}
                            type="button"
                            className={`px-3 py-1 rounded-md text-sm ${
                              selectedSeats.includes(seat)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            } ${
                              selectedSeats.length >= selectedTicket.seatNumbers.length && 
                              !selectedSeats.includes(seat) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSeat(seat);
                            }}
                            disabled={
                              selectedSeats.length >= selectedTicket.seatNumbers.length && 
                              !selectedSeats.includes(seat)
                            }
                          >
                            {seat}
                          </button>
                        ))}
                      </div>
                      {selectedSeats.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                          Đã chọn: {selectedSeats.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Exchange button */}
          {selectedTrip && selectedSeats.length === selectedTicket.seatNumbers.length && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Xác nhận đổi {selectedTicket.seatNumbers.length} vé
              </button>
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {customerTickets.length === 0 && phoneNumber && (
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-600">Không tìm thấy vé nào cho số điện thoại này</p>
        </div>
      )}

      {/* Confirm Exchange Modal */}
      {showConfirmModal && selectedTicket && selectedTrip && selectedSeats.length === selectedTicket.seatNumbers.length && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Xác nhận đổi {selectedTicket.seatNumbers.length} vé</h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium">Thông tin vé hiện tại</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>Mã đặt chỗ: {selectedTicket.bookingCode}</p>
                  <p>Hành khách: {selectedTicket.passengerName}</p>
                  <p>Tuyến: {selectedTicket.origin} → {selectedTicket.destination}</p>
                  <p>Ngày giờ: {formatDateTime(selectedTicket.departureTime).date} -{' '}
                    {formatDateTime(selectedTicket.departureTime).time}</p>
                  <p>Ghế: {selectedTicket.seatNumbers.join(', ')}</p>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium">Thông tin vé mới</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>Tuyến: {selectedTrip.routes.origin} → {selectedTrip.routes.destination}</p>
                  <p>Ngày giờ: {formatDateTime(selectedTrip.trip_date).date} -{' '}
                    {formatDateTime(selectedTrip.trip_date).time}</p>
                  <p>Loại xe: {selectedTrip.vehicle_type}</p>
                  <p>Giá vé: {selectedTrip.price.toLocaleString('vi-VN')}đ</p>
                  <p>Ghế mới: {selectedSeats.join(', ')}</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-700">
                <div className="flex">
                  <div className="flex-shrink-0">⚠️</div>
                  <div className="ml-3">
                    <p>Phí đổi vé: 10% giá vé hoặc tối thiểu 50.000đ/vé</p>
                    <p className="mt-1 font-medium">Vé sau khi đổi không được hủy/hay đổi tiếp</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleExchange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Xác nhận đổi vé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {exchangeSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              ✓
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Đổi vé thành công!</h2>
            <div className="mt-4">
              <button
                onClick={() => {
                  setExchangeSuccess(false);
                  setPhoneNumber('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thông báo</h2>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p>{alertMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirmPaymentModal && ticketToConfirmPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Xác nhận thanh toán</h2>
              <button
                onClick={() => setShowConfirmPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p>Xác nhận thanh toán cho vé {ticketToConfirmPayment.bookingCode}?</p>
              <p className="mt-2">Số tiền: {ticketToConfirmPayment.amount.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

export default TicketExchange;