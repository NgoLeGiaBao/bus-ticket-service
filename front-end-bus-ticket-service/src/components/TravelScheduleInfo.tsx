import axios from 'axios';
import { NavLink, useSearchParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getAvailableTrips } from '../services/apiServices';

function TravelScheduleInfo() {
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    getTrips();
  }, []);

  const getTrips = async () => {
    const startAddress = searchParams.get('start_address');
    const endAddress = searchParams.get('end_address');
    const date = searchParams.get('date');

    if (startAddress && endAddress && date && startAddress != "" && endAddress != "" && date != "") {
      try {
        const res = await getAvailableTrips(startAddress, endAddress, date);
        const mappedTrips = res.data.map((v: any) => {
          const tripDate = new Date(v.trip_date);
          const startTime = tripDate.toTimeString().slice(0, 5);
          const endTime = new Date(tripDate.getTime() + v.routes.duration * 60 * 60 * 1000)
            .toTimeString()
            .slice(0, 5);
          
          // Tính toán thời gian di chuyển
          const hours = Math.floor(v.routes.duration);
          const minutes = Math.round((v.routes.duration - hours) * 60);
          const durationText = `${hours > 0 ? `${hours} giờ ` : ''}${minutes > 0 ? `${minutes} phút` : ''}`;
          
          // Định dạng giá tiền
          const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(v.routes.price);

          return {
            id: v.id,
            start_address: v.routes.origin,
            end_address: v.routes.destination,
            date: tripDate.toLocaleDateString('vi-VN'),
            start_time: startTime,
            end_time: endTime,
            price: v.routes.price,
            formattedPrice,
            duration: durationText,
            distance: `${v.routes.distance} km`,
            available_seats: v.available_seats,
            vehicle_type: v.vehicle_type === 'standard' ? 'Giường nằm' : 'Limousine'
          };
        });
        
        setTrips(mappedTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } 
    }
  };



  return (
    <div className="lookupform mt-10 mb-32 mx-auto flex-1 max-w-screen-lg">
      {searchParams.get('start_address') && (
        <>
          <div className="p-6 mb-8 ">
            <h3 className="text-center text-2xl font-bold text-green-700 mb-2">
              KẾT QUẢ TÌM KIẾM: {searchParams.get('start_address')} → {searchParams.get('end_address')}
            </h3>
            <p className="text-center text-gray-600 mb-4">
              Ngày {new Date(searchParams.get('date')?.toString() || '').toLocaleDateString('vi-VN')} • 
              Tìm thấy {trips.length} chuyến
            </p>
            <hr className="w-4/5 mx-auto h-0.5 bg-gray-200 md:w-2/5" />
          </div>
        </>
      )}

      {trips.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
          <svg 
            className="w-16 h-16 mx-auto text-orange-500 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy chuyến nào phù hợp</h3>
          <p className="text-gray-500">Xin vui lòng thử lại với điểm đi/đến hoặc ngày khác</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl shadow-md border border-gray-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-50 to-red-50">
              <tr className="text-center">
                <th className="px-6 py-4 font-semibold text-gray-700">Hành trình</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Thời gian</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Khoảng cách</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Loại xe</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Giá vé</th>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center">Đặt vé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-center">
              {trips.map((v: any, i) => (
                <tr key={i} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-medium text-gray-900">
                      <span>{v.start_address}</span> → {v.end_address}
                    </div>
                    <div className="text-sm text-gray-500">{v.date}</div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="font-medium">{v.start_time} - {v.end_time}</div>
                    <div className="text-sm text-gray-500">{v.duration}</div>
                  </td>
                  <td className="px-4 py-5 text-gray-700">{v.distance}</td>
                  <td className="px-4 py-5 text-gray-700">{v.vehicle_type}</td>
                  <td className="px-4 py-5 font-semibold text-red-600">{v.formattedPrice}</td>
				  
                  <td className="px-4 py-5 text-center">
                    <NavLink
                      to={`/booking-ticket?id=${v.id}`}
                      className="inline-block text-sm font-semibold text-white hover:bg-red-600 transition-all 
                      bg-gradient-to-r from-red-500 to-orange-500 py-2 px-4 rounded-full shadow-sm"
                    >
                      Đặt vé
                    </NavLink>
                    <div className="text-xs mt-1 text-gray-500">
                      Còn {v.available_seats} chỗ
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TravelScheduleInfo;