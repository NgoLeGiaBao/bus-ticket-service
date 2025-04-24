import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Seat {
  number: string;
  status: 'available' | 'booked' | 'selected';
  type: 'normal' | 'vip' | 'window' | 'aisle';
}

interface Trip {
  id: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  price: number;
  availableSeats: number;
  seats: Seat[];
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  note: string;
}

const BookingSupport: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    isRoundTrip: false,
    passengerCount: 1
  });
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    note: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Mock data - In a real app, this would come from API
  const generateMockTrips = (): Trip[] => [
    {
      id: 't1',
      route: 'Hồ Chí Minh → Hà Nội',
      departureTime: '2025-04-29T08:00:00',
      arrivalTime: '2023-04-30T05:00:00',
      busType: 'Giường nằm VIP',
      price: 600000,
      availableSeats: 12,
      seats: generateSeats(36, ['1A', '2A', '3B', '4C', '5D'])
    },
    {
      id: 't2',
      route: 'Hồ Chí Minh → Đà Nẵng',
      departureTime: '2025-04-29T08:00:00',
      arrivalTime: '2023-04-30T05:00:00',
      busType: 'Giường nằm đời mới',
      price: 350000,
      availableSeats: 8,
      seats: generateSeats(32, ['1A', '2B', '3C', '4D'])
    }
  ];

  const generateSeats = (totalSeats: number, bookedSeats: string[]): Seat[] => {
    const seats: Seat[] = [];
    const rows = Math.ceil(totalSeats / 4);
    
    for (let row = 1; row <= rows; row++) {
      const seatLetters = ['A', 'B', 'C', 'D'];
      
      for (const letter of seatLetters) {
        const seatNumber = `${row}${letter}`;
        if (seats.length < totalSeats) {
          seats.push({
            number: seatNumber,
            status: bookedSeats.includes(seatNumber) ? 'booked' : 'available',
            type: getSeatType(seatNumber)
          });
        }
      }
    }
    
    return seats;
  };

  const getSeatType = (seatNumber: string): Seat['type'] => {
    const seatLetter = seatNumber.slice(-1);
    const row = parseInt(seatNumber.slice(0, -1));
    
    if (row === 1) return 'vip';
    if (seatLetter === 'A' || seatLetter === 'D') return 'window';
    return 'aisle';
  };

  const handleSearch = () => {
    // Filter trips based on search criteria
    const filteredTrips = generateMockTrips().filter(trip => {
      const matchesRoute = trip.route.includes(`${searchParams.origin} → ${searchParams.destination}`);
      const matchesDate = new Date(trip.departureTime).toDateString() === 
                         new Date(searchParams.departureDate).toDateString();
      return matchesRoute && matchesDate && trip.availableSeats >= searchParams.passengerCount;
    });
    
    setAvailableTrips(filteredTrips);
    setCurrentStep(2);
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
  };

  const handleSelectSeat = (seat: Seat) => {
    if (seat.status !== 'available') return;
    
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.number === seat.number);
      if (isSelected) {
        return prev.filter(s => s.number !== seat.number);
      } else {
        if (prev.length < searchParams.passengerCount) {
          return [...prev, { ...seat, status: 'selected' }];
        }
        return prev;
      }
    });
  };

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setBookingSuccess(true);
      setCurrentStep(4);
    }, 1500);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const calculateTotal = () => {
    if (!selectedTrip) return 0;
    return selectedTrip.price * selectedSeats.length;
  };

  const renderSearchForm = () => (
    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tìm chuyến xe</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Điểm đi</label>
          <select
            value={searchParams.origin}
            onChange={(e) => setSearchParams({...searchParams, origin: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn điểm đi</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Điểm đến</label>
          <select
            value={searchParams.destination}
            onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn điểm đến</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Ngày đi</label>
          <input
            type="date"
            value={searchParams.departureDate}
            onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {searchParams.isRoundTrip && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Ngày về</label>
            <input
              type="date"
              value={searchParams.returnDate}
              onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
              min={searchParams.departureDate || new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Số hành khách</label>
          <select
            value={searchParams.passengerCount}
            onChange={(e) => setSearchParams({...searchParams, passengerCount: Number(e.target.value)})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} {num > 1 ? 'người' : 'người'}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="roundTrip"
          checked={searchParams.isRoundTrip}
          onChange={() => setSearchParams({...searchParams, isRoundTrip: !searchParams.isRoundTrip})}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="roundTrip" className="ml-2 text-gray-700">Vé khứ hồi</label>
      </div>
      
      <button
        onClick={handleSearch}
        disabled={!searchParams.origin || !searchParams.destination || !searchParams.departureDate}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
          (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        Tìm chuyến xe
      </button>
    </div>
  );

  const renderTripSelection = () => (
    <div className="space-y-6">
      <button 
        onClick={() => setCurrentStep(1)}
        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Quay lại tìm chuyến
      </button>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chọn chuyến xe</h2>
        
        {availableTrips.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Không tìm thấy chuyến xe phù hợp</p>
            <button 
              onClick={() => setCurrentStep(1)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Thử tìm kiếm lại
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {availableTrips.map(trip => {
              const depTime = formatDateTime(trip.departureTime);
              const arrTime = formatDateTime(trip.arrivalTime);
              
              return (
                <div 
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip)}
                  className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedTrip?.id === trip.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="mb-3 md:mb-0">
                      <h3 className="font-semibold text-lg">{trip.route}</h3>
                      <p className="text-gray-600">
                        {depTime.time} - {arrTime.time} ({arrTime.date})
                      </p>
                      <p className="text-sm text-gray-500">{trip.busType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-blue-600">
                        {trip.price.toLocaleString('vi-VN')}₫
                      </p>
                      <p className="text-sm text-gray-500">
                        {trip.availableSeats} ghế trống
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedTrip && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chọn ghế</h2>
          
          <div className="mb-6">
            <p className="font-semibold text-gray-800">
              {selectedTrip.route} - {formatDateTime(selectedTrip.departureTime).date}
            </p>
            <p className="text-gray-600">
              {selectedTrip.busType} • Giá vé: {selectedTrip.price.toLocaleString('vi-VN')}₫/ghế
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-4 gap-3 mb-6">
              {selectedTrip.seats.map(seat => (
                <button
                  key={seat.number}
                  onClick={() => handleSelectSeat(seat)}
                  disabled={seat.status === 'booked'}
                  className={`p-3 rounded-lg text-center font-medium transition-all duration-200 ${
                    seat.status === 'booked' 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : seat.status === 'selected'
                        ? 'bg-blue-600 text-white shadow-md'
                        : seat.type === 'vip'
                          ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                          : seat.type === 'window'
                            ? 'bg-green-100 hover:bg-green-200 text-gray-800'
                            : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {seat.number}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                <span>Đã đặt</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                <span>Ghế VIP</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded-full mr-2 border border-gray-300"></div>
                <span>Ghế cửa sổ</span>
              </div>
            </div>
          </div>
          
          {selectedSeats.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-gray-800">
                Ghế đã chọn: <span className="text-blue-600">{selectedSeats.map(s => s.number).join(', ')}</span>
              </p>
              <p className="font-bold text-xl mt-2">
                Tổng tiền: <span className="text-blue-600">{calculateTotal().toLocaleString('vi-VN')}₫</span>
              </p>
            </div>
          )}
          
          <button
            onClick={() => setCurrentStep(3)}
            disabled={selectedSeats.length !== searchParams.passengerCount}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
              selectedSeats.length !== searchParams.passengerCount
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <button 
        onClick={() => setCurrentStep(2)}
        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Quay lại chọn ghế
      </button>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin đặt vé</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin chuyến đi</h3>
            {selectedTrip && (
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-600 w-24">Tuyến:</span>
                  <span className="font-medium">{selectedTrip.route}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24">Ngày đi:</span>
                  <span>{formatDateTime(selectedTrip.departureTime).date}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24">Giờ đi:</span>
                  <span>{formatDateTime(selectedTrip.departureTime).time}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24">Loại xe:</span>
                  <span>{selectedTrip.busType}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24">Ghế:</span>
                  <span className="font-medium text-blue-600">{selectedSeats.map(s => s.number).join(', ')}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24">Tổng tiền:</span>
                  <span className="font-bold text-blue-600">{calculateTotal().toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khách hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên*</label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại*</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  name="note"
                  value={customerInfo.note}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full mb-2 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">M</span>
                </div>
                <span>Ví Momo</span>
              </div>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full mb-2 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">Z</span>
                </div>
                <span>ZaloPay</span>
              </div>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full mb-2 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span>Chuyển khoản</span>
              </div>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full mb-2 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span>Tiền mặt</span>
              </div>
            </button>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
            <div className="flex">
              <div className="flex-shrink-0 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium text-yellow-800">Lưu ý quan trọng</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Vé sau khi đặt không được hủy/hay đổi. Vui lòng kiểm tra kỹ thông tin trước khi thanh toán.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={!customerInfo.name || !customerInfo.phone}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
              (!customerInfo.name || !customerInfo.phone)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Thanh toán {calculateTotal().toLocaleString('vi-VN')}₫
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessPage = () => (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto text-center">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt vé thành công!</h2>
      <p className="text-gray-600 mb-6">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
      
      {selectedTrip && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Thông tin vé</h3>
          <div className="space-y-3">
            <div className="flex">
              <span className="text-gray-600 w-32">Mã đặt chỗ:</span>
              <span className="font-medium">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Tuyến:</span>
              <span>{selectedTrip.route}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Ngày đi:</span>
              <span>{formatDateTime(selectedTrip.departureTime).date}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Giờ đi:</span>
              <span>{formatDateTime(selectedTrip.departureTime).time}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Ghế:</span>
              <span className="font-medium text-blue-600">{selectedSeats.map(s => s.number).join(', ')}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Tổng tiền:</span>
              <span className="font-bold text-blue-600">{calculateTotal().toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Về trang chủ
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          In vé
        </button>
      </div>
    </div>
  );

  const renderStepper = () => (
    <div className="mb-8">
      <div className="flex justify-center">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep === stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : currentStep > stepNumber 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-16 h-1 ${
                  currentStep > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-3 px-4 sm:px-16">
        <span className={`text-sm ${currentStep === 1 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Tìm chuyến</span>
        <span className={`text-sm ${currentStep === 2 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Chọn ghế</span>
        <span className={`text-sm ${currentStep === 3 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Thanh toán</span>
        <span className={`text-sm ${currentStep === 4 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Hoàn tất</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Đặt vé xe khách</h1>
        <p className="text-center text-gray-600 mb-8">Đặt vé nhanh chóng - Tiện lợi - An toàn</p>
        
        {renderStepper()}
        
        {currentStep === 1 && renderSearchForm()}
        {currentStep === 2 && renderTripSelection()}
        {currentStep === 3 && renderPaymentForm()}
        {currentStep === 4 && renderSuccessPage()}
      </div>
    </div>
  );
};

export default BookingSupport;