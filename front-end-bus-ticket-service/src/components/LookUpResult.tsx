import QRCode from 'react-qr-code';

interface Ticket {
  customerName: string;
  phoneNumber: string;
  email: string;
  price: number;
  tripDate: string;
  origin: string;
  destination: string;
  paymentStatus: string;
  ticketId: string;
}

interface LookUpResultProps {
  ticket: Ticket;
}

function LookUpResult({ ticket }: LookUpResultProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; 
      
      // Format the date to "HH:MM, ngày DD tháng MM năm YYYY"
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const day = date.getDate();
      const month = date.getMonth() + 1; 
      const year = date.getFullYear();
      
      return `${hours}:${minutes}, ngày ${day} tháng ${month} năm ${year}`;
    } catch {
      return dateString;
    }
  };

  // Function to format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Determine the color based on payment status
  const paymentStatusColor = ticket.paymentStatus === 'Paid' 
    ? 'text-green-600' 
    : 'text-red-600';

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-green-700">THÔNG TIN VÉ XE</h2>
      </div>
      <hr className="max-w-screen-sm w-full mx-auto h-0.5 bg-gray-200" />


      {/* Ticket Card */}
      <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Card Header */}
        <div className="bg-green-600 py-3 px-6">
          <h3 className="text-white font-semibold text-lg">Thông tin hành khách</h3>
        </div>

        {/* Passenger Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <InfoRow label="Họ và tên" value={ticket.customerName} />
            <InfoRow label="Số điện thoại" value={ticket.phoneNumber} />
            <InfoRow label="Email" value={ticket.email} />
          </div>
          <div className="space-y-4">
            <InfoRow label="Tổng giá vé" value={formatPrice(ticket.price)} />
            <InfoRow 
              label="Trạng thái thanh toán" 
              value={ticket.paymentStatus === 'Success' ? 'Đã thanh toán' : 'Chưa thanh toán'} 
              valueClassName={paymentStatusColor}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mx-6"></div>

        {/* Trip Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="col-span-2">
            <h4 className="font-semibold text-gray-700 mb-4">Thông tin chuyến đi</h4>
            <div className="space-y-3">
              <InfoRow label="Tuyến xe" value={`${ticket.origin} → ${ticket.destination}`} />
              <InfoRow label="Thời gian khởi hành" value={formatDate(ticket.tripDate)} />
              <InfoRow label="Mã vé" value={ticket.ticketId} />
            </div>
          </div>
          
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Quét mã QR để kiểm tra vé</p>
              <div className="p-2 bg-white rounded border border-gray-200">
                <QRCode
                  size={180}
                  value={ticket.ticketId}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
            <button className="text-sm text-green-600 font-medium hover:text-green-700">
              Tải vé về
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 py-3 px-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            <span className="font-semibold">Lưu ý:</span> Vui lòng có mặt tại bến xe trước giờ khởi hành ít nhất 60 phút để làm thủ tục lên xe.
          </p>
        </div>
      </div>


    </div>
  );
}

// Helper component for consistent info rows
interface InfoRowProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

function InfoRow({ label, value, valueClassName = '' }: InfoRowProps) {
  return (
    <div className="flex">
      <span className="w-40 text-gray-500 font-medium">{label}:</span>
      <span className={`flex-1 font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}

export default LookUpResult;