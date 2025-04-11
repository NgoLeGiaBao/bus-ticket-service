import QRCode from 'react-qr-code';

// Define the ticket type for better type safety
interface Ticket {
  last_name: string;
  first_name: string;
  phone_number: string;
  email: string;
  price: string;
  ticket_id: string;
  route_name: string;
  start_time: string;
  date: string;
  seat: string;
  start_address: string;
  end_address: string;
  license: string;
}

interface LookUpResultProps {
  ticket: Ticket;
}

function LookUpResult({ ticket }: LookUpResultProps) {
  return (
    <>
      <div className="w-full flex flex-col justify-center items-center mx-auto">
        <div className="w-full border border-slate-300 rounded-xl flex flex-col my-10">
          <div className="bg-gray-100 w-full text-center p-3 rounded-t-xl text-lg font-semibold">Thông tin mua vé</div>
          <div className="flex flex-row p-5 mb-5">
            <div className="basic-1/2 w-full">
              <div className="flex flex-row">
                <div className="basis-1/4 text-gray-500 font-medium text-medium mb-2">Họ và tên:</div>
                <div className="font-semibold">
                  {ticket.last_name} {ticket.first_name}
                </div>
              </div>
              <div className="flex flex-row">
                <div className="basis-1/4 text-gray-500 font-medium text-medium mb-2">Số điện thoại:</div>
                <div className="font-semibold">{ticket.phone_number}</div>
              </div>
              <div className="flex flex-row">
                <div className="basis-1/4 text-gray-500 font-medium text-medium mb-2">Email:</div>
                <div className="font-semibold">{ticket.email}</div>
              </div>
            </div>
            <div className="basic-1/2 w-full">
              <div className="flex flex-row">
                <div className="basis-1/4 text-gray-500 font-medium text-medium mb-2">Tổng giá vé:</div>
                <div className="font-semibold basis-1/4">{ticket.price}</div>
              </div>
              <div className="flex flex-row">
                <div className="basis-1/4 text-gray-500 font-medium text-medium mb-2">PTTT:</div>
                <div className="font-semibold">VNPAY</div>
              </div>
            </div>
          </div>

          <div className="max-w-screen-sm border border-slate-300 rounded-xl mx-auto flex flex-col mb-5">
            <div className="flex justify-center items-center my-10">
              <QRCode
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '180px' }}
                value={ticket.ticket_id}
                viewBox={`0 0 256 256`}
              />
            </div>
            <div className="p-5">
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Mã đặt vé:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">{ticket.ticket_id}</div>
              </div>
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Tuyến xe:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">{ticket.route_name}</div>
              </div>
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Thời gian đi:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">
                  {ticket.start_time} - {ticket.date}
                </div>
              </div>
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Số ghế:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">{ticket.seat}</div>
              </div>
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Điểm lên xe:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">{ticket.start_address}</div>
              </div>
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Điểm xuống xe:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">{ticket.end_address}</div>
              </div>
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Giá vé:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">{ticket.price}</div>
              </div>
              <div className="flex flex-row mb-3">
                <div className="text-gray-500 font-medium basis-1/2">Biển số xe:</div>
                <div className="basis-1/2 text-end text-green-700 font-semibold">{ticket.license}</div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-b-xl p-3 text-center text-green-700 font-semibold">
              Mang vé đến văn phòng để đổi vé lên xe trước giờ xuất bến ít nhất 60 phút
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LookUpResult;
