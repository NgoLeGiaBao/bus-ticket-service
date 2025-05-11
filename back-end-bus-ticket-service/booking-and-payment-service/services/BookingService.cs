using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
        private readonly HttpClient _httpClient;


        public BookingService(UserDbContext context, RedisService redisService, IMessagePublisher messagePublisher, HttpClient httpClient)
        {
            _context = context;
            _redisService = redisService;
            _messagePublisher = messagePublisher;
            _httpClient = httpClient;
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

                var bookedSeats = existingBookings
                    .Where(b => b.Status != "Cancelled")
                    .SelectMany(b => b.SeatNumbers)
                    .ToHashSet();

                var conflictSeats = dto.SeatNumbers
                    .Where(s => bookedSeats.Contains(s))
                    .ToList();

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
                    Status = bookingBy == "customer" ? "Pending" : "Booked",
                    PickUpPoint = dto.PickUpPoint,
                    DropOffPoint = dto.DropOffPoint
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
                    await _redisService.SetKeyAsync(expireKey, "1", TimeSpan.FromMinutes(15));
                }

                // Publish to RabbitMQ
                _messagePublisher.Publish("booking.route.created", JsonConvert.SerializeObject(booking));

                // Get Payment URL
                string paymentUrl = GetPaymentUrlByBookingId(booking.Id, dto.Amount);
                bookingResponse.PaymentUrl = paymentUrl;
                return new ApiResponse<BookingResponseDto>(true, "Booking created successfully.", bookingResponse, null);
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
                        _messagePublisher.Publish("booking.route.cancelled", JsonConvert.SerializeObject(booking));
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
            string vnpApi = "http://localhost:9503/payment/ipn";
            string vnpTmnCode = "XY9GJBC5";
            string vnpHashSecret = "B5V47OE9SWWMCH4MORJTVRZK4GRKEN2Y";
            string vnpReturnUrl = "http://localhost:9503/payment/return";

            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnpTmnCode);
            vnpay.AddRequestData("vnp_BankCode", "NCB");
            vnpay.AddRequestData("vnp_Amount", (amount * 100).ToString());
            vnpay.AddRequestData("vnp_CreateDate", DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "Payment for booking:" + bookingId);
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ExpireDate", DateTime.UtcNow.AddHours(7).AddMinutes(15).ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_ReturnUrl", vnpReturnUrl);
            vnpay.AddRequestData("vnp_IpAddr", "127.0.0.1");
            vnpay.AddRequestData("vnp_TxnRef", bookingId);

            string paymentUrl = vnpay.CreateRequestUrl(vnpUrl, vnpHashSecret);

            return paymentUrl;

        }

        // Get booking by number
        public async Task<ApiResponse<List<Booking>>> GetBookingsByPhoneAsync(string phoneNumber)
        {
            var bookings = await _context.Bookings
                .Where(b => b.PhoneNumber == phoneNumber &&
                           (b.Status == "Booked" || b.Status == "Late"))
                .ToListAsync();

            if (bookings == null || bookings.Count == 0)
            {
                return new ApiResponse<List<Booking>>(false, "No bookings found", null, "NotFound");
            }

            return new ApiResponse<List<Booking>>(true, "Bookings found", bookings, null);
        }

        // Get booking by route trip
        public async Task<ApiResponse<Booking>> GetBookingBySeatAndRouteTripAsync(string seatNumber, string tripId)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.SeatNumbers.Contains(seatNumber)
                                       && b.TripId == tripId
                                       && b.Status == "Booked");

            if (booking == null)
            {
                return new ApiResponse<Booking>(false, "No booking found", null, "NotFound");
            }

            return new ApiResponse<Booking>(true, "Booking found", booking, null);
        }

        // Get confirmed booking by phone
        public async Task<ApiResponse<List<Booking>>> GetConfirmedBookingsByPhoneAsync(string phoneNumber)
        {
            var bookings = await _context.Bookings
                .Where(b => b.PhoneNumber == phoneNumber && b.Status == "Confirmed")
                .ToListAsync();

            if (bookings == null || bookings.Count == 0)
            {
                return new ApiResponse<List<Booking>>(false, "No confirmed bookings found", null, "NotFound");
            }

            return new ApiResponse<List<Booking>>(true, "Confirmed bookings found", bookings, null);
        }

        // Change seat(s)
        public async Task<ApiResponse<Booking>> ChangeSeatAsync(ChangeSeatRequestDto dto)
        {
            try
            {
                // Validate input
                if (dto.OldSeatNumbers.Count != dto.NewSeatNumbers.Count)
                    return new ApiResponse<Booking>(false, "Seat count mismatch", null, "SeatMismatch");

                //  Get the records of the conditions that can be translated into SQL
                var matchingBookings = await _context.Bookings
                    .Where(b => b.Id == dto.BookingId
                             && b.TripId == dto.OldTripId
                             && b.Status == "Booked")
                    .ToListAsync();

                // Bước 2: Compare correct seats using SequenceEqual
                var booking = matchingBookings.FirstOrDefault(b =>
                    b.SeatNumbers.OrderBy(s => s).SequenceEqual(dto.OldSeatNumbers.OrderBy(s => s))
                );

                // Check if the booking exists
                if (booking == null)
                    return new ApiResponse<Booking>(false, "Original booking not found or invalid", null, "NotFound");

                // Check Redis for temporarily locked seats
                foreach (var seat in dto.NewSeatNumbers)
                {
                    string redisKey = $"booking:{dto.NewTripId}:{seat}";
                    if (await _redisService.KeyExistsAsync(redisKey))
                    {
                        return new ApiResponse<Booking>(false, $"Seat {seat} is temporarily locked", null, "SeatLocked");
                    }
                }
                // Redis lock 2 min
                foreach (var seat in dto.NewSeatNumbers)
                {
                    string redisKey = $"booking:{dto.NewTripId}:{seat}";
                    await _redisService.SetKeyAsync(redisKey, booking.Id, TimeSpan.FromMinutes(2));
                }

                // Delete Redis key of old seat
                foreach (var oldSeat in dto.OldSeatNumbers)
                {
                    string oldRedisKey = $"booking:{dto.OldTripId}:{oldSeat}";
                    await _redisService.DeleteKeyAsync(oldRedisKey);
                }

                // Check DB for already booked seats
                var bookedSeats = await _context.Bookings
                    .Where(b => b.TripId == dto.NewTripId && b.Status == "Booked")
                    .SelectMany(b => b.SeatNumbers)
                    .ToListAsync();

                var conflictSeats = dto.NewSeatNumbers.Where(s => bookedSeats.Contains(s)).ToList();
                if (conflictSeats.Any())
                    return new ApiResponse<Booking>(false, $"Seats already booked: {string.Join(", ", conflictSeats)}", null, "SeatConflict");

                // Update booking
                booking.SeatNumbers = dto.NewSeatNumbers;
                booking.TripId = dto.NewTripId;
                booking.BookingTime = DateTime.UtcNow.AddHours(7);

                _context.Bookings.Update(booking);
                await _context.SaveChangesAsync();

                var bookingChangedEvent = new
                {
                    OldTripId = dto.OldTripId,
                    OldSeatNumbers = dto.OldSeatNumbers,
                    NewTripId = booking.TripId,
                    NewSeatNumbers = booking.SeatNumbers,
                };

                // Publish event to RabbitMQ
                _messagePublisher.Publish("booking.route.changed", JsonConvert.SerializeObject(bookingChangedEvent));

                return new ApiResponse<Booking>(true, "Booking updated successfully", booking, null);
            }
            catch (Exception ex)
            {
                return new ApiResponse<Booking>(false, "An error occurred while changing the booking", null, ex.Message);
            }
        }

        // Lookup ticket by phone and booking id
        public async Task<ApiResponse<TicketInfo>> LookupTicketAsync(string phoneNumber, string bookingId)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.PhoneNumber == phoneNumber);

            if (booking == null)
                return new ApiResponse<TicketInfo>(false, "Không tìm thấy vé với mã và số điện thoại cung cấp.", null, "NotFound");

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);

            TripLookupDto? tripDto = null;

            try
            {
                var tripResponse = await _httpClient.GetFromJsonAsync<ApiResponse<JsonElement>>(
                    $"journeys/trips/{booking.TripId}");

                if (tripResponse?.Success != true)
                {
                    // Log hoặc throw exception nếu cần
                    throw new Exception("Could not retrieve trip information.");
                }

                var data = tripResponse.Data;
                tripDto = new TripLookupDto
                {
                    TripDate = data.GetProperty("trip_date").GetDateTime(),
                    Origin = data.GetProperty("routes").GetProperty("origin").GetString()!,
                    Destination = data.GetProperty("routes").GetProperty("destination").GetString()!,
                    RouteId = data.GetProperty("routes").GetProperty("id").GetString()!,
                    LicensePlate = data.GetProperty("license_plate").GetString()!

                };
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết
                Console.WriteLine($"Error retrieving trip information: {ex.Message}");
            }

            if (tripDto == null)
            {
                return new ApiResponse<TicketInfo>(false, "No trip information found.", null, "NotFound");
            }

            TicketInfo ticketInfo = new TicketInfo
            {
                booking = booking,
                payment = payment,
                trip = tripDto
            };

            return new ApiResponse<TicketInfo>(true, "Tra cứu vé thành công", ticketInfo, null);
        }

        // Lookup tickets by phone
        public async Task<ApiResponse<List<TicketInfo>>> LookupTicketsByPhoneAsync(string phoneNumber)
        {
            var bookings = await _context.Bookings
                .Where(b => b.PhoneNumber == phoneNumber)
                .ToListAsync();

            if (bookings == null || !bookings.Any())
                return new ApiResponse<List<TicketInfo>>(false, "Không tìm thấy vé với số điện thoại cung cấp.", null, "NotFound");

            var tickets = new List<TicketInfo>();

            foreach (var booking in bookings)
            {
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.BookingId == booking.Id);

                TripLookupDto? tripDto = null;

                try
                {
                    var tripResponse = await _httpClient.GetFromJsonAsync<ApiResponse<JsonElement>>(
                        $"journeys/trips/{booking.TripId}");

                    if (tripResponse?.Success == true)
                    {
                        var data = tripResponse.Data;

                        tripDto = new TripLookupDto
                        {
                            TripDate = data.GetProperty("trip_date").GetDateTime(),
                            Origin = data.GetProperty("routes").GetProperty("origin").GetString()!,
                            Destination = data.GetProperty("routes").GetProperty("destination").GetString()!,
                            RouteId = data.GetProperty("routes").GetProperty("id").GetString()!,
                            LicensePlate = data.GetProperty("license_plate").GetString()!
                        };
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi lấy thông tin chuyến đi: {ex.Message}");
                }

                if (tripDto != null)
                {
                    tickets.Add(new TicketInfo
                    {
                        booking = booking,
                        payment = payment,
                        trip = tripDto
                    });
                }
            }

            if (!tickets.Any())
            {
                return new ApiResponse<List<TicketInfo>>(false, "Không có thông tin vé khả dụng.", null, "NotFound");
            }

            return new ApiResponse<List<TicketInfo>>(true, "Tra cứu vé thành công", tickets, null);
        }

        // Get All Ticket
        public async Task<ApiResponse<List<TicketInfo>>> GetAllTicketsAsync()
        {
            var bookings = await _context.Bookings.ToListAsync();

            if (bookings == null || !bookings.Any())
                return new ApiResponse<List<TicketInfo>>(false, "Không tìm thấy vé", null, "NotFound");

            var tickets = new List<TicketInfo>();

            foreach (var booking in bookings)
            {
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.BookingId == booking.Id);

                TripLookupDto? tripDto = null;

                try
                {
                    var tripResponse = await _httpClient.GetFromJsonAsync<ApiResponse<JsonElement>>(
                        $"journeys/trips/{booking.TripId}");

                    if (tripResponse?.Success == true)
                    {
                        var data = tripResponse.Data;
                        Console.WriteLine(data.ToString());
                        tripDto = new TripLookupDto
                        {
                            TripDate = data.GetProperty("trip_date").GetDateTime(),
                            Origin = data.GetProperty("routes").GetProperty("origin").GetString()!,
                            Destination = data.GetProperty("routes").GetProperty("destination").GetString()!,
                            RouteId = data.GetProperty("routes").GetProperty("id").GetString()!,
                            LicensePlate = data.GetProperty("license_plate").GetString()!
                        };
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi lấy thông tin chuyến đi: {ex.Message}");
                }

                if (tripDto != null)
                {
                    tickets.Add(new TicketInfo
                    {
                        booking = booking,
                        payment = payment,
                        trip = tripDto
                        
                    });
                }
            }

            if (!tickets.Any())
            {
                return new ApiResponse<List<TicketInfo>>(false, "Không có thông tin vé khả dụng.", null, "NotFound");
            }

            return new ApiResponse<List<TicketInfo>>(true, "Tra cứu vé thành công", tickets, null);
        }
    }
}
