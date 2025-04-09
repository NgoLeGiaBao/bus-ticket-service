using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;

using booking_and_payment_service.models;
using booking_and_payment_service.responses;
using booking_and_payment_service.dtos;
using booking_and_payment_service.data;
using booking_and_payment_service.rabbitmq.Messaging;

using testvnpay.Payments;

namespace booking_and_payment_service.services
{
    public class BookingService
    {
        private readonly UserDbContext _context;
        private readonly RedisService _redisService;
        private readonly IMessagePublisher _messagePublisher;


        public BookingService(UserDbContext context, RedisService redisService, IMessagePublisher messagePublisher)
        {
            _context = context;
            _redisService = redisService;
            _messagePublisher = messagePublisher;
        }

        // Create booking
        public async Task<ApiResponse<BookingResponseDto>> CreateBookingAsync(BookingRequestDto dto, string bookingBy)
        {
            try
            {
                // Check Redis for temporarily locked seats
                foreach (var seat in dto.SeatNumbers)
                {
                    string redisKey = $"booking:{dto.TripId}:{seat}";
                    if (await _redisService.KeyExistsAsync(redisKey))
                    {
                        return new ApiResponse<BookingResponseDto>(
                            false,
                            $"Seat {seat} is temporarily locked by another booking.",
                            null,
                            "SeatLocked"
                        );
                    }
                }

                // Check DB for already booked seats
                var existingBookings = await _context.Bookings
                    .Where(b => b.TripId == dto.TripId)
                    .ToListAsync();

                var bookedSeats = existingBookings.SelectMany(b => b.SeatNumbers).ToHashSet();
                var conflictSeats = dto.SeatNumbers.Where(s => bookedSeats.Contains(s)).ToList();

                if (conflictSeats.Any())
                {
                    return new ApiResponse<BookingResponseDto>(
                        false,
                        $"Seats already booked: {string.Join(", ", conflictSeats)}",
                        null,
                        "SeatConflict"
                    );
                }

                // Create Booking
                var booking = new Booking
                {
                    Id = Booking.GenerateBookingId(),
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email,
                    CustomerName = dto.CustomerName,
                    TripId = dto.TripId,
                    SeatNumbers = dto.SeatNumbers,
                    BookingTime = DateTime.UtcNow,
                    Status = bookingBy == "customer" ? "Pending" : "Booked"
                };
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                var bookingResponse = new BookingResponseDto
                {
                    booking = booking,
                    Amount = dto.Amount,
                };
                // Create Payment
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    BookingId = booking.Id,
                    Amount = dto.Amount,
                    Method = booking.Status == "Booked" ? "CASH" : "UNKNOWN",
                    PaymentTime = DateTime.UtcNow.AddHours(7),
                    Status = booking.Status == "Booked" ? "Pending" : "Waiting"
                };

                await _context.Payments.AddAsync(payment);
                await _context.SaveChangesAsync();

                // Handle seat hold and expiration for Pending booking
                if (booking.Status == "Pending")
                {
                    foreach (var seat in dto.SeatNumbers)
                    {
                        string redisSeatKey = $"booking:{dto.TripId}:{seat}";
                        await _redisService.SetKeyAsync(redisSeatKey, booking.Id, TimeSpan.FromMinutes(15));
                    }

                    string expireKey = $"booking_expire:{booking.Id}";
                    await _redisService.SetKeyAsync(expireKey, "1", TimeSpan.FromMinutes(2));
                }

                // Publish to RabbitMQ
                _messagePublisher.Publish("booking.route.created", JsonConvert.SerializeObject(booking));
                
                // Get Payment URL
                string paymentUrl = GetPaymentUrlByBookingId(booking.Id, dto.Amount);
                bookingResponse.PaymentUrl = paymentUrl;
                return new ApiResponse<BookingResponseDto>( true, "Booking created successfully.", bookingResponse, null);
            }
            catch (Exception ex)
            {
                return new ApiResponse<BookingResponseDto>(
                    false,
                    "An error occurred while creating the booking.",
                    null,
                    ex.Message
                );
            }
        }

        // Expire Booking
        public async Task<ApiResponse<bool>> ExpireBookingAsync(string bookingId)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(bookingId);
                if (booking == null)
                    return new ApiResponse<bool>(false, "Booking not found", false, "NotFound");

                // Only process if still Pending
                if (booking.Status == "Pending")
                {
                    booking.Status = "Cancelled";
                    await _context.SaveChangesAsync();

                    // Process payment if any
                    var payment = await _context.Payments.FirstOrDefaultAsync(p => p.BookingId == bookingId);
                    if (payment != null)
                    {
                        payment.Status = "Failed";
                        await _context.SaveChangesAsync();
                    }
                }

                return new ApiResponse<bool>(true, "Booking expired successfully", true, null);
            }
            catch (Exception ex)
            {
                return new ApiResponse<bool>(false, "Error expiring booking", false, ex.Message);
            }
        }

        // Get payment url by booking id
        public string GetPaymentUrlByBookingId(string bookingId, decimal amount)
        {
            VnPay vnpay = new VnPay();
            string vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            string vnpApi = "http://localhost:9503/api/payment/ipn";
            string vnpTmnCode = "XY9GJBC5";
            string vnpHashSecret = "B5V47OE9SWWMCH4MORJTVRZK4GRKEN2Y";
            string vnpReturnUrl = "http://localhost:9503/api/payment/return";
            
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnpTmnCode);
            vnpay.AddRequestData("vnp_BankCode", "NCB");
            vnpay.AddRequestData("vnp_Amount", (amount * 100).ToString()); 
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "Payment for booking:" + bookingId);
            vnpay.AddRequestData("vnp_OrderType", "other"); 
            vnpay.AddRequestData("vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_ReturnUrl", vnpReturnUrl);
            vnpay.AddRequestData("vnp_IpAddr", "127.0.0.1");
            vnpay.AddRequestData("vnp_TxnRef", bookingId); 

            string paymentUrl = vnpay.CreateRequestUrl(vnpUrl, vnpHashSecret);

            return paymentUrl;

        }













        public async Task<ApiResponse<List<Booking>>> GetAllBookingsAsync()
        {
            var bookings = await _context.Bookings.ToListAsync();
            return new ApiResponse<List<Booking>>(true, "List of bookings", bookings, null);
        }

        public async Task<ApiResponse<Booking>> GetBookingByIdAsync(string id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return new ApiResponse<Booking>(false, "Booking not found", null, "NotFound");
            }

            return new ApiResponse<Booking>(true, "Booking found", booking, null);
        }
    }
}
