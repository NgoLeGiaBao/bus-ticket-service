import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDestinations, getAvailableTrips, supportedBooking, updatePaymentStatusSuccess, getDestinationsByOrigin, getAllRoutes } from '../../services/apiServices';
import { BookingRequest } from '../../interfaces/Reservation';
import dayjs from 'dayjs';

interface Seat {
  number: string;
  status: 'available' | 'booked' | 'selected';
  type: 'normal' | 'vip' | 'window' | 'aisle';
}

interface Subroute {
  id: string;
  origin: string;
  destination: string;
  price: number;
  duration: string;
}

interface Trip {
  id: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  price: number;
  currentPrice: number;
  availableSeats: number;
  seats: Seat[];
  booked_seats: string[];
  pickupPoints: string[];
  dropoffPoints: string[];
  origin: string;
  destination: string;
  duration: number;
  routeId: string;
  subroutes: Subroute[];
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  note: string;
}

interface Route {
  id: string;
  origin: string;
  destination: string;
  price: number;
  duration: string;
  subroutes: { relatedrouteid: string; sortorder: number }[];
}

const BookingSupport: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [startAddressSearchModalVisible, setStartAddressSearchModalVisible] = useState<boolean>(false);
  const [endAddressSearchModalVisible, setEndAddressSearchModalVisible] = useState<boolean>(false);
  const [startAddressSearchQuery, setStartAddressSearchQuery] = useState<string>('');
  const [endAddressSearchQuery, setEndAddressSearchQuery] = useState<string>('');
  const [failureModal, setFailureModal] = useState(false);
  const [message, setMessage] = useState('');
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);

  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: (function() {
      const now = new Date();
      now.setHours(now.getHours() + 7);
      return now.toISOString().split('T')[0];
    })(),
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

  const [paymentMethod, setPaymentMethod] = useState<string>('counter');
  const [bookId, setBookId] = useState<string>('');
  const [pickupPoints, setPickupPoints] = useState<string[]>([]);
  const [dropoffPoints, setDropoffPoints] = useState<string[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [selectedDropoff, setSelectedDropoff] = useState<string>('');

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const res = await getAllDestinations();
      if (res.success && Array.isArray(res.data)) {
        setAvailableProvinces(res.data);
        setAvailableDestinations(res.data);
      } else {
        setMessage('Không thể tải danh sách điểm đi/đến');
        setFailureModal(true);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setMessage('Đã xảy ra lỗi khi tải danh sách điểm đi/đến');
      setFailureModal(true);
    }
  };

  const fetchDestinationsByOrigin = async (origin: string) => {
    try {
      const res = await getDestinationsByOrigin(origin);
      setAvailableDestinations(res.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setMessage('Đã xảy ra lỗi khi tải danh sách điểm đến');
      setFailureModal(true);
    }
  };

  const fetchOriginsByDestination = async (destination: string) => {
    try {
      const res = await getDestinationsByOrigin(destination);
      setAvailableProvinces(res.data);
    } catch (error) {
      console.error('Error fetching origins:', error);
      setMessage('Đã xảy ra lỗi khi tải danh sách điểm đi');
      setFailureModal(true);
    }
  };

  const calculateSubroutePrice = (pickup: string, dropoff: string, trip: Trip): number => {
    if (!pickup || !dropoff || !trip.subroutes) {
      return trip.price;
    }

    const pickupLocation = pickup.split(' - ')[0];
    const dropoffLocation = dropoff.split(' - ')[0];

    const subroute = trip.subroutes.find(
      (sub) => sub.origin === pickupLocation && sub.destination === dropoffLocation
    );

    return subroute ? subroute.price : trip.price;
  };

  const handleSearch = async () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      setMessage('Vui lòng điền đầy đủ điểm đi, điểm đến và ngày đi');
      setFailureModal(true);
      return;
    }

    try {
      const [tripRes, routeRes] = await Promise.all([
        getAvailableTrips(searchParams.origin, searchParams.destination, searchParams.departureDate),
        getAllRoutes()
      ]);

      if (!routeRes.success || !routeRes.data) {
        setMessage('Không thể tải danh sách tuyến đường');
        setFailureModal(true);
        return;
      }

      setAllRoutes(routeRes.data);

      if (tripRes.success && tripRes.data) {
        const transformedTrips: Trip[] = tripRes.data.map((trip: any) => {
          const allSeats: Seat[] = [];
          const rows = ['A', 'B'];
          const cols = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];
          
          rows.forEach(row => {
            cols.forEach(col => {
              const seatNumber = `${row}${col}`;
              allSeats.push({
                number: seatNumber,
                status: trip.booked_seats.includes(seatNumber) ? 'booked' : 'available',
                type: getSeatType(seatNumber)
              });
            });
          });

          const selectedRouteId = trip.routes.id;
          const selectedRoute = routeRes.data.find((route: any) => route.id === selectedRouteId);

          if (!selectedRoute) {
            console.error('Không tìm thấy route đã chọn:', selectedRouteId);
            setMessage('Dữ liệu tuyến đường không hợp lệ');
            setFailureModal(true);
            return {
              id: trip.id,
              route: `${trip.routes.origin} → ${trip.routes.destination}`,
              departureTime: trip.trip_date,
              arrivalTime: calculateArrivalTime(trip.trip_date, trip.routes.duration),
              busType: trip.vehicle_type,
              price: trip.routes.price,
              currentPrice: trip.routes.price,
              availableSeats: trip.available_seats,
              seats: allSeats,
              booked_seats: trip.booked_seats || [],
              pickupPoints: [trip.routes.origin],
              dropoffPoints: [trip.routes.destination],
              origin: trip.routes.origin,
              destination: trip.routes.destination,
              duration: parseInt(trip.routes.duration),
              routeId: selectedRouteId,
              subroutes: []
            };
          }

          const subrouteInfoList = selectedRoute.subroutes?.map((subroute: any) => ({
            id: subroute.relatedrouteid,
            sortorder: subroute.sortorder || 0
          })) || [];

          const subroutes = subrouteInfoList
            .map((info: any) => routeRes.data.find((route: any) => route.id === info.id))
            .filter(Boolean)
            .map((sub: any) => ({
              id: sub.id,
              origin: sub.origin,
              destination: sub.destination,
              price: sub.price,
              duration: sub.duration
            }));

          const parentDepartureTime = dayjs(trip.trip_date);
          const parentDuration = parseInt(selectedRoute.duration);
          const parentArrivalTime = parentDepartureTime.add(parentDuration, 'hour');

          let pickupPoints: string[] = [];
          let dropoffPoints: string[] = [];

          // Prioritize parent route's origin and destination
          pickupPoints.push(`${selectedRoute.origin} - ${parentDepartureTime.format('HH:mm')}`);
          dropoffPoints.push(`${selectedRoute.destination} - ${parentArrivalTime.format('HH:mm')}`);

          // Add subroute points without sorting
          for (const subroute of subroutes) {
            const subDuration = parseInt(subroute.duration);
            let timeDe = parentDuration - subDuration;

            const sameOrigin = subroute.origin === selectedRoute.origin;
            const sameDestination = subroute.destination === selectedRoute.destination;

            if (!sameOrigin && !sameDestination) {
              const matchingSub = subroutes.find(
                (sub: any) => sub.origin === selectedRoute.origin && sub.destination === subroute.destination
              );
              if (matchingSub) {
                timeDe = parseInt(matchingSub.duration) - subDuration;
              } else {
                const bridgeSub = subroutes.find(
                  (sub: any) => sub.origin === subroute.origin && sub.destination === selectedRoute.destination
                );
                if (bridgeSub) {
                  const bridgeDuration = parseInt(bridgeSub.duration) - subDuration;
                  timeDe = parentDuration - subDuration - bridgeDuration;
                } else {
                  timeDe = 0;
                }
              }
            } else if (sameOrigin && !sameDestination) {
              const extensionSub = subroutes.find(
                (sub: any) => sub.origin === subroute.origin && sub.destination === selectedRoute.destination
              );
              if (extensionSub) {
                const extraDuration = parseInt(extensionSub.duration) - subDuration;
                timeDe = parentDuration - subDuration - extraDuration;
              } else {
                timeDe = 0;
              }
            }

            const departureTime = parentDepartureTime.add(timeDe, 'hour');
            const arrivalTime = departureTime.add(subDuration, 'hour');

            pickupPoints.push(`${subroute.origin} - ${departureTime.format('HH:mm')}`);
            dropoffPoints.push(`${subroute.destination} - ${arrivalTime.format('HH:mm')}`);
          }

          pickupPoints = [...new Set(pickupPoints)];
          dropoffPoints = [...new Set(dropoffPoints)];

          const defaultPickup = pickupPoints.find(p => p.startsWith(selectedRoute.origin)) || pickupPoints[0] || '';
          const defaultDropoff = dropoffPoints.find(p => p.startsWith(selectedRoute.destination)) || dropoffPoints[0] || '';
          const currentPrice = calculateSubroutePrice(defaultPickup, defaultDropoff, {
            price: selectedRoute.price,
            subroutes,
            id: trip.id,
            route: `${selectedRoute.origin} → ${selectedRoute.destination}`,
            departureTime: trip.trip_date,
            arrivalTime: calculateArrivalTime(trip.trip_date, selectedRoute.duration),
            busType: trip.vehicle_type,
            currentPrice: selectedRoute.price,
            availableSeats: trip.available_seats,
            seats: allSeats,
            booked_seats: trip.booked_seats || [],
            pickupPoints,
            dropoffPoints,
            origin: selectedRoute.origin,
            destination: selectedRoute.destination,
            duration: parseInt(selectedRoute.duration),
            routeId: selectedRouteId
          });

          return {
            id: trip.id,
            route: `${selectedRoute.origin} → ${selectedRoute.destination}`,
            departureTime: trip.trip_date,
            arrivalTime: calculateArrivalTime(trip.trip_date, selectedRoute.duration),
            busType: trip.vehicle_type,
            price: selectedRoute.price,
            currentPrice,
            availableSeats: trip.available_seats,
            seats: allSeats,
            booked_seats: trip.booked_seats || [],
            pickupPoints,
            dropoffPoints,
            origin: selectedRoute.origin,
            destination: selectedRoute.destination,
            duration: parseInt(selectedRoute.duration),
            routeId: selectedRouteId,
            subroutes
          };
        });

        setAvailableTrips(transformedTrips);
        setCurrentStep(2);
      } else {
        setMessage('Không tìm thấy chuyến xe phù hợp');
        setFailureModal(true);
      }
    } catch (error) {
      console.error('Error fetching trips or routes:', error);
      setMessage('Đã xảy ra lỗi khi tìm chuyến xe');
      setFailureModal(true);
    }
  };

  const calculateArrivalTime = (departureTime: string, durationHours: string): string => {
    const departure = new Date(departureTime);
    departure.setHours(departure.getHours() + parseInt(durationHours));
    return departure.toISOString();
  };

  const getSeatType = (seatNumber: string) => {
    if (seatNumber.startsWith('A') || seatNumber.startsWith('B')) 
      return 'vip';
    return 'normal';
  };

  const handleSelectTrip = (trip: Trip) => {
    const defaultPickup = trip.pickupPoints.find(p => p.startsWith(trip.origin)) || trip.pickupPoints[0] || '';
    const defaultDropoff = trip.dropoffPoints.find(p => p.startsWith(trip.destination)) || trip.dropoffPoints[0] || '';
    const currentPrice = calculateSubroutePrice(defaultPickup, defaultDropoff, trip);

    setSelectedTrip({ ...trip, currentPrice });
    setSelectedSeats([]);
    setPickupPoints(trip.pickupPoints);
    setDropoffPoints(trip.dropoffPoints);
    setSelectedPickup(defaultPickup);
    setSelectedDropoff(defaultDropoff);
  };

  const handleSelectSeat = (seat: Seat) => {
    if (seat.status === 'booked') return;

    if (selectedSeats.length >= 5 && !selectedSeats.some(s => s.number === seat.number)) {
      setMessage('Vượt quá số lượng ghế cho phép');
      setFailureModal(true);
      return;
    }

    setSelectedSeats(prev => {
      const isAlreadySelected = prev.some(s => s.number === seat.number);
      
      if (isAlreadySelected) {
        return prev.filter(s => s.number !== seat.number);
      } else {
        return [...prev, {...seat, status: 'selected'}];
      }
    });
  };

  const calculateTotal = (): number => {
    if (!selectedTrip) return 0;
    return selectedSeats.length * selectedTrip.currentPrice;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePickupChange = (pickup: string) => {
    setSelectedPickup(pickup);
    if (selectedTrip) {
      const newPrice = calculateSubroutePrice(pickup, selectedDropoff, selectedTrip);
      setSelectedTrip({ ...selectedTrip, currentPrice: newPrice });
    }
  };

  const handleDropoffChange = (dropoff: string) => {
    setSelectedDropoff(dropoff);
    if (selectedTrip) {
      const newPrice = calculateSubroutePrice(selectedPickup, dropoff, selectedTrip);
      setSelectedTrip({ ...selectedTrip, currentPrice: newPrice });
    }
  };

  const handlePayment = async () => {
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!customerInfo.name || !customerInfo.phone) {
      setMessage('Vui lòng điền đầy đủ thông tin khách hàng');
      setFailureModal(true);
      return;
    }
    
    if (!phoneRegex.test(customerInfo.phone)) {
      setMessage('Số điện thoại phải có 10 chữ số');
      setFailureModal(true);
      return;
    }

    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      setMessage('Email không hợp lệ');
      setFailureModal(true);
      return;
    }

    if (selectedSeats.length === 0) {
      setMessage('Bạn chưa chọn ghế');
      setFailureModal(true);
      return;
    }

    if (!selectedPickup || !selectedDropoff) {
      setMessage('Vui lòng chọn điểm đón và điểm trả');
      setFailureModal(true);
      return;
    }

    const bookingPayload: BookingRequest = {
      phoneNumber: customerInfo.phone,
      email: customerInfo.email || '',
      customerName: customerInfo.name,
      tripId: selectedTrip?.id || '',
      seatNumbers: selectedSeats.map(seat => seat.number),
      amount: selectedTrip?.currentPrice * selectedSeats.length,
      pickupPoint: selectedPickup,
      dropoffPoint: selectedDropoff
    };

    try {
      const res_book = await supportedBooking(bookingPayload);
      if (res_book.success) {
        if (paymentMethod === 'cash') {
          await updatePaymentStatusSuccess(res_book.data.booking.id);
        }
        setBookId(res_book.data.booking.id);
        setCurrentStep(4);
      } else {
        setMessage('Đặt vé thất bại. Vui lòng kiểm tra lại thông tin.');
        setFailureModal(true);
      }
    } catch (error) {
      console.error('Error booking:', error);
      setMessage('Đã xảy ra lỗi khi đặt vé');
      setFailureModal(true);
    }
  };

  const renderSeats = () => {
    if (!selectedTrip) return null;

    const isLimousine = selectedTrip.busType === 'limousine';
    const isStandard = selectedTrip.busType === 'standard';

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
        {seatCodes.map((code, idx) =>
          code ? (
            <button
              key={code}
              onClick={() => {
                const seat = selectedTrip.seats.find(s => s.number === code);
                if (seat) handleSelectSeat(seat);
              }}
              className={`w-10 h-10 rounded flex items-center justify-center font-medium transition-all duration-200 ${
                selectedTrip.booked_seats.includes(code)
                  ? 'bg-[#D5D9DD] border-[#C0C6CC] cursor-not-allowed'
                  : selectedSeats.some(s => s.number === code)
                  ? 'bg-[#FDEDE8] border-[#F8BEAB]'
                  : 'bg-[#DEF3FF] border-[#96C5E7] hover:bg-blue-200'
              } border`}
            >
              {code}
            </button>
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

  const renderSearchForm = () => (
    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tìm chuyến xe</h2>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Điểm đi</label>
          <div className="rounded-lg relative">
            <div
              className="w-full h-12 px-4 flex items-center border border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setStartAddressSearchModalVisible(true)}
            >
              <span className={searchParams.origin ? '' : 'text-gray-400'}>
                {searchParams.origin || 'Chọn điểm đi'}
              </span>
            </div>
            {startAddressSearchModalVisible && (
              <div className="absolute z-10 top-14 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
                <div className="p-2 border-b">
                  <input
                    autoFocus
                    value={startAddressSearchQuery}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Tìm kiếm điểm đi..."
                    onChange={(e) => setStartAddressSearchQuery(e.target.value)}
                  />
                </div>
                <ul className="w-full overflow-y-auto max-h-60">
                  {(startAddressSearchQuery === '' ? availableProvinces : availableProvinces.filter((item) =>
                    item.toLowerCase().includes(startAddressSearchQuery.toLowerCase())
                  )).map((item, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchParams({...searchParams, origin: item});
                        setStartAddressSearchModalVisible(false);
                        fetchDestinationsByOrigin(item);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Điểm đến</label>
          <div className="rounded-lg relative">
            <div
              className="w-full h-12 px-4 flex items-center border border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setEndAddressSearchModalVisible(true)}
            >
              <span className={searchParams.destination ? '' : 'text-gray-400'}>
                {searchParams.destination || 'Chọn điểm đến'}
              </span>
            </div>
            {endAddressSearchModalVisible && (
              <div className="absolute z-10 top-14 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
                <div className="p-2 border-b">
                  <input
                    autoFocus
                    value={endAddressSearchQuery}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Tìm kiếm điểm đến..."
                    onChange={(e) => setEndAddressSearchQuery(e.target.value)}
                  />
                </div>
                <ul className="w-full overflow-y-auto max-h-60">
                  {(endAddressSearchQuery === '' ? availableDestinations : availableDestinations.filter((item) =>
                    item.toLowerCase().includes(endAddressSearchQuery.toLowerCase())
                  )).map((item, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchParams({...searchParams, destination: item});
                        setEndAddressSearchModalVisible(false);
                        fetchOriginsByDestination(item);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Ngày đi</label>
            <input
              type="date"
              value={searchParams.departureDate}
              onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
              min={(function() {
                const now = new Date();
                now.setHours(now.getHours() + 7);
                return now.toISOString().split('T')[0];
              })()}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Số hành khách</label>
            <select
              value={searchParams.passengerCount}
              onChange={(e) => setSearchParams({...searchParams, passengerCount: Number(e.target.value)})}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num > 1 ? 'người' : 'người'}</option>
              ))}
            </select>
          </div>
        </div>
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
                        {trip.currentPrice.toLocaleString('vi-VN')}₫
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
              {selectedTrip.busType} • Giá vé: {selectedTrip.currentPrice.toLocaleString('vi-VN')}₫/ghế
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
              {renderSeats()}
            </div>

            <div className="w-full md:w-64 flex flex-col gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Chú thích</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded bg-[#D5D9DD] border border-[#C0C6CC] mr-2"></div>
                    <span className="text-sm">Đã bán</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded bg-[#DEF3FF] border border-[#96C5E7] mr-2"></div>
                    <span className="text-sm">Còn trống</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded bg-[#FDEDE8] border border-[#F8BEAB] mr-2"></div>
                    <span className="text-sm">Đang chọn</span>
                  </div>
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-gray-800 mb-2">Ghế đã chọn</h4>
                  <p className="text-blue-600 font-medium mb-3">
                    {selectedSeats.map(s => s.number).join(', ')}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="text-blue-600 font-bold">
                      {calculateTotal().toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
            
          <button
            onClick={() => setCurrentStep(3)}
            disabled={selectedSeats.length !== searchParams.passengerCount}
            className={`w-full mt-6 py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
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
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            Thông tin đón trả
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 text-red-500 ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-medium mb-3 text-blue-600">ĐIỂM ĐÓN</h4>
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="pickup-main"
                    name="pickup-type"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked
                    readOnly
                  />
                  <label htmlFor="pickup-main" className="ml-2 block text-sm font-medium text-gray-700">
                    Điểm đón
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="pickup-transfer"
                    name="pickup-type"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled
                  />
                  <label htmlFor="pickup-transfer" className="ml-2 block text-sm font-medium text-gray-400">
                    Trung chuyển
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <select
                  value={selectedPickup}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {pickupPoints.length > 0 ? (
                    pickupPoints.map((point, index) => (
                      <option key={`pickup-${index}`} value={point}>
                        {point}
                      </option>
                    ))
                  ) : (
                    <option value="">Không có điểm đón</option>
                  )}
                </select>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  Quý khách vui lòng có mặt tại <span className="font-semibold">{selectedPickup || 'điểm đón'}</span> trước{' '}
                  <span className="font-semibold text-red-500">30 phút</span> giờ xe khởi hành để làm thủ tục lên xe.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-medium mb-3 text-blue-600">ĐIỂM TRẢ</h4>
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="dropoff-main"
                    name="dropoff-type"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked
                    readOnly
                  />
                  <label htmlFor="dropoff-main" className="ml-2 block text-sm font-medium text-gray-700">
                    Điểm trả
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="dropoff-transfer"
                    name="dropoff-type"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled
                  />
                  <label htmlFor="dropoff-transfer" className="ml-2 block text-sm font-medium text-gray-400">
                    Trung chuyển
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <select
                  value={selectedDropoff}
                  onChange={(e) => handleDropoffChange(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {dropoffPoints.length > 0 ? (
                    dropoffPoints.map((point, index) => (
                      <option key={`dropoff-${index}`} value={point}>
                        {point}
                      </option>
                    ))
                  ) : (
                    <option value="">Không có điểm trả</option>
                  )}
                </select>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Xe sẽ dừng tại điểm cuối là <span className="font-semibold">{selectedDropoff || 'điểm trả'}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              className={`p-4 border rounded-lg transition-colors flex flex-col items-center ${
                paymentMethod === 'counter'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500'
              }`}
              onClick={() => setPaymentMethod('counter')}
            >
              <div className="h-10 w-10 bg-blue-100 rounded-full mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-medium">Thanh toán tại quầy</span>
              <span className="text-sm text-gray-500 mt-1">Đến bến xe để thanh toán</span>
            </button>
            
            <button
              className={`p-4 border rounded-lg transition-colors flex flex-col items-center ${
                paymentMethod === 'cash'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500'
              }`}
              onClick={() => setPaymentMethod('cash')}
            >
              <div className="h-10 w-10 bg-blue-100 rounded-full mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="font-medium">Tiền mặt khi lên xe</span>
              <span className="text-sm text-gray-500 mt-1">Thanh toán cho nhân viên</span>
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
            disabled={!customerInfo.name || !customerInfo.phone || !paymentMethod || !selectedPickup || !selectedDropoff}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
              (!customerInfo.name || !customerInfo.phone || !paymentMethod || !selectedPickup || !selectedDropoff)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Xác nhận đặt vé {calculateTotal().toLocaleString('vi-VN')}₫
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
              <span className="font-medium">{bookId}</span>
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
              <span className="text-gray-600 w-32">Điểm đón:</span>
              <span className="font-medium">{selectedPickup}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Điểm trả:</span>
              <span className="font-medium">{selectedDropoff}</span>
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
          onClick={() => navigate(0)}
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
      <div className="flex items-center justify-center space-x-8 mt-3 px-4 sm:px-16">
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
      {failureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thông báo</h2>
              <button
                onClick={() => setFailureModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p>{message}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setFailureModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSupport;