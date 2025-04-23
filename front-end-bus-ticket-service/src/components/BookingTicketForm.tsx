
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTripById } from '../services/apiServices';
import { useSelector } from 'react-redux';
import FailureNotification from './FailureNotification';
import SeatItem from './SeatItem';

const BookingTicketForm = () => {
  const [searchParams] = useSearchParams();

  // Trip ID
  const tripID = searchParams.get('id');

  // Modal
  const [failureModal, setFailureModal] = useState(false);
  const [message, setMessage] = useState('');

  // Trip data
  const [price, setPrice] = useState(0);
  const [start_time, setStartTime] = useState('');
  const [route, setRoute] = useState('');
  const [vehicle_type, setVehicleType] = useState('');
  const [booked_seats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // User data
  const user = useSelector((state: any) => state.user.account);
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
  const [fullname, setFullname] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      setFullname(user.username);
      setPhoneNumber(user.phone_number);
      setEmail(user.email);
    }
    getTrip();
  }, []);

  // Get trip information
  const getTrip = async () => {
    try {
      const res = await getTripById(tripID?.toString() || '');
      setPrice(res.data.routes.price);
      setStartTime(
        new Date(res.data.trip_date).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).replace(',', '')
      );
      setRoute(res.data.routes.origin + ' - ' + res.data.routes.destination);
      setVehicleType(res.data.vehicle_type);
      setBookedSeats(res.data.booked_seats || []);
	  console.log('booked_seats', res.data.booked_seats);
	  console.log('vehicle_type', res.data.vehicle_type);
    } catch (error) {
      console.error('Error fetching trip:', error);
    }
  };

  // Handle seat selection
  const handleSeatSelect = (seatCode: any) => {
	// Check if the seat is already booked or selected
    if (booked_seats.includes(seatCode)) return;

	// Check if the seat is over the limit of 5 seats
	if(selectedSeats.length >= 5 && !selectedSeats.includes(seatCode)) {
		setMessage('Vượt quá số lượng ghế cho phép');
		openFailureModal();
		return;
	}

	// Toggle seat selection
	setSelectedSeats(prev => {
		// Add or remove the seat code from the selectedSeats array
		const newSelectedSeats = prev.includes(seatCode)
		  ? prev.filter(s => s !== seatCode)
		  : [...prev, seatCode];
	  
		// Always sort the selected seats in ascending order
		return newSelectedSeats.sort((a, b) => {
		  const numA = parseInt(a.slice(1)); 
		  const numB = parseInt(b.slice(1)); 
		  return numA - numB; 
		});
	  });
	  
  };

  // Payment function
  const handlePayment = async () => {
	const phoneRegex = /^[0-9]{10}$/;  
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
	
	if (!fullname.trim() || !phone_number.trim() || !email.trim()) {
	  setMessage('Vui lòng điền đầy đủ thông tin khách hàng');
	  openFailureModal();
	  return;
	}
	
	if (!phoneRegex.test(phone_number)) {
	  setMessage('Số điện thoại phải có 10 chữ số');
	  openFailureModal();
	  return;
	}
	
	if (!emailRegex.test(email)) {
	  setMessage('Email không hợp lệ');
	  openFailureModal();
	  return;
	}
    if (selectedSeats.length === 0) {
      setMessage('Bạn chưa chọn ghế');
      openFailureModal();
      return;
    }

    // const body = {
    //   trip_id: tripID,
    //   customer_id: user?.id || '',
    //   seat: selectedSeats.join(','),
    //   price: price,
    //   quantity: selectedSeats.length,
    //   amount: price * selectedSeats.length,
    //   language: 'vn',
    // };

    // try {
    //   const token = sessionStorage.getItem('token');
    //   const res = await axios.post(API_URL + `customer/payment`, body, {
    //     headers: { Authorization: `Bearer ${token}` }
    //   });
      
    //   if (res.status === 200) {
    //     window.location.href = res.data;
    //   }
    // } catch (err) {
    //   setMessage(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán');
    //   openFailureModal();
    // }
  };

  // Generate seat layout based on vehicle type
  const renderSeats = () => {
	const isLimousine = vehicle_type === 'limousine';
	const isStandard = vehicle_type === 'standard';
  
	if (!isLimousine && !isStandard) return null;
  
	const seatLayout = isLimousine
	  ? {
		  stairs: [
			['A01', 'A03', 'A06', 'A09', 'A12', 'A15'],
			['', 'A04', 'A07', 'A10', 'A13', 'A16'],
			['A02', 'A05', 'A08', 'A11', 'A14', 'A17'],
			['B01', 'B03', 'B06', 'B09', 'B12', 'B15'],
			['', 'B04', 'B07', 'B11', 'B13', 'B16'],
			['B02', 'B05', 'B08', 'B10', 'B14', 'B17'],
		  ],
		  
		}
	  : {
		stairs: [
			['A01', 'A04', 'A07', 'A10', 'A13', 'A16'],
			['A02', 'A05', 'A08', 'A11', 'A14', 'A17'],
			['A03', 'A06', 'A09', 'A12', 'A15', 'A18'],
			['B01', 'B04', 'B07', 'B10', 'B13', 'B16'],
			['B02', 'B05', 'B08', 'B11', 'B14', 'B17'],
			['B03', 'B06', 'B09', 'B12', 'B15', 'B18'],
		  ],
		};
  
	const renderSeatGroup = (seatCodes: string[], groupIndex: number) => (
	  <div className="flex flex-col gap-2" key={`group-${groupIndex}`}>
		{seatCodes.map((code:string, idx:any) =>
		  code ? (
			<SeatItem
			  key={code}
			  seatCode={code}
			  isBooked={booked_seats.includes(code)}
			  isSelected={selectedSeats.includes(code)}
			  onClick={handleSeatSelect}
			/>
		  ) : (
			<div key={`blank-${groupIndex}-${idx}`} className="w-10 h-10" />
		  )
		)}
	  </div>
	);
  
	const renderFloor = (layout: string[][]) => (
	  <section>
		<div className="flex justify-center gap-4">
  			<h4 className="text-lg font-medium mb-3 w-1/2 text-center">Tầng dưới</h4>
  			<h4 className="text-lg font-medium mb-3 w-1/2 text-center">Tầng trên</h4>
		</div>

		<div className="flex gap-8">
		  {layout.map((group, index) => renderSeatGroup(group, index))}
		</div>
	  </section>
	);
  
	return (
	  <div className="flex flex-col gap-8">
		{renderFloor(seatLayout.stairs)}
	  </div>
	);
  };

  // Modal functions
  const closeFailureModal = () => setFailureModal(false);
  const openFailureModal = () => setFailureModal(true);

  return (
    <div className="w-full bg-slate-50 lg:p-10">
      <div className="flex max-w-screen-lg flex-col md:flex-row mx-auto gap-8">
        {/* Left Column */}
        <div className="basis-2/3 w-full flex flex-col gap-5">
          {/* Seat Selection Section */}
          <div className="seat-section bg-white rounded-t-xl p-5 border border-slate-200">
            <h3 className="text-xl font-medium">Chọn ghế</h3>
            <div className="flex flex-row mt-5 gap-8">
              {renderSeats()}
              
              <div className="flex flex-col gap-3 text-sm">
                <span className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded bg-[#D5D9DD] border-[#C0C6CC]"></div>
                  Đã bán
                </span>
                <span className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded bg-[#DEF3FF] border-[#96C5E7]"></div>
                  Còn trống
                </span>
                <span className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded bg-[#FDEDE8] border-[#F8BEAB]"></div>
                  Đang chọn
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="user-info-section bg-white border border-slate-200 p-5">
            <div className="flex flex-row gap-8">
              <div className="basis-1/2 w-full">
                <h3 className="text-xl font-semibold">Thông tin khách hàng</h3>
                <form action="" className="mt-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={phone_number}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="basis-1/2 w-full">
                <h3 className="text-red-500 text-center mb-5 font-semibold">ĐIỀU KHOẢN & LƯU Ý</h3>
                <p className="text-[15px] text-justify mb-3 font-[500] leading-6">
                  (*) Quý khách vui lòng có mặt tại bến xuất phát của xe trước ít nhất 30 phút giờ xe
                  khởi hành, mang theo thông báo đã thanh toán vé thành công có chứa mã vé được gửi từ
                  hệ thống FUTA BUS LINE. Vui lòng liên hệ Trung tâm tổng đài{' '}
                  <span className="text-red-500">1900 6067</span> để được hỗ trợ.
                </p>
                <p className="text-[15px] text-justify font-[500] leading-6">
                  (*) Nếu quý khách có nhu cầu trung chuyển, vui lòng liên hệ Tổng đài trung chuyển{' '}
                  <span className="text-red-500">1900 6918</span> trước khi đặt vé. Chúng tôi không
                  đón/trung chuyển tại những điểm xe trung chuyển không thể tới được.
                </p>
              </div>
            </div>
            <div className="mt-5 text-sm font-[400]">
              <input type="checkbox" required />
              <span>
                <span className="cursor-pointer text-red-500 underline ml-3">Chấp nhận điều khoản</span>{' '}
                đặt vé &amp; chính sách bảo mật thông tin của FUTABusline
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="basis-1/3 w-full flex flex-col gap-y-5">
          {/* Trip Information */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <h3 className="text-xl font-medium">Thông tin lượt đi</h3>
            <div className="mt-4 flex justify-between">
              <span className="text-slate-500">Tuyến xe</span>
              <span className="text-right font-medium">{route}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-500">Thời gian xuất bến</span>
              <span className="text-green-500 font-medium">{start_time}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-500">Số lượng ghế</span>
              <span className="font-semibold">{selectedSeats.length} Ghế</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-500">Số ghế</span>
              <span className="text-green-500 font-medium">{selectedSeats.join(', ')}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-500">Tổng tiền lượt đi</span>
              <span className="text-green-500 font-medium">
                {((price * selectedSeats.length) / 1000).toLocaleString() + '.000'} đ
              </span>
            </div>
          </div>

          {/* Price Details */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="flex flex-row items-center gap-x-3">
              <h3 className="text-xl font-medium">Chi tiết giá</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-7 h-7 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-slate-500">Giá vé lượt đi</span>
              <span className="text-red-500 font-medium">
                {((price * selectedSeats.length) / 1000).toLocaleString() + '.000'} đ
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-500">Phí thanh toán</span>
              <span className="font-medium">0đ</span>
            </div>
            <hr className="my-3" />
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tổng tiền</span>
              <span className="text-red-500 font-medium">
                {((price * selectedSeats.length) / 1000).toLocaleString() + '.000'} đ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="mt-5 flex max-w-screen-lg flex-col md:flex-row mx-auto gap-8">
        <div className="md:basis-2/3 w-full gap-5 payment-section bg-white border border-slate-200 p-5 rounded-b-xl flex items-center">
          <div className="flex flex-col">
            <span className="mt-2 text-2xl font-medium text-black">
              {((price * selectedSeats.length) / 1000).toLocaleString() + '.000'} đ
            </span>
          </div>
          <div className="flex flex-auto items-center justify-end">
            <button
              type="button"
              className="px-5 py-2 text-white rounded-full mr-6 bg-red-500 hover:bg-red-600 transition-all"
              onClick={handlePayment}
            >
              <span className="text-sm font-medium">Thanh toán</span>
            </button>
          </div>
        </div>
        <div className="basis-1/3 gap-5"></div>
      </div>

      {/* Failure Notification Modal */}
      {failureModal && (
        <FailureNotification
          func={{ closeModal: closeFailureModal }}
          message={message}
        />
      )}
    </div>
  );
};

export default BookingTicketForm;